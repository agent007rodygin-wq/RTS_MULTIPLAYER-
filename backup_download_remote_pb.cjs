const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const host = process.env.DEPLOY_HOST || '89.127.214.182';
const username = process.env.DEPLOY_USER || 'root';
const password = process.env.DEPLOY_PASSWORD;
const remotePbDir = process.env.REMOTE_PB_DIR || '/var/lib/pocketbase/pb_data';
const remoteArchive = process.env.REMOTE_PB_ARCHIVE || `/root/pb_data_backup_${Date.now()}.tar.gz`;
const localArchive = process.env.LOCAL_PB_ARCHIVE;

if (!password) {
  console.error('Missing DEPLOY_PASSWORD');
  process.exit(1);
}

if (!localArchive) {
  console.error('Missing LOCAL_PB_ARCHIVE');
  process.exit(1);
}

fs.mkdirSync(path.dirname(localArchive), { recursive: true });

function exec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      let stdout = '';
      let stderr = '';

      stream.on('data', (data) => {
        stdout += data.toString();
      });

      stream.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      stream.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed (${code}): ${command}\n${stderr || stdout}`));
        }
      });
    });
  });
}

async function safeStart(conn) {
  try {
    await exec(conn, 'systemctl start pocketbase');
    console.log('[remote] pocketbase started');
  } catch (error) {
    console.error('[remote] failed to start pocketbase:', error.message);
  }
}

async function main() {
  const conn = new Client();

  conn.on('ready', async () => {
    let stopped = false;

    try {
      console.log('[remote] stopping pocketbase...');
      await exec(conn, 'systemctl stop pocketbase');
      stopped = true;

      console.log('[remote] creating archive...');
      await exec(
        conn,
        `tar -C ${path.posix.dirname(remotePbDir)} -czf ${remoteArchive} ${path.posix.basename(remotePbDir)}`
      );

      console.log('[remote] starting pocketbase back up...');
      await exec(conn, 'systemctl start pocketbase');
      stopped = false;

      console.log('[remote] downloading archive...');
      const sftp = await new Promise((resolve, reject) => {
        conn.sftp((err, sftpClient) => {
          if (err) reject(err);
          else resolve(sftpClient);
        });
      });

      await new Promise((resolve, reject) => {
        sftp.fastGet(remoteArchive, localArchive, {}, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`[local] archive saved to ${localArchive}`);

      console.log('[remote] removing temporary archive...');
      await exec(conn, `rm -f ${remoteArchive}`);
    } catch (error) {
      console.error(error.message);
      if (stopped) {
        await safeStart(conn);
      }
      process.exitCode = 1;
    } finally {
      conn.end();
    }
  });

  conn.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });

  conn.connect({
    host,
    port: 22,
    username,
    password,
  });
}

main();
