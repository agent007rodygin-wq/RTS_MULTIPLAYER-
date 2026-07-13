const { Client } = require('ssh2');

const host = process.env.DEPLOY_HOST || '89.127.214.182';
const username = process.env.DEPLOY_USER || 'root';
const password = process.env.DEPLOY_PASSWORD;

if (!password) {
  console.error('Missing DEPLOY_PASSWORD');
  process.exit(1);
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
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
        resolve({ code, stdout, stderr });
      });
    });
  });
}

async function main() {
  const conn = new Client();

  conn.on('ready', async () => {
    try {
      const commands = [
        'ps aux | grep pocketbase | grep -v grep',
        'systemctl status pocketbase --no-pager -l 2>/dev/null | sed -n "1,20p"',
        'ls -lah /opt/pocketbase',
        'du -sh /opt/pocketbase/pb_data 2>/dev/null',
        'find /opt/pocketbase/pb_data -maxdepth 2 -type f | sed -n "1,40p"',
        'du -sh /var/lib/pocketbase/pb_data 2>/dev/null',
        'find /var/lib/pocketbase/pb_data -maxdepth 2 -type f | sed -n "1,40p"',
      ];

      for (const command of commands) {
        const result = await exec(conn, command);
        console.log('---CMD---');
        console.log(command);
        const text = (result.stdout || result.stderr || `[exit ${result.code}]`).trim();
        console.log(text);
      }
    } catch (error) {
      console.error(error);
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
