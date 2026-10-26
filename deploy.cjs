const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Client } = require('ssh2');
const { getBuildInfo } = require('./scripts/build-version.cjs');

const PROJECT_DIR = __dirname;
const DIST_DIR = path.join(PROJECT_DIR, 'dist');
const DEFAULT_HOST = '89.127.214.182';
const DEFAULT_USER = 'root';
const DEFAULT_REMOTE_DIR = '/var/www/basingselegions';
const DEPLOY_LOG_PATH = path.join(PROJECT_DIR, 'deploy.log');

function readArg(name) {
  const prefix = `${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getConfig() {
  const fastMode = hasFlag('--fast') || process.env.DEPLOY_FAST === '1';
  return {
    host: readArg('--host') || process.env.DEPLOY_HOST || DEFAULT_HOST,
    user: readArg('--user') || process.env.DEPLOY_USER || DEFAULT_USER,
    password: readArg('--password') || process.env.DEPLOY_PASSWORD,
    remoteDir: readArg('--remote-dir') || process.env.DEPLOY_REMOTE_DIR || DEFAULT_REMOTE_DIR,
    includeMusic: hasFlag('--include-music') || (!fastMode && process.env.DEPLOY_INCLUDE_MUSIC === '1'),
    includeAnimation: hasFlag('--include-animation') || (!fastMode && process.env.DEPLOY_INCLUDE_ANIMATION === '1'),
    allowDirty: hasFlag('--allow-dirty') || process.env.DEPLOY_ALLOW_DIRTY === '1',
    fastMode,
  };
}

function shouldSkipAsset(relParts, options) {
  if (!options.includeMusic && relParts.includes('music')) {
    return true;
  }
  if (!options.includeAnimation && relParts.includes('animation')) {
    return true;
  }
  return false;
}

function collectFiles(rootDir, options) {
  const files = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const full = path.join(currentDir, entry.name);
      const rel = path.relative(rootDir, full);
      const relParts = rel.split(path.sep);

      if (shouldSkipAsset(relParts, options)) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        files.push(rel.replace(/\\/g, '/'));
      }
    }
  }

  walk(rootDir);
  files.sort();
  return files;
}

function runBuild() {
  const viteCli = path.join(PROJECT_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
  console.log('Building project...');
  execFileSync(process.execPath, [viteCli, 'build'], { stdio: 'inherit', cwd: PROJECT_DIR });
}

function writeTarList(files, listPath) {
  fs.writeFileSync(listPath, `${files.join('\n')}\n`, 'utf8');
}

function createArchive(options) {
  const files = collectFiles(DIST_DIR, options);
  if (files.length === 0) {
    throw new Error('No files found in dist to archive.');
  }

  const tarPath = path.join(PROJECT_DIR, 'dist.tar');
  const stageDir = path.join(os.tmpdir(), `deploy-stage-${Date.now()}`);
  fs.rmSync(stageDir, { recursive: true, force: true });
  fs.mkdirSync(stageDir, { recursive: true });

  try {
    const excluded = [];
    if (!options.includeMusic) excluded.push('music');
    if (!options.includeAnimation) excluded.push('animation');
    console.log(`Preparing staging copy with ${files.length} files${excluded.length ? ` (${excluded.join(' + ')} excluded)` : ''}...`);
    fs.cpSync(DIST_DIR, stageDir, {
      recursive: true,
      filter: (src) => {
        const rel = path.relative(DIST_DIR, src);
        if (!rel) {
          return true;
        }
        if (shouldSkipAsset(rel.split(path.sep), options)) {
          return false;
        }
        return true;
      },
    });

    console.log('Archiving staged files...');
    execFileSync('tar.exe', ['-cf', tarPath, '-C', stageDir, '.'], {
      stdio: 'inherit',
      cwd: PROJECT_DIR,
    });
  } finally {
    try {
      fs.rmSync(stageDir, { recursive: true, force: true });
    } catch {}
  }

  return tarPath;
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
      tryKeyboard: false,
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

      let stderr = '';

      stream.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Remote command failed with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`));
        }
      });

      stream.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      stream.on('data', (data) => {
        process.stdout.write(data);
      });
    });
  });
}

async function uploadAndDeploy(archivePath, config) {
  const conn = await connectSSH(config);

  try {
    console.log('Uploading archive to VPS...');
    const sftp = await new Promise((resolve, reject) => {
      conn.sftp((err, sftpClient) => {
        if (err) reject(err);
        else resolve(sftpClient);
      });
    });

    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(archivePath);
      const writeStream = sftp.createWriteStream('/root/dist.tar');

      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('close', resolve);
      readStream.pipe(writeStream);
    });

    console.log('Deploying on VPS...');
    const preservedDirs = [];
    if (!config.includeMusic) preservedDirs.push('music');
    if (!config.includeAnimation) preservedDirs.push('animation');
    const findExcludes = preservedDirs.map((dir) => `! -name ${dir}`).join(' ');
    await execRemote(
      conn,
      [
        `mkdir -p ${config.remoteDir}`,
        `find ${config.remoteDir} -mindepth 1 -maxdepth 1 ${findExcludes} -exec rm -rf {} +`,
        `tar -xf /root/dist.tar -C ${config.remoteDir}`,
        `rm -f /root/dist.tar`,
        `systemctl reload nginx || true`,
        `echo '--- index.html ---' && head -n 10 ${config.remoteDir}/index.html`,
        `echo '--- version.json ---' && cat ${config.remoteDir}/version.json 2>/dev/null || echo 'version.json MISSING'`,
        `echo '--- music dir ---' && if [ -d ${config.remoteDir}/music ]; then ls -1 ${config.remoteDir}/music | head; else echo 'music missing'; fi`,
        `echo '--- animation dir ---' && if [ -d ${config.remoteDir}/animation ]; then ls -1 ${config.remoteDir}/animation | head; else echo 'animation missing'; fi`,
      ].join(' && ')
    );

    console.log('Deployment complete!');
  } finally {
    conn.end();
  }
}

async function main() {
  const config = getConfig();

  if (!config.password) {
    throw new Error('Missing DEPLOY_PASSWORD or --password. Provide the VPS password through an env var or CLI flag.');
  }

  // Build-time metadata: produce version.json before build so it lands inside dist/.
  const buildInfo = getBuildInfo({ sourceDir: PROJECT_DIR, distDir: DIST_DIR, write: false });

  // Dirty tree guard — block by default to prevent shipping uncommitted work.
  if (buildInfo.dirty && !config.allowDirty) {
    const msg = [
      'Deploy blocked: working tree is dirty.',
      `  Commit : ${buildInfo.commit}`,
      `  Branch : ${buildInfo.branch}`,
      `  Status : uncommitted or untracked files present`,
      '',
      'To proceed anyway, re-run with --allow-dirty only if you understand',
      'that the production deploy will not match any committed revision and',
      'git-based traceability will be unreliable for this deploy.',
    ].join('\n');
    console.error(msg);
    process.exit(1);
  }

  if (buildInfo.dirty && config.allowDirty) {
    console.warn(`Warning: deploying a dirty working tree (commit=${buildInfo.commit}, branch=${buildInfo.branch}).`);
  }

  console.log('--- Deploy metadata ---');
  console.log(`  commit    : ${buildInfo.commit}`);
  console.log(`  short     : ${buildInfo.shortCommit}`);
  console.log(`  branch    : ${buildInfo.branch}`);
  console.log(`  buildDate : ${buildInfo.buildDate}`);
  console.log(`  version   : ${buildInfo.version}`);
  console.log(`  dirty     : ${buildInfo.dirty}`);
  console.log(`  buildId   : ${buildInfo.buildId}`);
  console.log(`  node      : ${buildInfo.nodeVersion}`);
  console.log(`  vite      : ${buildInfo.viteVersion}`);
  console.log(`  machine   : ${buildInfo.buildMachine}`);
  console.log(`  dest      : ${config.user}@${config.host}:${config.remoteDir}`);
  console.log('-----------------------');

  runBuild();

  // After build, write dist/version.json so it ships with the bundle.
  getBuildInfo({ sourceDir: PROJECT_DIR, distDir: DIST_DIR, write: true });
  console.log(`Wrote ${path.join(DIST_DIR, 'version.json')}`);

  // Append a persistent entry to deploy.log so old deploys remain auditable.
  try {
    const entry = [
      `[${new Date().toISOString()}]`,
      `commit=${buildInfo.commit}`,
      `short=${buildInfo.shortCommit}`,
      `branch=${buildInfo.branch}`,
      `version=${buildInfo.version}`,
      `dirty=${buildInfo.dirty}`,
      `buildId=${buildInfo.buildId}`,
      `node=${buildInfo.nodeVersion}`,
      `vite=${buildInfo.viteVersion}`,
      `machine=${buildInfo.buildMachine}`,
      `dest=${config.user}@${config.host}:${config.remoteDir}`,
      `mode=${config.fastMode ? 'fast' : 'custom'}`,
      `music=${config.includeMusic ? 'include' : 'skip'}`,
      `animation=${config.includeAnimation ? 'include' : 'skip'}`,
    ].join(' ') + '\n';
    fs.appendFileSync(DEPLOY_LOG_PATH, entry, 'utf8');
  } catch (e) {
    console.warn(`Warning: could not append to deploy.log: ${e.message}`);
  }

  console.log(
    `Deploy mode: ${config.fastMode ? 'fast' : 'custom'} | music: ${config.includeMusic ? 'include' : 'skip'} | animation: ${config.includeAnimation ? 'include' : 'skip'}`
  );
  const archivePath = createArchive({
    includeMusic: config.includeMusic,
    includeAnimation: config.includeAnimation,
  });

  try {
    await uploadAndDeploy(archivePath, config);
  } finally {
    try {
      fs.unlinkSync(archivePath);
    } catch {}
  }
}

main().catch((error) => {
  console.error('Deploy failed:', error.message);
  process.exit(1);
});
