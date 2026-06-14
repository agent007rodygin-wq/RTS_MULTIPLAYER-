const { execSync } = require('child_process');
const path = require('path');

const nodeExe = process.execPath;
const viteCli = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');

const isFull = process.argv.includes('--full');

try {
  console.log("Building project...");
  execSync(`"${nodeExe}" "${viteCli}" build`, { stdio: 'inherit' });
  
  console.log("Archiving...");
  if (isFull) {
    console.log("Performing full archive (including music and animations)...");
    execSync('tar.exe -cf dist.tar -C dist .', { stdio: 'inherit' });
  } else {
    console.log("Performing fast archive (excluding music and animations)...");
    execSync('tar.exe --exclude="music" --exclude="animation" -cf dist.tar -C dist .', { stdio: 'inherit' });
  }
  
  console.log("Copying to VPS...");
  execSync('scp dist.tar root@89.127.214.182:/root/', { stdio: 'inherit' });
  
  console.log("Deploying on VPS...");
  if (isFull) {
    execSync('ssh root@89.127.214.182 "rm -rf /var/www/basingselegions/* && tar -xf /root/dist.tar -C /var/www/basingselegions/ && rm /root/dist.tar"', { stdio: 'inherit' });
  } else {
    const cleanupCmd = 'find /var/www/basingselegions/ -mindepth 1 -maxdepth 1 ! -name \'music\' ! -name \'animation\' -exec rm -rf {} +';
    execSync(`ssh root@89.127.214.182 "${cleanupCmd} && tar -xf /root/dist.tar -C /var/www/basingselegions/ && rm /root/dist.tar"`, { stdio: 'inherit' });
  }
  
  console.log("Deployment complete!");
} catch (e) {
  console.error("Deploy failed:", e);
}
