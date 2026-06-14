const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const HOST = '89.127.214.182';
const USER = 'root';
const PASS = 'urFwVFvwgA34QIBQ';
const REMOTE_DIR = '/var/www/basingselegions';
const LOCAL_DIR = path.join(__dirname, 'dist');

const FILES = [
  ['index.html', 'index.html'],
  ['assets/index-D6I0UIDF.js', 'assets/index-D6I0UIDF.js'],
  ['assets/index-D6I0UIDF.js.map', 'assets/index-D6I0UIDF.js.map'],
  ['assets/4ad7fd6bdd364b3ea7df7491510ab3fa-CTx7qoMN.mp4', 'assets/4ad7fd6bdd364b3ea7df7491510ab3fa-CTx7qoMN.mp4'],
  ['assets/ChatGPT Image 1 июн. 2026 г._ 18_27_12-BsQS6YlQ.png', 'assets/ChatGPT Image 1 июн. 2026 г._ 18_27_12-BsQS6YlQ.png'],
  ['assets/ChatGPT Image 31 мая 2026 г._ 02_29_49--0mRTgDd.png', 'assets/ChatGPT Image 31 мая 2026 г._ 02_29_49--0mRTgDd.png'],
];

function remotePath(relPath) {
  return `${REMOTE_DIR}/${relPath}`.replace(/\\/g, '/');
}

function localPath(relPath) {
  return path.join(LOCAL_DIR, relPath);
}

async function uploadFile(sftp, local, remote) {
  await fs.promises.mkdir(path.dirname(local), { recursive: true });
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(local);
    const writeStream = sftp.createWriteStream(remote);
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('close', resolve);
    readStream.pipe(writeStream);
  });
}

async function exec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (data) => { stdout += data.toString(); process.stdout.write(data); });
      stream.stderr.on('data', (data) => { stderr += data.toString(); process.stderr.write(data); });
      stream.on('close', (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`remote command failed with code ${code}`));
      });
    });
  });
}

async function deploy() {
  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn.on('ready', async () => {
      try {
        console.log('Connected to VPS!');

        await exec(conn, `mkdir -p ${REMOTE_DIR}/assets`);
        await exec(conn, `rm -f ${REMOTE_DIR}/assets/index-*.js ${REMOTE_DIR}/assets/index-*.js.map`);

        console.log('Uploading changed files...');
        const sftp = await new Promise((resolveSftp, rejectSftp) => {
          conn.sftp((err, sftpClient) => {
            if (err) rejectSftp(err);
            else resolveSftp(sftpClient);
          });
        });

        for (const [localRel, remoteRel] of FILES) {
          const local = localPath(localRel);
          const remote = remotePath(remoteRel);
          if (!fs.existsSync(local)) {
            throw new Error(`Missing local file: ${local}`);
          }
          console.log(`Uploading ${remoteRel}...`);
          await uploadFile(sftp, local, remote);
        }

        console.log('Reloading nginx...');
        await exec(conn, `systemctl reload nginx || true`);
        await exec(conn, `echo '--- index.html (first 10 lines) ---' && head -n 10 ${REMOTE_DIR}/index.html && echo '--- assets/index-* list ---' && ls -1 ${REMOTE_DIR}/assets/index-*.js`);

        console.log('Deployment complete!');
        conn.end();
        resolve();
      } catch (e) {
        try { conn.end(); } catch {}
        reject(e);
      }
    });

    conn.on('error', reject);
    conn.connect({
      host: HOST,
      port: 22,
      username: USER,
      password: PASS,
    });
  });
}

deploy().catch(e => { console.error('Deploy failed:', e.message); process.exit(1); });
