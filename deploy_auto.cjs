const { execSync } = require('child_process');

// Deploy with password via environment variable
const PASS = 'urFwVFvwgA34QIBQ';
const HOST = 'root@89.127.214.182';

try {
  console.log("Build already done. Copying to VPS...");
  
  // Use sshpass if available, otherwise try plink/putty approach
  try {
    execSync(`sshpass -p "${PASS}" scp -o StrictHostKeyChecking=no dist.tar ${HOST}:/root/`, { stdio: 'inherit' });
  } catch (e) {
    // Fallback: use plink from PuTTY
    try {
      execSync(`plink -pw ${PASS} -batch ${HOST} "echo test"`, { stdio: 'inherit' });
      execSync(`pscp -pw ${PASS} -batch dist.tar ${HOST}:/root/`, { stdio: 'inherit' });
    } catch (e2) {
      console.log("Neither sshpass nor plink available. Trying scp directly (will need manual password)...");
      execSync(`scp -o StrictHostKeyChecking=no dist.tar ${HOST}:/root/`, { stdio: 'inherit' });
    }
  }
  
  console.log("Deploying on VPS...");
  try {
    execSync(`sshpass -p "${PASS}" ssh -o StrictHostKeyChecking=no ${HOST} "rm -rf /var/www/basingselegions/* && tar -xf /root/dist.tar -C /var/www/basingselegions/ && rm /root/dist.tar"`, { stdio: 'inherit' });
  } catch (e) {
    try {
      execSync(`plink -pw ${PASS} -batch ${HOST} "rm -rf /var/www/basingselegions/* && tar -xf /root/dist.tar -C /var/www/basingselegions/ && rm /root/dist.tar"`, { stdio: 'inherit' });
    } catch (e2) {
      execSync(`ssh -o StrictHostKeyChecking=no ${HOST} "rm -rf /var/www/basingselegions/* && tar -xf /root/dist.tar -C /var/www/basingselegions/ && rm /root/dist.tar"`, { stdio: 'inherit' });
    }
  }
  
  console.log("Deployment complete!");
} catch (e) {
  console.error("Deploy failed:", e.message);
}
