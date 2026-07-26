// Build-time metadata read at runtime. The deployed build serves /version.json
// from the same directory as index.html; production code reads it via fetch.
// If the file is missing (e.g., local dev without deploy), buildInfo falls back
// to "unknown" rather than throwing — the banner stays opt-in and harmless.

export interface BuildInfo {
  commit: string;
  shortCommit: string;
  branch: string;
  buildDate: string;
  version: string;
  dirty: boolean;
  buildId: string;
  buildMachine: string;
  nodeVersion: string;
  viteVersion: string;
}

const UNKNOWN_BUILD_INFO: BuildInfo = {
  commit: 'unknown',
  shortCommit: 'unknown',
  branch: 'unknown',
  buildDate: 'unknown',
  version: '0.0.0',
  dirty: false,
  buildId: 'unknown',
  buildMachine: 'unknown',
  nodeVersion: 'unknown',
  viteVersion: 'unknown',
};

let cached: BuildInfo | null = null;
let inflight: Promise<BuildInfo> | null = null;

export function getBuildInfo(): Promise<BuildInfo> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/version.json', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        cached = { ...UNKNOWN_BUILD_INFO, ...data } as BuildInfo;
        return cached;
      }
    } catch {}
    cached = UNKNOWN_BUILD_INFO;
    return cached;
  })();
  return inflight;
}
