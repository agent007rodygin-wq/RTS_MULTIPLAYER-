const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const PROJECT_DIR = __dirname;
const LOCAL_HOOKS_DIR = path.join(PROJECT_DIR, 'pb_hooks');
const DEFAULT_HOST = '89.127.214.182';
const DEFAULT_USER = 'root';
const DEFAULT_REMOTE_HOOKS_DIR = '/opt/pocketbase/pb_hooks';
const DEFAULT_SERVICE = 'pocketbase';

const HOOK_FILES = ['main.pb.js', 'tree_server_utils.js'];

function readArg(name) {
  const prefix = `${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function getConfig() {
  return {
    host: readArg('--host') || process.env.DEPLOY_HOST || DEFAULT_HOST,
    user: readArg('--user') || process.env.DEPLOY_USER || DEFAULT_USER,
    password: readArg('--password') || process.env.DEPLOY_PASSWORD,
    remoteHooksDir: readArg('--remote-hooks-dir') || process.env.PB_HOOKS_REMOTE_DIR || DEFAULT_REMOTE_HOOKS_DIR,
    service: readArg('--service') || process.env.PB_SERVICE_NAME || DEFAULT_SERVICE,
  };
}

function ensureLocalHooks() {
  for (const fileName of HOOK_FILES) {
    const fullPath = path.join(LOCAL_HOOKS_DIR, fileName);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing local hook file: ${fullPath}`);
    }
  }
}

function connectSSH({ host, user, password }) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn));
    conn.on('error', reject);
    conn.connect({
      host,
      port: 22,
      username: user,
      password,
    });
  });
}

function execRemote(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      let stdout = '';
      let stderr = '';

      stream.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        process.stdout.write(text);
      });

      stream.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        process.stderr.write(text);
      });

      stream.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Remote command failed with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`));
        }
      });
    });
  });
}

function getSftp(conn) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) reject(err);
      else resolve(sftp);
    });
  });
}

function uploadFile(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(localPath);
    const writeStream = sftp.createWriteStream(remotePath);

    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('close', resolve);
    readStream.pipe(writeStream);
  });
}

async function main() {
  const config = getConfig();
  if (!config.password) {
    throw new Error('Missing DEPLOY_PASSWORD or --password.');
  }

  ensureLocalHooks();
  const conn = await connectSSH(config);

  try {
    const backupStamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    console.log(`[deploy] remote hooks dir: ${config.remoteHooksDir}`);
    await execRemote(
      conn,
      [
        `mkdir -p ${config.remoteHooksDir}`,
        `for f in ${HOOK_FILES.map((file) => `"${file}"`).join(' ')}; do if [ -f ${config.remoteHooksDir}/$f ]; then cp ${config.remoteHooksDir}/$f ${config.remoteHooksDir}/$f.bak.${backupStamp}; fi; done`,
      ].join(' && ')
    );

    const sftp = await getSftp(conn);
    for (const fileName of HOOK_FILES) {
      const localPath = path.join(LOCAL_HOOKS_DIR, fileName);
      const remotePath = `${config.remoteHooksDir}/${fileName}`;
      console.log(`[upload] ${fileName}`);
      await uploadFile(sftp, localPath, remotePath);
    }

    console.log('[deploy] restarting pocketbase service...');
    await execRemote(
      conn,
      [
        `systemctl restart ${config.service}`,
        `systemctl status ${config.service} --no-pager -l | sed -n '1,40p'`,
        `echo '--- hooks ---' && ls -lah ${config.remoteHooksDir}`,
        `echo '--- health ---'`,
        `ok=''`,
        `for i in $(seq 1 70); do if curl -fsS http://127.0.0.1:8090/api/health >/tmp/pb_health.out 2>/tmp/pb_health.err; then ok=1; cat /tmp/pb_health.out; break; fi; sleep 2; done`,
        `if [ -z "$ok" ]; then echo 'Health check failed after restart'; cat /tmp/pb_health.err 2>/dev/null || true; journalctl -u ${config.service} -n 60 --no-pager; exit 1; fi`,
      ].join(' && ')
    );

    console.log('[done] tree server hooks deployed');
  } finally {
    conn.end();
  }
}

main().catch((error) => {
  console.error('[fatal]', error.message || error);
  process.exit(1);
});
