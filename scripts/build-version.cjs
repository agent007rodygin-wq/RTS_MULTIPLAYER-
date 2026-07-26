// Build-time metadata generator for deployment traceability.
// Used by deploy.cjs to produce dist/version.json.
// Pure read-only: never modifies the working tree.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── Frozen version.json schema (v1) ─────────────────────────────────────────
// This is the canonical field set and ordering for dist/version.json.
// Field names MUST NOT be renamed, removed, or repurposed without bumping
// the schema version and updating consumers (src/buildInfo.ts, docs).
// Add-only changes (new optional fields) are permitted; existing fields
// keep their name and type.
const VERSION_JSON_SCHEMA = [
  { name: 'version',        type: 'string',  source: 'package.json#version (fallback "0.0.0")' },
  { name: 'commit',         type: 'string',  source: 'git rev-parse HEAD (fallback "unknown")' },
  { name: 'shortCommit',    type: 'string',  source: 'first 7 chars of commit (fallback "unknown")' },
  { name: 'branch',         type: 'string',  source: 'git rev-parse --abbrev-ref HEAD (fallback "unknown")' },
  { name: 'buildDate',      type: 'string',  source: 'new Date().toISOString()' },
  { name: 'buildId',        type: 'string',  source: 'derived: <commit12>-<compactISOBuildDate>' },
  { name: 'dirty',          type: 'boolean', source: 'git status --porcelain has any non-empty line' },
  { name: 'buildMachine',   type: 'string',  source: 'COMPUTERNAME || HOSTNAME || os.hostname() (fallback "unknown")' },
  { name: 'nodeVersion',    type: 'string',  source: 'process.versions.node prefixed with "v" (fallback "unknown")' },
  { name: 'viteVersion',    type: 'string',  source: 'node_modules/vite/package.json#version (fallback "unknown")' },
];
const VERSION_JSON_SCHEMA_VERSION = 1;

function tryGit(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getDirtyFlag(sourceDir) {
  try {
    const out = execFileSync('git', ['status', '--porcelain'], { cwd: sourceDir, encoding: 'utf8' });
    return out.split(/\r?\n/).some((line) => line && line.trim().length > 0);
  } catch {
    return false;
  }
}

function readPackageVersion(sourceDir) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8'));
    return typeof pkg.version === 'string' && pkg.version.length ? pkg.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function readViteVersion(sourceDir) {
  try {
    const p = path.join(sourceDir, 'node_modules', 'vite', 'package.json');
    if (fs.existsSync(p)) {
      const v = JSON.parse(fs.readFileSync(p, 'utf8'));
      return typeof v.version === 'string' ? v.version : 'unknown';
    }
  } catch {}
  return 'unknown';
}

function shortHash(input) {
  if (!input || input === 'unknown') return 'unknown';
  return input.slice(0, 7);
}

// ─── buildId construction ───────────────────────────────────────────────────
// Deterministic derivation:
//   - Take the SHA-1 of `git rev-parse HEAD` (or "unknown" when not in a git repo).
//   - Use the first 12 hex chars as commit prefix (matches git's default short
//     SHA length, gives plenty of entropy for everyday deploy counts).
//   - Take buildDate (ISO-8601 UTC: YYYY-MM-DDTHH:MM:SS.sssZ) and strip every
//     character that isn't a digit or 'T', then keep the first 15 chars.
//     Result is compact-ISO of shape "YYYYMMDDTHHMMSS" — fixed-length,
//     lexicographically sortable, single timezone (UTC).
//   - Concatenate as `<commit12>-<compactBuildDate>`.
// Properties:
//   - Deterministic given the same git commit and same build second.
//   - Unique per (commit, build second). Two builds in different seconds differ
//     in the date half; two builds in the same second from different commits
//     differ in the commit half.
//   - Always 30 chars max ("unknown" padded as needed when git is unavailable).
//   - URL-safe, filename-safe, JSON-safe (no quotes, no slashes).
function makeBuildId({ commit, buildDate }) {
  const c = commit && commit !== 'unknown' ? commit.slice(0, 12) : 'unknown';
  const d = (buildDate || '').replace(/[^0-9T]/g, '').slice(0, 15);
  return `${c}-${d}`;
}

/**
 * Returns the build-info object, or writes it to distDir/version.json if options.write=true.
 * The returned/written object's keys and order match VERSION_JSON_SCHEMA (frozen v1).
 * @param {{ sourceDir: string, distDir?: string, write?: boolean }} options
 */
function getBuildInfo(options) {
  const sourceDir = options && options.sourceDir ? options.sourceDir : process.cwd();
  const commit = tryGit(['rev-parse', 'HEAD'], sourceDir);
  const branch = tryGit(['rev-parse', '--abbrev-ref', 'HEAD'], sourceDir);
  const buildDate = new Date().toISOString();
  const dirty = getDirtyFlag(sourceDir);
  const version = readPackageVersion(sourceDir);
  const viteVersion = readViteVersion(sourceDir);
  const nodeVersion = process.versions && process.versions.node ? `v${process.versions.node}` : 'unknown';
  const buildMachine = (process.env.COMPUTERNAME || process.env.HOSTNAME || os.hostname() || 'unknown');
  const buildId = makeBuildId({ commit, buildDate });
  // Build the object in the exact frozen-schema order.
  const info = {
    version,
    commit,
    shortCommit: shortHash(commit),
    branch,
    buildDate,
    buildId,
    dirty,
    buildMachine,
    nodeVersion,
    viteVersion,
  };
  if (options && options.distDir && options.write) {
    fs.mkdirSync(options.distDir, { recursive: true });
    fs.writeFileSync(
      path.join(options.distDir, 'version.json'),
      JSON.stringify(info, null, 2) + '\n',
      'utf8'
    );
  }
  return info;
}

module.exports = {
  getBuildInfo,
  VERSION_JSON_SCHEMA,
  VERSION_JSON_SCHEMA_VERSION,
};
