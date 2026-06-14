import { execSync } from 'child_process';
try {
  const result = execSync('npm run build', { 
    encoding: 'utf8' 
  });
  console.log(result);
} catch (e) {
  console.error("BUILD ERROR:");
  console.error(e.stdout);
  console.error(e.stderr);
}
