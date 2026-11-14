import PocketBase, { RecordModel, BaseAuthStore, AuthModel } from 'pocketbase';
import { ZONE_SIZE } from './world.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

// ─── PocketBase Client ──────────────────────────────────────────────────────
// Dynamically resolves to window.location.origin so any client (LAN, WAN, or tunnel)
// seamlessly accesses PocketBase via Vite's proxy without needing multiple ports.
const getInitialPbUrl = (): string => {
  const envUrl = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_PB_URL;
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://127.0.0.1:8090';
};
const RESOLVED_PB_URL = getInitialPbUrl();

// ─── Cached auth store ──────────────────────────────────────────────────────
// The SDK's LocalAuthStore re-reads and re-parses the whole auth blob from
// localStorage on EVERY `authStore.token` / `.model` / `.isValid` access.
// Measured on the live game: ~35 parses/sec at idle (one ~3.6KB JSON.parse per
// realtime event + per request), which is constant main-thread/GC pressure.
// This subclass keeps the parsed values in memory and touches localStorage
// only on save/clear and on cross-tab 'storage' events — same observable
// behavior, no per-access parsing.
class CachedAuthStore extends BaseAuthStore {
  private static readonly STORAGE_KEY = 'pocketbase_auth';
  private readonly storageFallback: Record<string, string> = {};
  private cachedToken = '';
  private cachedModel: AuthModel = null;
  private cacheReady = false;

  constructor() {
    super();
    this.bindStorageEvent();
  }

  private loadCache(): void {
    if (this.cacheReady) return;
    const raw = this.storageGet(CachedAuthStore.STORAGE_KEY) as { token?: string; model?: AuthModel } | string;
    const parsed = (raw && typeof raw === 'object' ? raw : {}) as { token?: string; model?: AuthModel };
    this.cachedToken = parsed.token || '';
    this.cachedModel = parsed.model ?? null;
    this.cacheReady = true;
  }

  get token(): string {
    this.loadCache();
    return this.cachedToken;
  }

  get model(): AuthModel {
    this.loadCache();
    return this.cachedModel;
  }

  save(token: string, model?: AuthModel): void {
    this.cachedToken = token || '';
    this.cachedModel = model ?? null;
    this.cacheReady = true;
    this.storageSet(CachedAuthStore.STORAGE_KEY, { token: this.cachedToken, model: this.cachedModel });
    super.save(this.cachedToken, this.cachedModel);
  }

  clear(): void {
    this.cachedToken = '';
    this.cachedModel = null;
    this.cacheReady = true;
    this.storageRemove(CachedAuthStore.STORAGE_KEY);
    super.clear();
  }

  private storageGet(key: string): unknown {
    if (typeof window !== 'undefined' && window?.localStorage) {
      const raw = window.localStorage.getItem(key) || '';
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    return this.storageFallback[key];
  }

  private storageSet(key: string, value: unknown): void {
    if (typeof window !== 'undefined' && window?.localStorage) {
      let serialized: string;
      try {
        serialized = JSON.stringify(value);
      } catch {
        return;
      }
      window.localStorage.setItem(key, serialized);
    } else {
      this.storageFallback[key] = JSON.stringify(value);
    }
  }

  private storageRemove(key: string): void {
    if (typeof window !== 'undefined' && window?.localStorage) {
      window.localStorage.removeItem(key);
    }
    delete this.storageFallback[key];
  }

  // Cross-tab sync: another tab may save/clear the auth store. Update the
  // in-memory cache first, then let BaseAuthStore.notify its listeners.
  private bindStorageEvent(): void {
    if (typeof window === 'undefined' || !window?.localStorage || !window.addEventListener) return;
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key !== CachedAuthStore.STORAGE_KEY) return;
      const raw = this.storageGet(CachedAuthStore.STORAGE_KEY) as { token?: string; model?: AuthModel } | string;
      const parsed = (raw && typeof raw === 'object' ? raw : {}) as { token?: string; model?: AuthModel };
      this.cachedToken = parsed.token || '';
      this.cachedModel = parsed.model ?? null;
      this.cacheReady = true;
      super.save(this.cachedToken, this.cachedModel);
    });
  }
}

export const pb = new PocketBase(RESOLVED_PB_URL, new CachedAuthStore());
// Keep auth token alive automatically
pb.autoCancellation(false);
const PB_BUILD_MARKER = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_BUILD_MARKER || 'local-dev';
const PB_BUILD_MODE = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.MODE || 'unknown';
console.log(`[POCKETBASE STARTUP] buildMarker=${PB_BUILD_MARKER} mode=${PB_BUILD_MODE} baseUrl=${pb.baseUrl}`);

// ─── Global Request Queue to prevent ERR_INSUFFICIENT_RESOURCES ─────────────
const PB_DEBUG_ENABLED = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_DEBUG === '1'
  || (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_VERBOSE_DEBUG === '1';
const PB_RUNTIME_AUDIT_ENABLED = PB_DEBUG_ENABLED;
const PB_WRITE_DIAGNOSTICS = PB_DEBUG_ENABLED
  || (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_PB_WRITE_DIAGNOSTICS === '1';

type RuntimeAuditKind = 'build' | 'permit' | 'timer';
interface RuntimeAuditContext {
  kind: RuntimeAuditKind;
  traceId: string;
}

let currentRuntimeAuditContext: RuntimeAuditContext | null = null;

export function setRuntimeAuditContext(context: RuntimeAuditContext | null): void {
  currentRuntimeAuditContext = context;
}

const getRuntimeTraceLabel = (): string | null =>
  currentRuntimeAuditContext ? `${currentRuntimeAuditContext.kind}:${currentRuntimeAuditContext.traceId}` : null;

const logPbAudit = (stage: string, payload: Record<string, unknown> | (() => Record<string, unknown>)) => {
  if (!PB_RUNTIME_AUDIT_ENABLED) return;
  const data = typeof payload === 'function' ? payload() : payload;
  console.info(`[PB ${stage}]`, {
    ...data,
    traceLabel: getRuntimeTraceLabel(),
  });
};

const MAX_CONCURRENT_REQUESTS = 5; // Increased from 3 for faster loading on slow connections
let activeRequests = 0;
const requestQueue: Array<() => Promise<void>> = [];
let requestSeq = 0;
const QUERY_REQUEST_TIMEOUT_MS = 15000;
const ZONE_QUERY_PAGE_SIZE: Record<string, number> = {
  map_resources: 300,
  buildings: 200,
  dropped_items: 100,
};
const FILTERED_QUERY_PAGE_SIZE: Record<string, number> = {
  map_resources: 300,
  buildings: 200,
  dropped_items: 100,
  presence: 200,
  users: 100,
  chat_messages: 200,
  private_messages: 200,
  market: 100,
  clans: 100,
  elections: 50,
};

function summarizeQueryOptions(options?: Record<string, unknown>): Record<string, unknown> {
  if (!options) return {};
  return {
    filter: options.filter ?? undefined,
    sort: options.sort ?? undefined,
    fields: options.fields ?? undefined,
    expand: options.expand ?? undefined,
    page: options.page ?? undefined,
    perPage: options.perPage ?? undefined,
    max: options.max ?? undefined,
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[PB Timeout] ${label} exceeded ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function enqueueRequest<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const requestId = ++requestSeq;
  const queuedAt = Date.now();
  logPbAudit('queue-enqueue', {
    requestId,
    label,
    queueDepth: requestQueue.length,
    activeRequests,
    queryContext: getRuntimeTraceLabel(),
  });

  return new Promise((resolve, reject) => {
    const execute = async () => {
      const startedAt = Date.now();
      activeRequests++;
      logPbAudit('queue-start', {
        requestId,
        label,
        queueWaitMs: startedAt - queuedAt,
        activeRequests,
        queueDepth: requestQueue.length,
        queryContext: getRuntimeTraceLabel(),
      });
      try {
        const result = await fn();
        logPbAudit('queue-end', {
          requestId,
          label,
          durationMs: Date.now() - startedAt,
          totalMs: Date.now() - queuedAt,
          activeRequests,
        });
        resolve(result);
      } catch (err) {
        logPbAudit('queue-error', {
          requestId,
          label,
          durationMs: Date.now() - startedAt,
          totalMs: Date.now() - queuedAt,
          error: String(err),
          activeRequests,
        });
        reject(err);
      } finally {
        activeRequests--;
        processQueue();
      }
    };

    requestQueue.push(execute);
    processQueue();
  });
}

function processQueue() {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) next();
  }
}

// Wrapped PocketBase methods with request queue
const queuedGetFullList = async <T>(collection: string, options?: any): Promise<T[]> => {
  // Filter out undefined values to avoid "sort=undefined" in URL causing 400 errors
  const cleanOptions: any = {};
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== '') {
        cleanOptions[key] = value;
      }
    }
  }
  return enqueueRequest(`getFullList:${collection}`, () => pb.collection(collection).getFullList(cleanOptions));
};

const queuedGetOne = async <T>(collection: string, id: string, options?: any): Promise<T> => {
  return enqueueRequest(`getOne:${collection}/${id}`, () => pb.collection(collection).getOne(id, options));
};

const queuedGetList = async <T>(collection: string, page: number, perPage: number, options?: any): Promise<any> => {
  // Filter out undefined values
  const cleanOptions: any = {};
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== '') {
        cleanOptions[key] = value;
      }
    }
  }
  // Safety net: auth `users` collection may not support filtering by `gameId`.
  // Strip risky OR clauses to avoid PocketBase 400 on legacy filters.
  if (collection === 'users' && typeof cleanOptions.filter === 'string') {
    cleanOptions.filter = sanitizeUsersFilter(cleanOptions.filter);
  }
  return enqueueRequest(`getList:${collection}[${page}/${perPage}]`, () => pb.collection(collection).getList(page, perPage, cleanOptions));
};

// ─── Auth helpers (mirrors Firebase auth exports) ───────────────────────────
export const auth = pb.authStore;
/**
 * Sign in with email or nickname (login) and password
 */
export async function signInWithEmailAndPassword(identity: string, password: string): Promise<{ user: PBUser }> {
  const trimmed = identity.trim();
  let resolvedIdentity = trimmed;

  // If the entered identity does not look like an email:
  // resolve the nickname to its auth identity server-side. The 2026-11 security
  // pass locked anonymous reads of the users collection, so the legacy
  // getFirstListItem lookup would 403 — use the rate-limited helper route and
  // keep the legacy query only as a fallback for servers without the route.
  if (!trimmed.includes('@')) {
    try {
      const res = await fetch(`${pb.baseUrl}/api/basingse/resolve-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: trimmed })
      });
      if (res.ok) {
        const json: any = await res.json();
        if (json?.found && json.email) {
          resolvedIdentity = String(json.email);
        } else if (json?.found === false) {
          resolvedIdentity = trimmed; // PB will try username identity natively
        }
      } else {
        throw new Error(`resolve-identity ${res.status}`);
      }
    } catch {
      try {
        const escaped = pbFilterString(trimmed);
        const userMatch = await pb.collection('users').getFirstListItem(`name = "${escaped}" || username = "${escaped}"`);
        if (userMatch?.email) {
          resolvedIdentity = userMatch.email;
        } else if (userMatch?.username) {
          resolvedIdentity = userMatch.username;
        }
      } catch {
        // User not found by name, continue with original trimmed string
      }
    }
  }

  try {
    const authData = await pb.collection('users').authWithPassword(resolvedIdentity, password);
    return { user: toPBUser(authData.record)! };
  } catch (err) {
    // If auth failed and we haven't checked by name yet (e.g. name happens to contain @ or fallback):
    if (resolvedIdentity === trimmed) {
      try {
        const escaped = pbFilterString(trimmed);
        const userMatch = await pb.collection('users').getFirstListItem(`name = "${escaped}" || username = "${escaped}"`);
        if (userMatch?.email && userMatch.email !== resolvedIdentity) {
          const authData = await pb.collection('users').authWithPassword(userMatch.email, password);
          return { user: toPBUser(authData.record)! };
        }
      } catch {}
    }
    throw err;
  }
}

/**
 * Create a new user with email and password, then sign in
 */
export async function createUserWithEmailAndPassword(
  email: string,
  password: string,
  initialData?: AnyRecord
): Promise<{ user: PBUser }> {
  const initGold = typeof initialData?.gold === 'number' ? initialData.gold : 100;
  const initRubies = typeof initialData?.rubies === 'number' ? initialData.rubies : 10;
  const initEnergy = typeof initialData?.energy === 'number' ? initialData.energy : 500;
  const initLevel = typeof initialData?.level === 'number' ? initialData.level : 1;
  const initInventory = initialData?.inventory || { 10013: 30, 10032: 5 };
  const initName = (initialData?.name && String(initialData.name).trim()) || '';

  // Try to set username to chosen name if it matches PocketBase username rules:
  // Regex: /^[a-zA-Z0-9_]{3,150}$/
  let desiredUsername: string | undefined = undefined;
  if (/^[a-zA-Z0-9_]{3,150}$/.test(initName)) {
    desiredUsername = initName;
  }

  const createPayload: Record<string, any> = {
    email,
    password,
    passwordConfirm: password,
    emailVisibility: true,
    name: initName,
    gold: initGold,
    rubies: initRubies,
    energy: initEnergy,
    level: initLevel,
    inventory: initInventory,
    data: {
      name: initName,
      gold: initGold,
      rubies: initRubies,
      energy: initEnergy,
      level: initLevel,
      inventory: initInventory,
      tutorialCompleted: false,
      townHallTutorialCompleted: false,
      extraBuildingPermits: 0,
      clanId: null,
      glory: 0,
      reputation: 0,
      treesChopped: 0,
      monstersDestroyed: 0,
      buildingsDestroyed: 0,
      theftsCommitted: 0,
      lastSaveTime: Date.now(),
      lastX: 0,
      lastY: 0,
      lastPositionUpdatedAt: 0,
      ...(initialData || {})
    }
  };

  if (desiredUsername) {
    createPayload.username = desiredUsername;
  }

  // Create the account directly with initial resources in PocketBase
  await pb.collection('users').create(createPayload);

  // Log in immediately
  return signInWithEmailAndPassword(email, password);
}

export type PBUser = {
  id: string;
  uid: string; // alias for id — keeps App.tsx compatible
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

let cachedPBUser: PBUser | null = null;
let lastAuthUserId: string | null = null; // Track last auth user ID to detect changes

/** Clear the user cache - call this when user logs out or changes */
export function clearUserCache(): void {
  cachedPBUser = null;
  lastAuthUserId = null;
  console.log('[PB Auth] User cache cleared');
}

/** Convert PocketBase authStore model to Firebase-like user object */
function toPBUser(model: RecordModel | null): PBUser | null {
  if (!model) {
      cachedPBUser = null;
      lastAuthUserId = null;
      return null;
  }
  
  const nextEmail = model.email ?? null;
  const nextDisplayName = (model.name && String(model.name).trim()) ? String(model.name).trim() : (model.username || null);
  const nextPhotoURL = model.avatarUrl ?? null;

  // CRITICAL FIX: Detect user change and clear cache
  if (lastAuthUserId && lastAuthUserId !== model.id) {
      console.log(`[PB Auth] User changed from ${lastAuthUserId} to ${model.id}, clearing cache`);
      cachedPBUser = null;
  }
  lastAuthUserId = model.id;

  if (
      cachedPBUser &&
      cachedPBUser.id === model.id &&
      cachedPBUser.email === nextEmail &&
      cachedPBUser.displayName === nextDisplayName &&
      cachedPBUser.photoURL === nextPhotoURL
  ) {
      return cachedPBUser;
  }

  console.log(`[PB Auth] Creating new PBUser for id=${model.id}, name=${nextDisplayName}`);
  cachedPBUser = {
    id: model.id,
    uid: model.id,
    email: nextEmail,
    displayName: nextDisplayName,
    photoURL: nextPhotoURL,
  };
  return cachedPBUser;
}

export type FirebaseUser = PBUser;

/** Sign in with Google OAuth2 (replaces signInWithPopup) */
export async function signInWithPopup(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ..._args: any[]
): Promise<{ user: PBUser }> {
  const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
  const user = toPBUser(authData.record)!;

  // Ensure user doc exists in 'users' collection with game fields
  try {
    const existing = await pb.collection('users').getOne(user.id);
    const uninitialized = (
      (Number(existing.gold || 0) === 0 && Number(existing.rubies || 0) === 0 && Number(existing.energy || 0) === 0) ||
      (!existing.lastSaveTime || Number(existing.lastSaveTime) === 0)
    );
    if (uninitialized) {
      await pb.collection('users').update(user.id, {
        gold: 100,
        rubies: 10,
        energy: 500,
        level: 1,
        inventory: { 10013: 30, 10032: 5 },
        data: {
          gold: 100,
          rubies: 10,
          energy: 500,
          level: 1,
          inventory: { 10013: 30, 10032: 5 },
          tutorialCompleted: false,
          townHallTutorialCompleted: false,
          lastSaveTime: Date.now()
        }
      });
    }
  } catch {
    // New user — initial data will be created in App.tsx onSnapshot equivalent
  }

  return { user };
}

/** Sign out (replaces signOut) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signOut(..._args: any[]): Promise<void> {
  pb.authStore.clear();
  clearUserCache(); // Clear the user cache on sign out
  console.log('[PB Auth] User signed out, cache cleared');
}

/** Listen to auth state changes (replaces onAuthStateChanged) */
export function onAuthStateChanged(
  _auth: unknown,
  callback: (user: PBUser | null) => void
): () => void {
  let lastDeliveredSignature: string | null = null;
  const makeSignature = (user: PBUser | null) =>
    user ? `${user.id}|${user.email ?? ''}|${user.displayName ?? ''}|${user.photoURL ?? ''}` : 'null';

  // Call immediately with current state
  const current = toPBUser(pb.authStore.model as RecordModel | null);
  lastDeliveredSignature = makeSignature(current);
  callback(current);

  // Subscribe to changes
  const unsubscribe = pb.authStore.onChange(() => {
    const newUser = toPBUser(pb.authStore.model as RecordModel | null);
    const nextSignature = makeSignature(newUser);
    if (nextSignature === lastDeliveredSignature) {
      return;
    }
    lastDeliveredSignature = nextSignature;
    console.log('[PB Auth] Auth store changed, user:', newUser?.id, newUser?.displayName);
    callback(newUser);
  });

  return unsubscribe;
}

/** Force clear all auth data and cache - use this when sync issues occur */
export function forceClearAuth(): void {
  console.log('[PB Auth] Force clearing all auth data...');
  pb.authStore.clear();
  clearUserCache();
  // Clear PocketBase-specific localStorage keys
  try {
    localStorage.removeItem('pocketbase_auth');
    localStorage.removeItem('pb_auth');
    // Clear any other PB-related keys
    const keysToRemove = Object.keys(localStorage).filter(k => 
      k.startsWith('pb_') || k.includes('pocketbase') || k.includes('_auth')
    );
    keysToRemove.forEach(k => localStorage.removeItem(k));
    console.log('[PB Auth] Cleared', keysToRemove.length, 'localStorage keys');
  } catch (e) {
    console.warn('[PB Auth] Failed to clear localStorage:', e);
  }
}

// ─── Firestore-compatible helpers ───────────────────────────────────────────
export interface DocSnapshot {
  exists(): boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data(): any;
  id: string;
  // optional ref stub so code that accesses .ref doesn't crash at runtime
  ref?: DocRef;
}

export interface QuerySnapshot {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forEach(cb: (doc: any) => void): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  docs: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  docChanges(): { type: 'added' | 'modified' | 'removed'; doc: any }[];
  size: number;
  empty: boolean;
}

// ─── Data transformation helpers ─────────────────────────────────────────────

const TOWN_HALL_IDS = [301, 306, 312, 331, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 360, 361, 371, 381, 413, 414, 452, 726, 752];

/**
 * PocketBase requires all fields to be defined in the schema.
 * To handle arbitrary game data, we keep "filterable" fields at the top level
 * and move everything else into the 'data' JSON field.
 */
const KNOWN_FIELDS_BY_COLLECTION: Record<string, string[]> = {
  users: ['name', 'gameId', 'data', 'gold', 'rubies', 'level', 'glory', 'energy', 'reputation', 'inventory', 'clanId', 'lastSaveTime', 'friends', 'gender', 'tutorialCompleted', 'tutorialCompletedAt', 'townHallTutorialCompleted', 'townHallTutorialCompletedAt', 'banEndTime'],
  // IMPORTANT: All fields that exist as top-level PocketBase schema fields MUST be listed here.
  // If a field is listed here, wrapData stores it at the top level of the PB record.
  // If it's NOT listed, wrapData puts it in the `data` JSON field.
  // The data-preservation fix in updateDoc/setDoc ensures `data` fields are not lost on partial updates.
  // Top-level PB schema fields (verified 2026-05-23): buildingId, constructionEndTime, data,
  // destructionEndTime, gameId, hostId, hp, initiatorId, isActive, isConstructing,
  // isDestroying, lastAttackTime, lastMoveTime, maxHp, ownerId, pendingDamage,
  // type, workState, workEndTime, x, y, zoneId
  buildings: ['ownerId', 'zoneId', 'x', 'y', 'data', 'gameId', 'buildingId', 'hp', 'maxHp', 'isConstructing', 'constructionEndTime', 'isActive', 'lastMoveTime', 'lastAttackTime', 'type', 'workState', 'workEndTime', 'hostId', 'isDestroying', 'destructionEndTime', 'pendingDamage', 'initiatorId'],
  map_resources: ['type', 'x', 'y', 'zoneId', 'data', 'gameId'],
  dropped_items: ['itemId', 'zoneId', 'data', 'gameId'],
  map_state: ['data', 'gameId'],
  history: ['userId', 'message', 'type', 'timestamp'],
  private_messages: ['senderId', 'senderName', 'recipientId', 'recipientName', 'text', 'timestamp', 'read', 'gameId', 'data'],
  chat_messages: ['sender', 'text', 'type', 'timestamp', 'tab', 'senderId', 'channel', 'gameId', 'data'],
  presence: ['userId', 'userName', 'lastSeen', 'gameId', 'data'],
  clans: ['name', 'leaderId', 'members', 'description', 'gameId', 'data'],
  market: ['sellerId', 'sellerName', 'itemId', 'itemName', 'quantity', 'price', 'timestamp', 'gameId', 'data'],
  elections: ['candidates', 'sheriffId', 'sheriffName', 'deputies', 'electionEndTime', 'firstElectionCompleted', 'kingId', 'kingName', 'queenId', 'queenName', 'votesTotal', 'gameId', 'data'],
  // leaderboard_profiles: no gameId/data field — all payload keys are top-level schema fields.
  leaderboard_profiles: ['userId', 'name', 'avatar', 'glory', 'treesChopped', 'monstersDestroyed', 'buildingsDestroyed', 'theftsCommitted', 'level', 'clanId'],
};

// Fields that should be stored in the data JSON field even though they're not in KNOWN_FIELDS
const DATA_FIELDS_BY_COLLECTION: Record<string, string[]> = {
  users: [
    'banEndTime', 'activeCurse', 'lastX', 'lastY', 'timestamp', 'rank',
    'clanPermissions', 'avatar', 'extraBuildingPermits', 'treesChopped',
    'monstersDestroyed', 'buildingsDestroyed', 'theftsCommitted',
    'achievements', 'selectedTitle', 'claimedAchievements',
    'totalLoginDays', 'lastLoginDay', 'playTimeTodaySeconds', 'lastPlayDay',
    'joinNumber', 'buildingsBuilt', 'peakGold', 'marketTrades',
    'townHallOrders', 'townHallOrdersCycle', 'townHallLastSkipTime'
  ],
  presence: [
    'title', 'level', 'glory', 'reputation', 'avatar', 'activeCurse', 'clanId',
    'treesChopped', 'monstersDestroyed', 'buildingsDestroyed', 'theftsCommitted',
    'activeTab', 'x', 'y'
  ],
  chat_messages: [
    'sender', 'senderId', 'channel', 'tab', 'clanId', 'teleportCoordinates', 'type', 'title'
  ],
};

// Collections that do NOT have a `data` JSON field in the PocketBase schema.
// For these, we must strip `payload.data` and `gameId` from every write
// to avoid a 400 Bad Request caused by an unknown field.
const NO_DATA_FIELD_COLLECTIONS = new Set<string>([
  'history',
  'leaderboard_profiles',
]);

const SYSTEM_FIELDS = ['id', 'collectionId', 'collectionName', 'created', 'updated', 'expand', 'isLocal'];
const AUTH_FIELDS = ['email', 'emailVisibility', 'verified', 'tokenKey', 'password'];
const MAX_SAFE_NUMERIC_COUNTER = Number.MAX_SAFE_INTEGER - 1;

function normalizeFiniteCounter(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(MAX_SAFE_NUMERIC_COUNTER, Math.floor(numeric)));
}

function sanitizeNumericObjectMap(value: unknown): Record<string, number> {
  const sanitized: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    sanitized[key] = normalizeFiniteCounter(entry);
  }
  return sanitized;
}

function wrapData(collectionName: string, docData: any): any {
  const knownFields = KNOWN_FIELDS_BY_COLLECTION[collectionName] || [];
  const dataFields = DATA_FIELDS_BY_COLLECTION[collectionName] || [];
  const result: any = {};

  if (collectionName === 'users') {
    // Debug logging disabled to reduce console noise
  }

  for (const [key, value] of Object.entries(docData)) {
    if (key === 'data') {
      if (value && typeof value === 'object') {
        for (const [dk, dv] of Object.entries(value)) {
          // Exclude auth fields from data JSON
          if (!AUTH_FIELDS.includes(dk)) {
            if (!result.data) result.data = {};
            result.data[dk] = dv;
          }
        }
      }
      continue;
    }
    
    if (knownFields.includes(key) && !SYSTEM_FIELDS.includes(key)) {
      // Force string conversion for fields that are Text in PB schema but might be numbers in game logic
      if (key === 'buildingId' || (key === 'type' && collectionName === 'map_resources')) {
        result[key] = String(value);
      } else if (key === 'banEndTime') {
        const numVal = Number(value || 0) || 0;
        result[key] = numVal;
        if (collectionName === 'users') {
          if (!result.data) result.data = {};
          result.data.banEndTime = numVal;
        }
      } else {
        result[key] = value;
      }
    } else if (dataFields.includes(key) && !SYSTEM_FIELDS.includes(key)) {
      // Store in data JSON field
      if (!result.data) result.data = {};
      result.data[key] = value;
    } else if (!SYSTEM_FIELDS.includes(key)) {
      // Exclude auth fields from data JSON - they exist at top level
      if (!AUTH_FIELDS.includes(key)) {
        if (!result.data) result.data = {};
        result.data[key] = value;
      }
    }
  }
  
  
  if (collectionName === 'presence') {
    const rawUid = docData.uid || docData.userId;
    if (rawUid && !result.userId) result.userId = String(rawUid);
    if (rawUid && !result.uid) result.uid = String(rawUid);
    const rawName = docData.name || docData.userName;
    if (rawName && !result.userName) result.userName = String(rawName);
  }

  if (collectionName === 'private_messages') {
    const rawRecipient = docData.receiverId || docData.recipientId;
    if (rawRecipient) {
      result.recipientId = String(rawRecipient);
      result.receiverId = String(rawRecipient);
    }
    const rawRecipientName = docData.receiverName || docData.recipientName;
    if (rawRecipientName) {
      result.recipientName = String(rawRecipientName);
      result.receiverName = String(rawRecipientName);
    }
  }

  if (collectionName === 'buildings' || collectionName === 'map_resources' || collectionName === 'dropped_items') {
    const effX = Number(result.x !== undefined ? result.x : docData?.x);
    const effY = Number(result.y !== undefined ? result.y : docData?.y);
    if (Number.isFinite(effX) && Number.isFinite(effY)) {
      const computedZoneId = `${Math.floor(effX / ZONE_SIZE)}_${Math.floor(effY / ZONE_SIZE)}`;
      if (!result.data) result.data = {};
      result.data.zoneId = computedZoneId;
      result.zoneId = computedZoneId;
    }
  }

  return result;
}

function unwrapData(record: RecordModel): AnyRecord {
  const data = { ...record };
  let extra = (record as AnyRecord).data;
  if (typeof extra === 'string') {
    try {
      extra = JSON.parse(extra);
    } catch {
      extra = null;
    }
  }

  // Presence alias: PB schema uses userId/userName; frontend expects uid/name.
  if (record.collectionName === 'presence') {
    const rawUid = (record as AnyRecord).uid || (record as AnyRecord).userId || record.id;
    if (rawUid && (!data.uid || data.uid === '')) {
      data.uid = String(rawUid);
    }
    const rawName = (record as AnyRecord).userName || (record as AnyRecord).name;
    if (rawName && (!data.name || data.name === '')) {
      data.name = String(rawName);
    }
  }

  if (record.collectionName === 'private_messages') {
    const rawRecipient = (record as AnyRecord).recipientId || (record as AnyRecord).receiverId;
    if (rawRecipient) {
      data.receiverId = String(rawRecipient);
      data.recipientId = String(rawRecipient);
    }
    const rawRecipientName = (record as AnyRecord).recipientName || (record as AnyRecord).receiverName;
    if (rawRecipientName) {
      data.receiverName = String(rawRecipientName);
      data.recipientName = String(rawRecipientName);
    }
    if (!data.participants || !Array.isArray(data.participants)) {
      const sId = String(data.senderId || '');
      const rId = String(rawRecipient || '');
      if (sId && rId) {
        data.participants = [sId, rId];
      }
    }
    // Anonymity guard: if this is a private message and the current user is NOT the sender,
    // ensure senderName is always "Аноним" and senderAvatar is never leaked to the client
    const isPrivate = data.messageType === 'private' || String(data.chatId || '').endsWith('_anon');
    if (isPrivate) {
      const currentAuthId = pb.authStore.model?.id;
      if (currentAuthId && String(data.senderId || '') !== String(currentAuthId)) {
        data.senderName = 'Аноним';
        data.senderAvatar = undefined;
      }
    }
  }
  
  if (record.collectionName === 'users') {
    // Debug logging disabled to reduce console noise
    // console.log('[PB] unwrapData: record.id =', record.id);
    // console.log('[PB] unwrapData: record.data =', extra);
    // console.log('[PB] unwrapData: gold =', record.gold, 'rubies =', record.rubies, 'level =', record.level);
  }
  
  if (extra && typeof extra === 'object') {
    // CRITICAL FIX: For known top-level PB schema fields, the real top-level value takes
    // priority over any stale copy stored in data.json.
    // Without this guard, old/corrupt data.json (e.g. hp:0 from before the schema fix)
    // would silently overwrite the correct top-level value via Object.assign, causing
    // buildings/monsters to read as dead and explode immediately.
    const knownFields = KNOWN_FIELDS_BY_COLLECTION[record.collectionName] || [];
    if (knownFields.length > 0) {
      // Save the authoritative top-level values for known fields before merging data.json
      const topLevelSnapshot: AnyRecord = {};
      for (const field of knownFields) {
        if ((record as AnyRecord)[field] !== undefined && (record as AnyRecord)[field] !== null) {
          topLevelSnapshot[field] = (record as AnyRecord)[field];
        }
      }
      // Merge data.json (for non-known fields like ownerName, isDestroying, etc.)
      Object.assign(data, extra);
      // Restore authoritative top-level values — they must not be overwritten by stale data.json
      Object.assign(data, topLevelSnapshot);
      // Legacy repair: PocketBase schema migration set hp/maxHp default=0 for existing records.
      // Only restore from data.json when the record is clearly not in a live death/destruction flow.
      const extraTyped = extra as AnyRecord;
      const looksLikeLegacyZeroHealth =
        data.hp === 0 &&
        data.maxHp === 0 &&
        !data.isDestroying &&
        !data.destructionEndTime &&
        !(Number(data.pendingDamage) > 0);
      if (looksLikeLegacyZeroHealth && typeof extraTyped.hp === 'number' && extraTyped.hp > 0) {
        data.hp = extraTyped.hp;
      }
      if (looksLikeLegacyZeroHealth && typeof extraTyped.maxHp === 'number' && extraTyped.maxHp > 0) {
        data.maxHp = extraTyped.maxHp;
      }
      if (
        looksLikeLegacyZeroHealth &&
        data.hp === 0 &&
        typeof data.maxHp === 'number' &&
        data.maxHp > 0 &&
        typeof extraTyped.hp !== 'number'
      ) {
        data.hp = data.maxHp;
      }
    } else {
      Object.assign(data, extra);
    }
  }

  // CRITICAL: Strip `isLocal` flag if it was accidentally saved into the DB. 
  // Otherwise, it causes ghost buildings that never sync deletions.
  if ('isLocal' in data) {
    delete data.isLocal;
  }

  // Authoritative ban reconciliation: ensure banEndTime never drops to 0 if either top-level or data.json has it active
  if (record.collectionName === 'users') {
    const topLevelBan = Number((record as AnyRecord).banEndTime || 0) || 0;
    const dataBan = Number((extra as AnyRecord)?.banEndTime || 0) || 0;
    data.banEndTime = Math.max(topLevelBan, dataBan);
  }

  // Restore types that Pocketbase stores as string
  if (data.buildingId !== undefined && data.buildingId !== null) {
      data.buildingId = Number(data.buildingId);
  }
  if (record.collectionName === 'buildings' && data.workEndTime !== undefined && data.workEndTime !== null) {
      const weNum = Number(data.workEndTime);
      data.workEndTime = isNaN(weNum) || weNum <= 0 ? undefined : weNum;
  }
  if (record.collectionName === 'buildings' && data.constructionEndTime !== undefined && data.constructionEndTime !== null) {
      const ceNum = Number(data.constructionEndTime);
      data.constructionEndTime = isNaN(ceNum) || ceNum <= 0 ? undefined : ceNum;
  }
  if (record.collectionName === 'map_resources' && data.type !== undefined && data.type !== null) {
      const typeNum = Number(data.type);
      if (!isNaN(typeNum)) {
          data.type = typeNum;
      }
  }

  // Map PocketBase 'created' to 'timestamp' if timestamp is missing
  if (!data.timestamp && record.created) {
      data.timestamp = Date.parse(record.created);
  }

  // Ensure zoneId is populated if coordinates exist
  if ((record.collectionName === 'buildings' || record.collectionName === 'map_resources' || record.collectionName === 'dropped_items') && (!data.zoneId || data.zoneId === '')) {
    const effX = Number(data.x);
    const effY = Number(data.y);
    if (Number.isFinite(effX) && Number.isFinite(effY)) {
      data.zoneId = `${Math.floor(effX / ZONE_SIZE)}_${Math.floor(effY / ZONE_SIZE)}`;
    }
  }
  
  // Debug log for users disabled - was causing excessive console noise for all 200 users
  // if (record.collectionName === 'users') {
  //   console.log('[PB] unwrapData FINAL: id=', data.id, 'gold=', data.gold, 'rubies=', data.rubies, 'level=', data.level, 'glory=', data.glory);
  // }
  
  // Game expects 'id' to stay as the game identity (handled in toDocSnapshot)
  return data;
}

function toDocSnapshot(record: RecordModel): DocSnapshot {
  const data = unwrapData(record);
  // Important: for users, the id MUST be record.id to match the auth PK.
  // For others, we fallback to gameId to maintain compatibility with old objects.
  const finalId = data.gameId && record.collectionName !== 'users' ? data.gameId : record.id;
  
  return {
    id: finalId,
    ref: { collectionName: record.collectionName, id: finalId },
    exists: () => true,
    data: () => ({ ...data, id: finalId }),
  };
}

function emptySnapshot(): QuerySnapshot {
  return {
    docs: [],
    forEach: () => {},
    docChanges: () => [],
    size: 0,
    empty: true,
  };
}

function summarizeBuildingTimerFields(record: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!record || typeof record !== 'object') return {};
  return {
    id: record.id,
    buildingId: record.buildingId,
    isConstructing: record.isConstructing,
    constructionEndTime: record.constructionEndTime,
    workState: record.workState,
    workEndTime: record.workEndTime,
    hasWorkEndTime: Object.prototype.hasOwnProperty.call(record, 'workEndTime'),
    source: record.source,
  };
}

function summarizeDocSnapshotForAudit(snapshot: DocSnapshot): Record<string, unknown> {
  if (!snapshot?.exists?.()) {
    return { exists: false, id: snapshot?.id };
  }
  const data = snapshot.data?.() as Record<string, unknown> | undefined;
  return {
    exists: true,
    id: snapshot.id,
    ...summarizeBuildingTimerFields(data),
  };
}

function summarizeQuerySnapshotForAudit(snapshot: QuerySnapshot): Record<string, unknown> {
  const docs = snapshot?.docs || [];
  const timerDocs = docs.map((docSnap) => summarizeDocSnapshotForAudit(docSnap));
  return {
    size: snapshot?.size ?? docs.length,
    empty: snapshot?.empty ?? docs.length === 0,
    timerDocs,
    timerDocCount: timerDocs.length,
    hasFinishedCount: timerDocs.filter((doc) => doc.workState === 'finished').length,
    hasWorkingCount: timerDocs.filter((doc) => doc.workState === 'working').length,
    hasConstructingCount: timerDocs.filter((doc) => doc.isConstructing).length,
    workEndTimeCount: timerDocs.filter((doc) => doc.hasWorkEndTime).length,
  };
}

function summarizeWritePayloadForAudit(collectionName: string, payload: AnyRecord): Record<string, unknown> {
  const data = payload?.data && typeof payload.data === 'object' ? payload.data as Record<string, unknown> : {};
  return {
    collectionName,
    keys: Object.keys(payload || {}),
    hasWorkEndTime: Object.prototype.hasOwnProperty.call(payload || {}, 'workEndTime') || Object.prototype.hasOwnProperty.call(data, 'workEndTime'),
    workEndTime: (payload?.workEndTime as unknown) ?? data.workEndTime,
    hasConstructionEndTime: Object.prototype.hasOwnProperty.call(payload || {}, 'constructionEndTime') || Object.prototype.hasOwnProperty.call(data, 'constructionEndTime'),
    constructionEndTime: (payload?.constructionEndTime as unknown) ?? data.constructionEndTime,
    workState: (payload?.workState as unknown) ?? data.workState,
    isConstructing: (payload?.isConstructing as unknown) ?? data.isConstructing,
    buildingId: (payload?.buildingId as unknown) ?? data.buildingId,
  };
}

// ─── doc / collection references (stubs for compatibility) ──────────────────
export interface DocRef {
  collectionName: string;
  id: string;
}

/**
 * Convert any game-generated ID (e.g. "17_52") to a valid
 * PocketBase ID: alphanumeric only, exactly 15 chars.
 */
// Track building IDs that returned 404 (deleted from server) to prevent repeated PATCH attempts
export const deadBuildingIds = new Set<string>();
// Track map_resources IDs that returned 404 to prevent repeated PATCH attempts
export const deadResourceIds = new Set<string>();
// Track dropped_items IDs that returned 404 to prevent repeated DELETE/UPDATE attempts
export const deadDroppedItemIds = new Set<string>();
// Track in-flight deletes to avoid duplicate DELETE requests for same record
const inFlightDeleteRequests = new Map<string, Promise<void>>();
// Tombstones for idempotent delete/update behavior across id forms (logical id and PB id)
const deletedRecordKeys = new Set<string>();
// Track user IDs that returned 404 to avoid repeated missing-profile requests
const missingUserIds = new Set<string>();

function makeRecordKey(collectionName: string, id: string): string {
  return `${collectionName}:${id}`;
}

function isDeletedRecord(collectionName: string, id: string): boolean {
  return deletedRecordKeys.has(makeRecordKey(collectionName, id));
}

function markDeletedRecord(collectionName: string, ...ids: string[]): void {
  for (const id of ids) {
    if (!id) continue;
    deletedRecordKeys.add(makeRecordKey(collectionName, id));
  }
}

function clearDeletedRecord(collectionName: string, ...ids: string[]): void {
  for (const id of ids) {
    if (!id) continue;
    deletedRecordKeys.delete(makeRecordKey(collectionName, id));
    if (collectionName === 'buildings') {
      deadBuildingIds.delete(id);
    } else if (collectionName === 'map_resources') {
      deadResourceIds.delete(id);
    } else if (collectionName === 'dropped_items') {
      deadDroppedItemIds.delete(id);
    }
  }
}

function hasInFlightDelete(collectionName: string, ...ids: string[]): boolean {
  for (const id of ids) {
    if (!id) continue;
    if (inFlightDeleteRequests.has(makeRecordKey(collectionName, id))) return true;
  }
  return false;
}

function hashToBase36(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function pbFilterString(value: string | number): string {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function sanitizeUsersFilter(filter: string): string {
  const raw = String(filter ?? '').trim();
  // Keep only `id = ...` for auth users. Any extra clauses (e.g. gameId) can
  // break on schemas where the field doesn't exist and cause PB 400.
  const idClauseMatch = raw.match(/\bid\s*=\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[a-z0-9_-]+)/i);
  if (idClauseMatch) {
    return idClauseMatch[0].replace(/\s+/g, ' ').trim();
  }

  // Regex fallback: recover id value from common legacy OR-filters and rebuild
  // a strict id-only clause.
  const idValueMatch = raw.match(/\b(?:id|gameId)\s*=\s*"((?:\\.|[^"\\])+)"/i)
    || raw.match(/\b(?:id|gameId)\s*=\s*'((?:\\.|[^'\\])+)'/i)
    || raw.match(/\b(?:id|gameId)\s*=\s*([a-z0-9_-]+)/i);

  if (idValueMatch?.[1]) {
    return `id = "${pbFilterString(idValueMatch[1])}"`;
  }

  // Hard fallback to a valid clause that returns no records instead of 400.
  return 'id = "__invalid_user_filter__"';
}

function buildIdLookupFilter(collectionName: string, pbId: string, logicalId: string): string {
  const idFilter = `id = "${pbFilterString(pbId)}"`;
  // In PocketBase, unknown fields in filter expressions return 400.
  // Some auth `users` collections may not have `gameId`, so keep users as id-only.
  if (collectionName === 'users') return idFilter;
  if (collectionName === 'history') return idFilter;
  // leaderboard_profiles has no `gameId` field — use `userId` as the logical-id fallback.
  if (collectionName === 'leaderboard_profiles') {
    return `${idFilter} || userId = "${pbFilterString(logicalId)}"`;
  }
  return `${idFilter} || gameId = "${pbFilterString(logicalId)}"`;
}

async function findUserRecord(logicalId: string): Promise<RecordModel | null> {
  const pbId = sanitizePbId(logicalId);
  const exactIdFilter = `id = "${pbFilterString(pbId)}"`;
  const flexibleFilter = `${exactIdFilter} || gameId = "${pbFilterString(String(logicalId))}"`;

  try {
    const list = await queuedGetList('users', 1, 1, { filter: flexibleFilter });
    if (Array.isArray(list?.items) && list.items.length > 0) {
      return list.items[0] as RecordModel;
    }
    return null;
  } catch (e: any) {
    const isFilterIssue =
      e?.status === 400 ||
      e?.response?.status === 400 ||
      /filter|gameId|validation/i.test(String(e?.message || e?.response?.data?.message || ''));
    if (!isFilterIssue) {
      throw e;
    }
  }

  try {
    return await queuedGetOne('users', pbId) as RecordModel;
  } catch (e: any) {
    if (e?.status === 404 || e?.originalError?.status === 404) {
      return null;
    }
    throw e;
  }
}

function pbFilterValue(value: unknown): string {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return `"${pbFilterString(String(value))}"`;
}

export function sanitizePbId(id: string | number): string {
  const strId = String(id);
  // If already exactly 15-char alpha-numeric, return as is
  if (strId.length === 15 && /^[a-z0-9]+$/i.test(strId)) {
    return strId;
  }

  // Replace non-alphanumeric with 'z'
  const safe = strId.replace(/[^a-zA-Z0-9]/g, 'z').toLowerCase();
  
  let pbId = '';
  if (safe.length > 15) {
    // Never just truncate long IDs: timestamp/random IDs would collapse to the
    // same first 15 chars and PocketBase would reject creates as duplicate IDs.
    // Use the full hash and adjust the prefix so the total is exactly 15 chars.
    const hash = hashToBase36(strId);
    const prefixLen = Math.max(1, 15 - hash.length);
    pbId = `${safe.substring(0, prefixLen)}${hash}`;
  } else {
    pbId = safe.padEnd(15, '0');
  }

  // SUPER STRICT: PocketBase Record IDs MUST be exactly 15 chars.
  const finalId = pbId.substring(0, 15);

  // DEBUG: Если вы видите это в консоли браузера, значит код ОБНОВИЛСЯ
  if (finalId.length !== 15) console.error("ID IS NOT 15 CHARS!", finalId);
  
  return finalId;
}

export function doc(_db: unknown, collectionName: string, id: string): DocRef {
  return { collectionName, id };
}

export function collection(_db: unknown, collectionName: string): string {
  return collectionName;
}

// ─── CRUD operations ────────────────────────────────────────────────────────

/** getDoc — fetch a single document */
export async function getDoc(ref: DocRef): Promise<DocSnapshot> {
  const pbId = sanitizePbId(ref.id);
  const startedAt = Date.now();
  logPbAudit('getDoc-start', {
    collectionName: ref.collectionName,
    id: ref.id,
    pbId,
  });
  if (ref.collectionName === 'users') {
    if (missingUserIds.has(pbId)) {
      const snapshot = { id: ref.id, exists: () => false, data: () => ({}) };
      logPbAudit('getDoc-end', {
        collectionName: ref.collectionName,
        id: ref.id,
        pbId,
        durationMs: Date.now() - startedAt,
        status: 'missing-cache',
        ...summarizeDocSnapshotForAudit(snapshot),
      });
      return snapshot;
    }
    try {
      const record = await findUserRecord(ref.id);
      if (!record) {
        missingUserIds.add(pbId);
        const snapshot = { id: ref.id, exists: () => false, data: () => ({}) };
        logPbAudit('getDoc-end', {
          collectionName: ref.collectionName,
          id: ref.id,
          pbId,
          durationMs: Date.now() - startedAt,
          status: 'not-found',
          ...summarizeDocSnapshotForAudit(snapshot),
        });
        return snapshot;
      }
      missingUserIds.delete(pbId);
      const snapshot = toDocSnapshot(record);
      logPbAudit('getDoc-end', {
        collectionName: ref.collectionName,
        id: ref.id,
        pbId,
        durationMs: Date.now() - startedAt,
        status: 'hit',
        ...summarizeDocSnapshotForAudit(snapshot),
      });
      return snapshot;
    } catch (e: any) {
      if (e?.status === 404 || e?.originalError?.status === 404) {
        missingUserIds.add(pbId);
        const snapshot = { id: ref.id, exists: () => false, data: () => ({}) };
        logPbAudit('getDoc-end', {
          collectionName: ref.collectionName,
          id: ref.id,
          pbId,
          durationMs: Date.now() - startedAt,
          status: '404',
          ...summarizeDocSnapshotForAudit(snapshot),
        });
        return snapshot;
      }
      console.error(`[PB] getDoc: users lookup failed for ${ref.id}, re-throwing:`, e?.status || e);
      logPbAudit('getDoc-error', {
        collectionName: ref.collectionName,
        id: ref.id,
        pbId,
        durationMs: Date.now() - startedAt,
        error: String(e),
      });
      throw e;
    }
  }

  try {
    const record = await queuedGetOne(ref.collectionName, pbId);
    const snapshot = toDocSnapshot(record as RecordModel);
    logPbAudit('getDoc-end', {
      collectionName: ref.collectionName,
      id: ref.id,
      pbId,
      durationMs: Date.now() - startedAt,
      status: 'hit',
      path: 'getOne',
      ...summarizeDocSnapshotForAudit(snapshot),
    });
    return snapshot;
  } catch (e: any) {
    if (e?.status === 404 || e?.originalError?.status === 404) {
      try {
        const list = await queuedGetList(ref.collectionName, 1, 1, {
          filter: buildIdLookupFilter(ref.collectionName, pbId, String(ref.id)),
        });
        if (Array.isArray(list?.items) && list.items.length > 0) {
          const snapshot = toDocSnapshot(list.items[0] as RecordModel);
          logPbAudit('getDoc-end', {
            collectionName: ref.collectionName,
            id: ref.id,
            pbId,
            durationMs: Date.now() - startedAt,
            status: 'fallback-hit',
            path: 'getList',
            ...summarizeDocSnapshotForAudit(snapshot),
          });
          return snapshot;
        }
      } catch (fallbackErr: any) {
        const fallbackLooksLikeNotFound = fallbackErr?.status === 404 || fallbackErr?.originalError?.status === 404;
        if (!fallbackLooksLikeNotFound) {
          console.error(`[PB] getDoc fallback lookup failed for ${ref.collectionName}/${ref.id}:`, fallbackErr?.status || fallbackErr);
          logPbAudit('getDoc-error', {
            collectionName: ref.collectionName,
            id: ref.id,
            pbId,
            durationMs: Date.now() - startedAt,
            error: String(fallbackErr),
            path: 'fallback-getList',
          });
        }
      }
    }

    // Only treat 404 as "not found". Other errors (network, timeout, 500) should
    // propagate so callers don't mistakenly think the record doesn't exist and
    // overwrite it with defaults (e.g. level=1).
    if (e?.status === 404 || e?.originalError?.status === 404) {
      const snapshot = { id: ref.id, exists: () => false, data: () => ({}) };
      logPbAudit('getDoc-end', {
        collectionName: ref.collectionName,
        id: ref.id,
        pbId,
        durationMs: Date.now() - startedAt,
        status: '404',
        ...summarizeDocSnapshotForAudit(snapshot),
      });
      return snapshot;
    }
    console.error(`[PB] getDoc: non-404 error for ${ref.collectionName}/${ref.id}, re-throwing to prevent data loss:`, e?.status || e);
    logPbAudit('getDoc-error', {
      collectionName: ref.collectionName,
      id: ref.id,
      pbId,
      durationMs: Date.now() - startedAt,
      error: String(e),
    });
    throw e;
  }
}

/** getDocs — fetch all documents in a collection / query */
export async function getDocs(
  colOrQuery: string | QueryDescriptor
): Promise<QuerySnapshot> {
  const startedAt = Date.now();
  try {
    const desc =
      typeof colOrQuery === 'string'
        ? { col: colOrQuery, filter: '', sort: '' }
        : colOrQuery;

    logPbAudit('getDocs-start', {
      collectionName: desc.col,
      query: {
        filter: desc.filter || '',
        sort: desc.sort || '',
        maxItems: desc.maxItems ?? null,
        whereField: desc.whereField ?? null,
        whereOp: desc.whereOp ?? null,
      },
    });
    const records = await fetchQueryRecords(desc);

    const docs = records.map(toDocSnapshot);
    const prevDocs: DocSnapshot[] = [];
    const snapshot = {
      docs,
      size: docs.length,
      empty: docs.length === 0,
      forEach: (cb) => docs.forEach(cb),
      docChanges: () =>
        docs.map((d) => {
          const existed = prevDocs.some((p) => p.id === d.id);
          return { type: existed ? 'modified' : 'added', doc: d } as {
            type: 'added' | 'modified' | 'removed';
            doc: DocSnapshot;
          };
        }),
    };
    logPbAudit('getDocs-end', {
      collectionName: desc.col,
      durationMs: Date.now() - startedAt,
      resultCount: docs.length,
      ...summarizeQuerySnapshotForAudit(snapshot),
    });
    return snapshot;
  } catch (error) {
    console.error('[PB getDocs] Error:', error);
    logPbAudit('getDocs-error', {
      durationMs: Date.now() - startedAt,
      error: String(error),
    });
    return emptySnapshot();
  }
}

/** setDoc — create or replace a document (Robust Upsert) */
async function freshRead(id: string) { try { return await pb.collection('users').getOne(id); } catch { return null; } }

export async function setDoc(ref: DocRef, data: AnyRecord): Promise<void> {
  const pbId = sanitizePbId(ref.id);
  let payload = wrapData(ref.collectionName, { ...data, gameId: ref.id });
  const startedAt = Date.now();
  logPbAudit('setDoc-start', {
    collectionName: ref.collectionName,
    id: ref.id,
    pbId,
    payload: summarizeWritePayloadForAudit(ref.collectionName, payload),
  });
  
  try {
    // For users collection (auth collection), the auth record already exists from login/registration.
    // Always try update first to avoid PocketBase requiring password/passwordConfirm on create.
    if (ref.collectionName === 'users') {
      // ─── LEVEL PROTECTION in setDoc: never overwrite a higher DB level ───
      if (typeof data.level === 'number') {
        try {
          const currentRecord = await queuedGetOne(ref.collectionName, pbId);
          const currentData = unwrapData(currentRecord as RecordModel);
          const dbLevel = typeof currentData.level === 'number' ? currentData.level : 0;
          if (data.level < dbLevel) {
            console.warn(`[PB] setDoc LEVEL PROTECTION: refusing to downgrade level ${dbLevel} → ${data.level} for user ${ref.id}`);
            payload = wrapData(ref.collectionName, { ...data, level: dbLevel, gameId: ref.id });
          }
        } catch {
          // If we can't read current level, proceed with caution but don't block
        }
      }
      let currentRawDataJson: AnyRecord | null = null;
      let currentRecordModel: RecordModel | null = null;
      try {
        const currentRecord = await queuedGetOne(ref.collectionName, pbId);
        currentRecordModel = currentRecord as RecordModel;
        const rawJson = (currentRecord as AnyRecord).data;
        if (rawJson && typeof rawJson === 'object') {
          currentRawDataJson = { ...rawJson };
        } else if (typeof rawJson === 'string') {
          try { currentRawDataJson = JSON.parse(rawJson); } catch {}
        }
      } catch {
        // If we can't read current data, proceed with caution but don't block
      }
      // Ban preservation: never drop an active ban on setDoc unless explicitly passed in data
      if (!('banEndTime' in data)) {
        const activeBan = Math.max(
          Number((currentRecordModel as AnyRecord)?.banEndTime || 0) || 0,
          Number(currentRawDataJson?.banEndTime || 0) || 0
        );
        if (activeBan > Date.now()) {
          payload.banEndTime = activeBan;
          if (!payload.data) payload.data = {};
          payload.data.banEndTime = activeBan;
        }
      }
      const knownFields = KNOWN_FIELDS_BY_COLLECTION[ref.collectionName] || [];
      if (!payload.data) payload.data = {};
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'data' || SYSTEM_FIELDS.includes(key) || AUTH_FIELDS.includes(key)) continue;
        if (knownFields.includes(key) && value !== undefined) {
          payload.data[key] = value;
        }
      }
      if (currentRawDataJson) {
        payload.data = { ...currentRawDataJson, ...payload.data };
      }
      if (Object.keys(payload.data).length === 0) {
        delete payload.data;
      }
      try {
        await pb.collection(ref.collectionName).update(pbId, payload);
        missingUserIds.delete(pbId);
        clearDeletedRecord(ref.collectionName, String(ref.id), pbId);
      } catch (updateErr: any) {
        if (updateErr.status === 404) {
          missingUserIds.add(pbId);
          // Auth record doesn't exist - stale auth token. Force re-login silently.
          console.warn('[PB setDoc] User record not found (404). Stale auth token - clearing auth.');
          pb.authStore.clear();
          // Don't spam error handlers - just silently fail
        } else {
          throw updateErr;
        }
      }
    } else if (ref.collectionName === 'leaderboard_profiles') {
      // ── ISOLATED LEADERBOARD PATH ──────────────────────────────────────
      // Resolved exclusively by userId. Never by pbId. Never falls into generic setDoc.
      // This prevents: pbId collisions, access-rule 404s, and cross-collection pollution.
      const userId = String(data?.userId ?? '').trim();
      if (!userId) {
        throw new Error('leaderboard_profiles requires field userId');
      }
      // Strip fields that don't belong in this flat-schema collection
      delete payload.data;
      delete payload.gameId;
      // Query by exact userId only
      const qResult = await queuedGetList(ref.collectionName, 1, 2, {
        filter: `userId="${pbFilterString(userId)}"`,
      });
      const matches = (qResult.items as RecordModel[]).filter(r => r.userId === userId);
      if (matches.length > 1) {
        throw new Error(`Duplicate leaderboard profiles for userId ${userId}`);
      }
      const existing = matches[0] || null;
      if (existing) {
        console.info('[LeaderboardResolve]', {
          authId: null, payloadUserId: userId,
          foundRecordId: existing.id, foundRecordUserId: existing.userId,
          operation: 'update',
        });
        await pb.collection(ref.collectionName).update(existing.id, payload);
        } else {
          console.info('[LeaderboardResolve]', {
            authId: null, payloadUserId: userId,
            foundRecordId: null, foundRecordUserId: null,
            operation: 'create',
          });
          const { id: _omitId, ...createPayload } = payload;
          try {
            await pb.collection(ref.collectionName).create(createPayload);
          } catch (createErr: any) {
            // Unique constraint race: another client created the record between our query and create
            if (createErr?.status === 400 && createErr?.data?.data?.userId?.code === 'validation_not_unique') {
              // Re-query and update the existing record
              const retryQ = await queuedGetList(ref.collectionName, 1, 1, {
                filter: `userId="${pbFilterString(userId)}"`,
              });
              if (retryQ.items.length > 0) {
                await pb.collection(ref.collectionName).update((retryQ.items[0] as RecordModel).id, payload);
              } else {
                throw createErr;
              }
            } else {
              throw createErr;
            }
          }
        }
      clearDeletedRecord(ref.collectionName, String(ref.id), pbId);
    } else {
      // Generic non-auth collections
      const list = await queuedGetList(ref.collectionName, 1, 1, {
        filter: buildIdLookupFilter(ref.collectionName, pbId, String(ref.id)),
      });
      if (list.items.length > 0) {
        const rawRecord = list.items[0] as RecordModel;
        const rawJson = (rawRecord as AnyRecord).data;
        const currentData = unwrapData(rawRecord);

        // ─── TOWN HALL DOWNGRADE PROTECTION in setDoc: never overwrite higher tier Town Hall ───
        if (ref.collectionName === 'buildings' && payload.buildingId !== undefined) {
          const currentThIdx = TOWN_HALL_IDS.indexOf(Number(currentData.buildingId));
          const newThIdx = TOWN_HALL_IDS.indexOf(Number(payload.buildingId));
          if (currentThIdx >= 0 && newThIdx >= 0 && newThIdx < currentThIdx) {
            console.warn(`[PB] setDoc TOWN HALL PROTECTION: refusing to downgrade Town Hall ${currentData.buildingId} (lvl ${currentThIdx + 1}) → ${payload.buildingId} (lvl ${newThIdx + 1}) for building ${ref.id}`);
            payload.buildingId = String(currentData.buildingId);
          }
        }

        const knownFields = KNOWN_FIELDS_BY_COLLECTION[ref.collectionName] || [];
        if (NO_DATA_FIELD_COLLECTIONS.has(ref.collectionName)) {
          delete payload.data;
          delete payload.gameId;
        } else {
          if (!payload.data) payload.data = {};
          for (const [key, value] of Object.entries(payload)) {
            if (key === 'data' || SYSTEM_FIELDS.includes(key) || AUTH_FIELDS.includes(key)) continue;
            if (knownFields.includes(key) && value !== undefined) {
              payload.data[key] = value;
            }
          }
          if (rawJson && typeof rawJson === 'object') {
            payload.data = { ...rawJson, ...payload.data };
          }
          if (Object.keys(payload.data).length === 0) {
            delete payload.data;
          }
        }
        const targetId = rawRecord.id;
        try {
    await pb.collection(ref.collectionName).update(targetId, payload);

    if (PB_WRITE_DIAGNOSTICS && ref.collectionName === 'users' && payload.data && payload.data.banEndTime) {
      const verify = await freshRead(targetId);
      console.log('[PBWriteVerify]', {
        recordId: targetId,
        sentBanEndTime: payload.data.banEndTime,
        sentBodyTopKeys: Object.keys(payload).slice(0, 20),
        sentDataKeys: Object.keys(payload.data || {}).slice(0, 30),
        respTopKeys: Object.keys(verify || {}).slice(0, 20),
        respData: (verify as any)?.data,
        respDataRawType: typeof (verify as any)?.data,
        respBanEndTime: ((verify as any)?.data && typeof (verify as any).data === 'object') ? (verify as any).data.banEndTime : (verify as any)?.banEndTime,
      });
    }
          clearDeletedRecord(ref.collectionName, String(ref.id), pbId, String(targetId));
        } catch (updateErr: any) {
          if (updateErr?.status === 404) {
            try {
              await pb.collection(ref.collectionName).create({ ...payload, id: pbId });
              clearDeletedRecord(ref.collectionName, String(ref.id), pbId);
            } catch (createFallbackErr: any) {
              const alreadyExists =
                createFallbackErr?.status === 400 &&
                createFallbackErr?.data?.data?.id?.code === 'validation_not_unique';
              if (!alreadyExists) {
                throw createFallbackErr;
              }
            }
          } else {
            throw updateErr;
          }
        }
      } else {
        try {
          const knownFieldsForCreate = KNOWN_FIELDS_BY_COLLECTION[ref.collectionName] || [];
          if (NO_DATA_FIELD_COLLECTIONS.has(ref.collectionName)) {
            delete payload.data;
            delete payload.gameId;
          } else {
            if (!payload.data) payload.data = {};
            for (const [key, value] of Object.entries(payload)) {
              if (key === 'data' || SYSTEM_FIELDS.includes(key) || AUTH_FIELDS.includes(key)) continue;
              if (knownFieldsForCreate.includes(key) && value !== undefined) {
                payload.data[key] = value;
              }
            }
            if (Object.keys(payload.data).length === 0) delete payload.data;
          }
          await pb.collection(ref.collectionName).create({ ...payload, id: pbId });
          clearDeletedRecord(ref.collectionName, String(ref.id), pbId);
        } catch (createErr: any) {
          if (createErr?.status === 400 && createErr?.data?.data?.id?.code === 'validation_not_unique') {
            const retryList = await queuedGetList(ref.collectionName, 1, 1, {
              filter: buildIdLookupFilter(ref.collectionName, pbId, String(ref.id)),
            });
            if (retryList.items.length > 0) {
              const existingRecord = retryList.items[0] as RecordModel;
              await pb.collection(ref.collectionName).update(existingRecord.id, payload);
            } else {
              const { id: _omit, ...createPayload } = payload;
              await pb.collection(ref.collectionName).create(createPayload);
            }
            clearDeletedRecord(ref.collectionName, String(ref.id), pbId);
          } else {
            throw createErr;
          }
        }
      }
    }
    logPbAudit('setDoc-end', {
      collectionName: ref.collectionName,
      id: ref.id,
      pbId,
      durationMs: Date.now() - startedAt,
      payload: summarizeWritePayloadForAudit(ref.collectionName, payload),
    });
  } catch (e: any) {
    console.error('[PB setDoc] Error:', e);
    logPbAudit('setDoc-error', {
      collectionName: ref.collectionName,
      id: ref.id,
      pbId,
      durationMs: Date.now() - startedAt,
      error: String(e),
      payload: summarizeWritePayloadForAudit(ref.collectionName, payload),
    });
    if (e.status === 404) {
      // should not happen with getList
    } else {
      handleFirestoreError(e, OperationType.CREATE, `${ref.collectionName}/${ref.id}`);
    }
    throw e;
  }
}

/** updateDoc — partial update with increment & dot-notation support */
const updateDocMetadataCache = new Map<string, {
  targetId: string;
  current: AnyRecord;
  rawJson: Record<string, any> | null;
  ts: number;
}>();
const updateDocQueues = new Map<string, Promise<void>>();
const USER_NON_NEGATIVE_COUNTERS = new Set<string>([
  'gold',
  'rubies',
  'energy',
  'glory',
  'buildingsBuilt',
  'treesChopped',
  'monstersDestroyed',
  'buildingsDestroyed',
  'theftsCommitted',
]);

export async function updateDoc(
  ref: DocRef,
  data: AnyRecord
): Promise<void> {
  const pbId = sanitizePbId(ref.id);
  const queueKey = `${ref.collectionName}:${pbId}`;
  const prev = updateDocQueues.get(queueKey) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(() => updateDocInternal(ref, data));
  const cleanup = next.finally(() => {
    if (updateDocQueues.get(queueKey) === cleanup) {
      updateDocQueues.delete(queueKey);
    }
  });
  // Prevent duplicate unhandledrejection when `next` rejects and the caller only catches `next`.
  cleanup.catch(() => {});
  updateDocQueues.set(queueKey, cleanup);
  return next;
}

async function updateDocInternal(
  ref: DocRef,
  data: AnyRecord
): Promise<void> {
  // Diagnostic: log every users update with incoming keys and banEndTime
  if (ref.collectionName === 'users' && PB_WRITE_DIAGNOSTICS) {
    console.warn('[UpdateDocEntry]', {
      recordId: ref.id,
      incomingKeys: Object.keys(data || {}),
      incomingBanEndTime: (data as any)?.banEndTime,
      hasGold: 'gold' in (data || {}),
      goldType: typeof (data as any)?.gold,
      goldIsIncrement: (data as any)?.gold?.__sentinel === 'increment',
    });
  }
  const logicalId = String(ref.id);
  const pbId = sanitizePbId(ref.id);
  let lookupSucceeded = false;
  let recordResolved = false;

  // Skip buildings that are known to be deleted (prevent repeated 404 spam)
  if (ref.collectionName === 'buildings' && (deadBuildingIds.has(logicalId) || deadBuildingIds.has(pbId))) {
    return;
  }
  // Skip map_resources that are known to be deleted (prevent repeated 404 spam)
  if (ref.collectionName === 'map_resources' && (deadResourceIds.has(logicalId) || deadResourceIds.has(pbId))) {
    return;
  }
  // Skip dropped_items that are known to be deleted (prevent repeated 404 spam)
  if (ref.collectionName === 'dropped_items' && (deadDroppedItemIds.has(logicalId) || deadDroppedItemIds.has(pbId))) {
    return;
  }
  // Generic guard: don't update records that are already deleted or being deleted right now.
  if (isDeletedRecord(ref.collectionName, logicalId) || isDeletedRecord(ref.collectionName, pbId)) {
    return;
  }
  if (hasInFlightDelete(ref.collectionName, logicalId, pbId)) {
    return;
  }
  let current: AnyRecord = {};
  let currentRawDataJson: Record<string, any> | null = null;
  let targetId = pbId;
  const startedAt = Date.now();
  const cacheKey = `${ref.collectionName}:${pbId}`;
  const cachedMeta = updateDocMetadataCache.get(cacheKey);

  logPbAudit('updateDoc-start', {
    collectionName: ref.collectionName,
    id: ref.id,
    pbId,
    targetId,
    payload: summarizeWritePayloadForAudit(ref.collectionName, data),
  });
  const hasIncrementOp = Object.values(data || {}).some(
    (v: any) => Boolean(v && typeof v === 'object' && v.__sentinel === 'increment')
  );
  // Never reuse cached metadata for users or increment writes: server hooks
  // (e.g. /api/basingse/tree-hit) mutate user gold/inventory outside client updateDoc.
  const canUseMetadataCache = ref.collectionName !== 'users' && !hasIncrementOp;
  if (canUseMetadataCache && cachedMeta && (startedAt - cachedMeta.ts) < 25000) {
    lookupSucceeded = true;
    recordResolved = true;
    targetId = cachedMeta.targetId;
    current = { ...cachedMeta.current };
    currentRawDataJson = cachedMeta.rawJson ? { ...cachedMeta.rawJson } : null;
  } else {
    try {
      if (ref.collectionName === 'users') {
        try {
          const rawRecord = await findUserRecord(ref.id);
          lookupSucceeded = true;
          if (!rawRecord) {
            missingUserIds.add(pbId);
            return;
          }
          recordResolved = true;
          current = unwrapData(rawRecord);
          missingUserIds.delete(pbId);
          const rawJson = (rawRecord as AnyRecord).data;
          if (rawJson && typeof rawJson === 'object') {
            currentRawDataJson = { ...rawJson };
          }
          targetId = rawRecord.id;
        } catch (e: any) {
          if (e?.status === 404 || e?.originalError?.status === 404) {
            missingUserIds.add(pbId);
            return;
          }
          throw e;
        }
      } else {
        let list = await queuedGetList(ref.collectionName, 1, 1, {
          filter: buildIdLookupFilter(ref.collectionName, pbId, String(ref.id)),
        });
        lookupSucceeded = true;
        if (list.items.length === 0 && ref.collectionName === 'map_resources') {
            const [x, y] = String(ref.id).split('_');
            if (x && y) {
                list = await queuedGetList(ref.collectionName, 1, 1, { filter: `x=${x} && y=${y}` });
            }
        }
        if (list.items.length > 0) {
          recordResolved = true;
          const rawRecord = list.items[0] as RecordModel;
          current = unwrapData(rawRecord);
          // Save the RAW data JSON field from PocketBase (before unwrapData merges it).
          // This is critical for data preservation: PB PATCH replaces the entire JSON field,
          // so we must include ALL existing data.json fields to avoid losing them.
          const rawJson = (rawRecord as AnyRecord).data;
          if (rawJson && typeof rawJson === 'object') {
            currentRawDataJson = { ...rawJson };
          }
          targetId = rawRecord.id;
        }
      }
    } catch {}
  }

  // If lookup succeeded and the record is missing, avoid sending PATCH that will 404.
  // This stops tight update loops for entities that were already removed.
  if (
    lookupSucceeded &&
    !recordResolved &&
    (ref.collectionName === 'buildings' || ref.collectionName === 'map_resources' || ref.collectionName === 'dropped_items')
  ) {
    if (ref.collectionName === 'buildings') {
      deadBuildingIds.add(logicalId);
      deadBuildingIds.add(pbId);
    } else if (ref.collectionName === 'map_resources') {
      deadResourceIds.add(logicalId);
      deadResourceIds.add(pbId);
    } else {
      deadDroppedItemIds.add(logicalId);
      deadDroppedItemIds.add(pbId);
    }
    markDeletedRecord(ref.collectionName, logicalId, pbId);
    return;
  }

  // IMPORTANT: Only build payload from the fields explicitly passed in `data`.
  // Previously this spread ALL current fields ({ ...current }) and overwrote them,
  // causing race conditions where concurrent updateDoc calls would overwrite each
  // other's fields (e.g., a glory save resetting level to a stale value).
  const resolved: AnyRecord = {};
  for (const [key, value] of Object.entries(data)) {
    const isIncrement = value && typeof value === 'object' && value.__sentinel === 'increment';
    const safeKey = String(key);
    
    // Debug logging for avatar
    if (ref.collectionName === 'users' && key === 'avatar') {
      console.log('[PB] updateDoc: Setting avatar, length:', String(value).length, 'current avatar:', current.avatar?.substring(0, 30));
    }
    
    if (isIncrement) {
      const amount = (value as IncrementSentinel).amount;
      if (safeKey.includes('.')) {
        const parts = safeKey.split('.');
        const rootKey = parts[0];
        const nestedKey = parts.slice(1).join('.');
        // For dot-notation increments, we need the current root object to merge into
        const currentRoot =
          ref.collectionName === 'users' && rootKey === 'inventory'
            ? sanitizeNumericObjectMap(current[rootKey])
            : (current[rootKey] ?? {});
        const currentVal = typeof currentRoot === 'object' ? (currentRoot[nestedKey] ?? 0) : 0;
        
        // Merge with existing current root so we don't lose sibling keys
        resolved[rootKey] = {
          ...(typeof currentRoot === 'object' ? currentRoot : {}),
          ...(typeof resolved[rootKey] === 'object' ? resolved[rootKey] : {})
        };
        resolved[rootKey][nestedKey] = normalizeFiniteCounter(currentVal) + amount;
        if (ref.collectionName === 'users' && rootKey === 'inventory') {
          resolved[rootKey][nestedKey] = normalizeFiniteCounter(resolved[rootKey][nestedKey]);
        }
      } else {
        const currentVal = current[safeKey] ?? 0;
        const nextVal = normalizeFiniteCounter(currentVal) + amount;
        resolved[safeKey] =
          ref.collectionName === 'users' && USER_NON_NEGATIVE_COUNTERS.has(safeKey)
            ? normalizeFiniteCounter(nextVal)
            : nextVal;
      }
    } else if (safeKey.includes('.')) {
      const parts = safeKey.split('.');
      const rootKey = parts[0];
      const nestedKey = parts.slice(1).join('.');
      
      // Merge with existing current root so we don't lose sibling keys
      resolved[rootKey] = { ...(typeof current[rootKey] === 'object' ? current[rootKey] : {}), ...(typeof resolved[rootKey] === 'object' ? resolved[rootKey] : {}) };
      resolved[rootKey][nestedKey] = value;
    } else {
      resolved[key] = value;
    }
  }

  // ─── LEVEL PROTECTION: never allow writing a lower level than what DB has ───
  if (ref.collectionName === 'users' && typeof resolved.level === 'number') {
    const dbLevel = typeof current.level === 'number' ? current.level : 0;
    if (resolved.level < dbLevel) {
      console.warn(`[PB] updateDoc LEVEL PROTECTION: refusing to downgrade level ${dbLevel} → ${resolved.level} for user ${ref.id}`);
      resolved.level = dbLevel; // keep the higher DB value
    }
  }

  // ─── TOWN HALL DOWNGRADE PROTECTION: never allow writing a lower Town Hall level than what DB has ───
  if (ref.collectionName === 'buildings' && resolved.buildingId !== undefined) {
    const currentThIdx = TOWN_HALL_IDS.indexOf(Number(current.buildingId));
    const newThIdx = TOWN_HALL_IDS.indexOf(Number(resolved.buildingId));
    if (currentThIdx >= 0 && newThIdx >= 0 && newThIdx < currentThIdx) {
      console.warn(`[PB] updateDoc TOWN HALL PROTECTION: refusing to downgrade Town Hall ${current.buildingId} (lvl ${currentThIdx + 1}) → ${resolved.buildingId} (lvl ${newThIdx + 1}) for building ${ref.id}`);
      resolved.buildingId = current.buildingId; // keep the higher DB value
    }
  }

  let payload: AnyRecord = {};
  try {
    // Build the payload from only the fields we're updating (+ gameId for lookup)
    payload = wrapData(ref.collectionName, { ...resolved, gameId: ref.id });

    // CRITICAL FIX: Preserve existing `data` JSON fields during partial updates.
    // PocketBase PATCH replaces the entire JSON field, so if we only send { data: { lastMoveTime: now } },
    // all other data fields (hp, maxHp, etc.) would be LOST.
    // We must merge the new data fields with the existing ones from the RAW PB record.
    // Using the RAW data.json (not the unwrapped merge) is essential because:
    //   - unwrapData merges data.json over top-level, so we can't distinguish which fields
    //     came from data.json vs top-level
    //   - Known fields that moved from data.json to top-level must still be preserved in
    //     data.json until the top-level value is correct (existing records may have hp=0 at
    //     top-level but the real value in data.json)
    //
    // ALSO: When a known field (e.g., hp) is written at the top level, we must also update
    // it in data.json. Otherwise, the stale data.json value would overwrite the correct
    // top-level value on the next load (unwrapData does Object.assign(data, extra)).
    const knownFields = KNOWN_FIELDS_BY_COLLECTION[ref.collectionName] || [];
    // Sync any known fields that are in the payload to data.json as well
    if (!payload.data) payload.data = {};
    for (const [key, value] of Object.entries(payload)) {
      if (key === 'data' || SYSTEM_FIELDS.includes(key) || AUTH_FIELDS.includes(key)) continue;
      if (knownFields.includes(key) && value !== undefined) {
        payload.data[key] = value;
      }
    }
    // Now merge with existing raw data.json
    if (currentRawDataJson) {
      payload.data = { ...currentRawDataJson, ...payload.data };
    }
    // Ensure spatial entities always maintain an up-to-date zoneId in data JSON
    if (ref.collectionName === 'buildings' || ref.collectionName === 'map_resources' || ref.collectionName === 'dropped_items') {
      const effX = Number(payload.x !== undefined ? payload.x : (resolved.x !== undefined ? resolved.x : (current.x !== undefined ? current.x : currentRawDataJson?.x)));
      const effY = Number(payload.y !== undefined ? payload.y : (resolved.y !== undefined ? resolved.y : (current.y !== undefined ? current.y : currentRawDataJson?.y)));
      if (Number.isFinite(effX) && Number.isFinite(effY)) {
        const computedZone = `${Math.floor(effX / ZONE_SIZE)}_${Math.floor(effY / ZONE_SIZE)}`;
        if (!payload.data) payload.data = {};
        payload.data.zoneId = computedZone;
        payload.zoneId = computedZone;
      }
    }
    // Authoritative ban preservation: never drop an active ban on users during partial updates
    if (ref.collectionName === 'users' && !('banEndTime' in data)) {
      const activeBan = Math.max(
        Number(current.banEndTime || 0) || 0,
        Number(currentRawDataJson?.banEndTime || 0) || 0
      );
      if (activeBan > Date.now()) {
        payload.banEndTime = activeBan;
        if (!payload.data) payload.data = {};
        payload.data.banEndTime = activeBan;
      }
    }
    // Presence tab preservation: never drop activeTab during partial presence updates
    if (ref.collectionName === 'presence' && !('activeTab' in data)) {
      const existingTab = currentRawDataJson?.activeTab || current.activeTab;
      if (existingTab) {
        if (!payload.data) payload.data = {};
        payload.data.activeTab = existingTab;
      }
    }
    if (PB_WRITE_DIAGNOSTICS && ref.collectionName === 'users' && payload.data) {
      console.log('[StartupUserWrite]', {
        recordId: targetId,
        banBefore: currentRawDataJson?.banEndTime,
        banInIncoming: (() => { const k = Object.keys(payload.data || {}); return k.includes('banEndTime') ? payload.data?.banEndTime : 'omitted'; })(),
        banAfterMerge: payload.data?.banEndTime,
        payloadDataKeys: Object.keys(payload.data || {}).slice(0, 40),
        source: new Error().stack?.split('\n').slice(1, 4).map(s => s.trim()).join(' ← '),
      });
    }
    // If payload.data is empty, remove it to avoid sending an empty object
    if (Object.keys(payload.data).length === 0) {
      delete payload.data;
    }

    if (PB_WRITE_DIAGNOSTICS && ref.collectionName === 'users') {
      const inData = payload.data && typeof payload.data === 'object' ? payload.data.banEndTime : undefined;
      console.warn('[PBWriteVerify:BEFORE]', {
        recordId: targetId,
        sentBanEndTime: inData ?? payload.banEndTime,
        hasDataField: !!payload.data, dataFieldType: typeof payload.data,
      });
    }

    await pb.collection(ref.collectionName).update(targetId, payload);

    if (PB_WRITE_DIAGNOSTICS && ref.collectionName === 'users') {
      try {
        const fresh = await pb.collection('users').getOne(targetId);
        const fd = (fresh as any)?.data;
        const parsed = (fd && typeof fd === 'object') ? fd : {};
        console.warn('[PBWriteVerify:AFTER]', {
          recordId: targetId, respDataType: typeof fd,
          respBanEndTime: parsed?.banEndTime,
        });
      } catch { console.warn('[PBWriteVerify:AFTER]', { recordId: targetId, error: 'freshRead failed' }); }
    }
    if (ref.collectionName === 'users') {
      updateDocMetadataCache.delete(cacheKey);
    } else {
      updateDocMetadataCache.set(cacheKey, {
        targetId,
        current: { ...current, ...resolved },
        rawJson: currentRawDataJson ? { ...currentRawDataJson, ...(payload.data || {}) } : (payload.data || null),
        ts: Date.now(),
      });
    }
    clearDeletedRecord(ref.collectionName, logicalId, pbId, String(targetId));
    logPbAudit('updateDoc-end', {
      collectionName: ref.collectionName,
      id: ref.id,
      pbId,
      targetId,
      durationMs: Date.now() - startedAt,
      payload: summarizeWritePayloadForAudit(ref.collectionName, payload),
    });
  } catch (e: any) {
    updateDocMetadataCache.delete(cacheKey);
    const isNotFoundError =
      e?.status === 404 ||
      e?.response?.status === 404 ||
      /404|not found/i.test(String(e?.message || e?.response?.data?.message || ''));
    // Silently ignore 404 for buildings (record was deleted, e.g. monster sold)
    if (isNotFoundError && ref.collectionName === 'buildings' && lookupSucceeded) {
      console.warn(`[PB] updateDoc: Record ${ref.id} not found (404), likely already deleted. Skipping.`);
      deadBuildingIds.add(logicalId);
      deadBuildingIds.add(pbId);
      markDeletedRecord(ref.collectionName, logicalId, pbId, targetId);
      return;
    }
    // Silently ignore 404 for map_resources (tree was already removed/respawned)
    if (isNotFoundError && ref.collectionName === 'map_resources' && lookupSucceeded) {
      console.warn(`[PB] updateDoc: map_resources/${ref.id} not found (404), likely already removed. Skipping.`);
      deadResourceIds.add(logicalId);
      deadResourceIds.add(pbId);
      markDeletedRecord(ref.collectionName, logicalId, pbId, targetId);
      return;
    }
    if (isNotFoundError && ref.collectionName === 'dropped_items' && lookupSucceeded) {
      deadDroppedItemIds.add(logicalId);
      deadDroppedItemIds.add(pbId);
      markDeletedRecord(ref.collectionName, logicalId, pbId, targetId);
      return;
    }
    console.error('[PB] updateDoc API call FAILED:', e);
    logPbAudit('updateDoc-error', {
      collectionName: ref.collectionName,
      id: ref.id,
      pbId,
      targetId,
      durationMs: Date.now() - startedAt,
      error: String(e),
      payload: summarizeWritePayloadForAudit(ref.collectionName, payload),
    });
    handleFirestoreError(e, OperationType.UPDATE, `${ref.collectionName}/${ref.id}`);
    throw e;
  }
}

/** deleteDoc — remove a document */
export async function deleteDoc(ref: DocRef): Promise<void> {
  if (!ref || typeof ref !== 'object' || !('collectionName' in ref) || !('id' in ref)) {
    console.error('[PB] deleteDoc called with invalid ref:', ref);
    return;
  }
  const logicalId = String(ref.id);
  const pbId = sanitizePbId(ref.id);
  if (ref.collectionName === 'buildings' && (deadBuildingIds.has(logicalId) || deadBuildingIds.has(pbId))) return;
  if (ref.collectionName === 'map_resources' && (deadResourceIds.has(logicalId) || deadResourceIds.has(pbId))) return;
  if (ref.collectionName === 'dropped_items' && (deadDroppedItemIds.has(logicalId) || deadDroppedItemIds.has(pbId))) return;
  if (isDeletedRecord(ref.collectionName, logicalId) || isDeletedRecord(ref.collectionName, pbId)) return;

  const inFlightKey = makeRecordKey(ref.collectionName, pbId);
  const existingDelete = inFlightDeleteRequests.get(inFlightKey);
  if (existingDelete) return existingDelete;

  const markAsDeleted = (...extraIds: string[]) => {
    if (ref.collectionName === 'buildings') {
      deadBuildingIds.add(logicalId);
      deadBuildingIds.add(pbId);
      for (const extraId of extraIds) deadBuildingIds.add(String(extraId));
    }
    if (ref.collectionName === 'map_resources') {
      deadResourceIds.add(logicalId);
      deadResourceIds.add(pbId);
      for (const extraId of extraIds) deadResourceIds.add(String(extraId));
    }
    if (ref.collectionName === 'dropped_items') {
      deadDroppedItemIds.add(logicalId);
      deadDroppedItemIds.add(pbId);
      for (const extraId of extraIds) deadDroppedItemIds.add(String(extraId));
    }
    markDeletedRecord(ref.collectionName, logicalId, pbId, ...extraIds.map(String));
  };

  const deletePromise = (async () => {
    try {
      await pb.collection(ref.collectionName).delete(pbId);
      markAsDeleted();
    } catch (e: any) {
      if (e.status === 404) {
        try {
          // Generic fallback: find record by real PB id OR logical gameId and delete by real id.
          const list = await pb.collection(ref.collectionName).getList(1, 1, {
            filter: buildIdLookupFilter(ref.collectionName, pbId, String(ref.id)),
          });
          if (list.items.length > 0) {
            const targetId = String(list.items[0].id);
            await pb.collection(ref.collectionName).delete(targetId);
            markAsDeleted(targetId);
            return;
          }
        } catch (fallbackErr) {
          console.warn('[PB] Fallback delete by id/gameId failed:', fallbackErr);
        }

        if (ref.collectionName === 'map_resources') {
          try {
            const [x, y] = String(ref.id).split('_');
            if (x && y) {
              const list = await pb.collection(ref.collectionName).getList(1, 1, { filter: `x=${x} && y=${y}` });
              if (list.items.length > 0) {
                await pb.collection(ref.collectionName).delete(list.items[0].id);
                markAsDeleted();
                return;
              }
            }
          } catch (fallbackErr) {
            console.warn('[PB] Fallback delete by coords failed:', fallbackErr);
          }
        }

        // Idempotent delete behavior: if record is already absent, treat as success.
        markAsDeleted();
        return;
      }

      handleFirestoreError(e, OperationType.DELETE, `${ref.collectionName}/${ref.id}`);
    }
  })();

  inFlightDeleteRequests.set(inFlightKey, deletePromise);
  try {
    await deletePromise;
  } finally {
    inFlightDeleteRequests.delete(inFlightKey);
  }
}

/** deleteAll — wipe a collection (use with caution!) */
export async function deleteAll(collectionName: string): Promise<void> {
  try {
    console.log(`🧹 [POCKETBASE SYNC] Fetching records for ${collectionName}...`);
    const records = await pb.collection(collectionName).getFullList({ fields: 'id' });
    console.log(`🧹 [POCKETBASE SYNC] Found ${records.length} records. Starting deletion...`);
    
    // Delete in chunks of 50 to avoid network/server overload
    const chunkSize = 50;
    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        await Promise.all(chunk.map(r => pb.collection(collectionName).delete(r.id)));
        console.log(`🧹 [POCKETBASE SYNC] ${collectionName}: Deleted ${Math.min(i + chunkSize, records.length)}/${records.length}`);
    }
    
    console.log(`✅ [POCKETBASE SYNC] Cleared collection: ${collectionName}`);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${collectionName}/* ALL`);
  }
}

/** deleteField — sentinel to remove a field (replaces Firebase deleteField) */
export function deleteField(): null {
  return null;
}

// ─── Query builder ──────────────────────────────────────────────────────────
export interface QueryDescriptor {
  col: string;
  filter: string;
  sort: string;
  maxItems?: number;
  whereField?: string;
  whereOp?: string;
  whereValue?: unknown;
  __bypassZonePool?: boolean;
}

export function query(
  col: string,
  ...constraints: QueryConstraint[]
): QueryDescriptor {
  let filter = '';
  let sort = '';
  let maxItems: number | undefined;
  let whereField: string | undefined;
  let whereOp: string | undefined;
  let whereValue: unknown;
  let whereCount = 0;

  for (const c of constraints) {
    if (c.type === 'where') {
      whereCount++;
      whereField = c.field;
      whereOp = c.op;
      whereValue = c.value;
      if (c.op === 'in') {
        // PocketBase filter: field = val1 || field = val2 ...
        if (Array.isArray(c.value)) {
          const cleanValues = c.value.filter(
            (v) => v !== undefined && v !== null && String(v).trim() !== ''
          );
          if (cleanValues.length > 0) {
            const isDataField = (col === 'buildings' && c.field === 'initiatorId') || (col === 'dropped_items' && c.field === 'zoneId') || (col === 'private_messages' && (c.field === 'participants' || c.field === 'chatId' || c.field === 'messageType'));
            const targetField = isDataField ? `data.${c.field}` : c.field;
            const parts = cleanValues.map((v) => `${targetField} = ${pbFilterValue(v)}`);
            filter = filter ? `(${filter}) && (${parts.join(' || ')})` : `(${parts.join(' || ')})`;
          }
        }
      } else if (c.op === 'array-contains') {
        // PocketBase JSON array contains: field ?~ value
        const isDataField = (col === 'private_messages' && c.field === 'participants') ||
          (col === 'buildings' && c.field === 'initiatorId') ||
          (col === 'dropped_items' && c.field === 'zoneId') ||
          (!KNOWN_FIELDS_BY_COLLECTION[col]?.includes(c.field));
        const targetField = isDataField ? `data.${c.field}` : c.field;
        const valWithQuotes = pbFilterValue(c.value);
        const clause = `${targetField} ?~ ${valWithQuotes}`;
        filter = filter ? `(${filter}) && (${clause})` : clause;
      } else {
        const isDataField = (col === 'buildings' && c.field === 'initiatorId') || (col === 'dropped_items' && c.field === 'zoneId') || (col === 'private_messages' && (c.field === 'participants' || c.field === 'chatId' || c.field === 'messageType'));
        const fieldName = isDataField ? `data.${c.field}` : c.field;
        const pbOp =
          c.op === '=='
            ? '='
            : c.op === '!='
            ? '!='
            : c.op === '>'
            ? '>'
            : c.op === '>='
            ? '>='
            : c.op === '<'
            ? '<'
            : '<=';
        
        let val = c.value;
        if (c.field === 'buildingId' && typeof val === 'number') {
          val = String(val);
        }
        if (typeof val === 'string') val = pbFilterValue(val);
        
        const clause = `${fieldName}${pbOp}${val}`;
        filter = filter ? `(${filter}) && (${clause})` : clause;
      }
    } else if (c.type === 'orderBy') {
      const sortField = c.field;
      sort = c.desc ? `-${sortField}` : sortField;
    } else if (c.type === 'limit') {
      maxItems = c.value as number;
    }
  }

  return {
    col,
    filter,
    sort,
    maxItems,
    whereField: whereCount === 1 ? whereField : undefined,
    whereOp: whereCount === 1 ? whereOp : undefined,
    whereValue: whereCount === 1 ? whereValue : undefined,
  };
}

async function fetchQueryRecords(desc: QueryDescriptor): Promise<RecordModel[]> {
  const queryStartedAt = Date.now();
  logPbAudit('query-start', {
    collectionName: desc.col,
    filter: desc.filter || '',
    sort: desc.sort || '',
    maxItems: desc.maxItems ?? null,
    whereField: desc.whereField ?? null,
    whereOp: desc.whereOp ?? null,
    whereValue: Array.isArray(desc.whereValue) ? desc.whereValue.length : desc.whereValue ?? null,
  });
  const fetchOptions: any = {
    filter: desc.filter || undefined,
    sort: desc.sort || undefined,
  };

  const fetchPagedRecords = async (
    collection: string,
    pageSize: number,
    options: any,
    label: string,
    maxItems?: number
  ): Promise<RecordModel[]> => {
    const records: RecordModel[] = [];
    let page = 1;

    while (true) {
      const pageStartedAt = Date.now();
      let list;
      try {
        list = await withTimeout(
          queuedGetList<RecordModel>(collection, page, pageSize, options),
          QUERY_REQUEST_TIMEOUT_MS,
          `${label} page=${page}`
        );
      } catch (error) {
        logPbAudit('query-page-error', {
          collectionName: collection,
          label,
          page,
          pageSize,
          durationMs: Date.now() - pageStartedAt,
          error: String(error),
          options: summarizeQueryOptions(options),
        });
        throw error;
      }

      const pageItems = (list.items || []) as RecordModel[];
      records.push(...pageItems);
      logPbAudit('query-page-end', {
        collectionName: collection,
        label,
        page,
        pageSize,
        durationMs: Date.now() - pageStartedAt,
        itemCount: pageItems.length,
        totalPages: list.totalPages ?? null,
        options: summarizeQueryOptions(options),
      });

      if (typeof maxItems === 'number' && maxItems > 0 && records.length >= maxItems) {
        return records.slice(0, maxItems);
      }

      const totalPages = Number(list.totalPages || 0);
      if (pageItems.length === 0 || (totalPages > 0 && page >= totalPages) || pageItems.length < pageSize) {
        break;
      }

      page += 1;
    }

    return records;
  };

  const isZoneInQuery =
    (desc.col === 'map_resources' || desc.col === 'buildings' || desc.col === 'dropped_items') &&
    desc.whereField === 'zoneId' &&
    desc.whereOp === 'in' &&
    Array.isArray(desc.whereValue);

  if (isZoneInQuery) {
    const zoneIds = (desc.whereValue as unknown[])
      .map((value) => String(value || '').trim())
      .filter(Boolean);

    const perZonePageSize = ZONE_QUERY_PAGE_SIZE[desc.col] || 200;
    const zoneField = (desc.col === 'buildings' || desc.col === 'dropped_items') ? 'data.zoneId' : 'zoneId';
    const zoneResults = await Promise.all(zoneIds.map(async (zoneId) => {
      return fetchPagedRecords(
        desc.col,
        perZonePageSize,
        {
          filter: `${zoneField} = ${JSON.stringify(zoneId)}`,
          sort: desc.sort || undefined,
        },
        `${desc.col} zoneId=${zoneId}`
      );
    }));

    const merged = zoneResults.flat();
    const result = typeof desc.maxItems === 'number' ? merged.slice(0, desc.maxItems) : merged;
    logPbAudit('query-end', {
      collectionName: desc.col,
      durationMs: Date.now() - queryStartedAt,
      path: 'zone-split',
      resultCount: result.length,
      zoneCount: zoneIds.length,
    });
    return result;
  }

  if (desc.filter || (typeof desc.maxItems === 'number' && desc.maxItems > 0)) {
    const defaultPageSize = FILTERED_QUERY_PAGE_SIZE[desc.col] || 200;
    const pageSize = typeof desc.maxItems === 'number' && desc.maxItems > 0
      ? Math.min(Math.max(desc.maxItems, 1), 500)
      : defaultPageSize;
    const result = await fetchPagedRecords(desc.col, pageSize, fetchOptions, `${desc.col} filtered query`, desc.maxItems);
    logPbAudit('query-end', {
      collectionName: desc.col,
      durationMs: Date.now() - queryStartedAt,
      path: 'paged',
      resultCount: result.length,
      pageSize,
    });
    return result;
  }

  const result = await withTimeout(
    queuedGetFullList<RecordModel>(desc.col, fetchOptions),
    QUERY_REQUEST_TIMEOUT_MS,
    `${desc.col} full query`
  );
  logPbAudit('query-end', {
    collectionName: desc.col,
    durationMs: Date.now() - queryStartedAt,
    path: 'full',
    resultCount: result.length,
  });
  return result;
}

export interface QueryConstraint {
  type: 'where' | 'orderBy' | 'limit';
  field?: string;
  op?: string;
  value?: unknown;
  desc?: boolean;
}

export function where(field: string, op: string, value: unknown): QueryConstraint {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, dir: 'asc' | 'desc' = 'asc'): QueryConstraint {
  return { type: 'orderBy', field, desc: dir === 'desc' };
}

export function limit(n: number): QueryConstraint {
  return { type: 'limit', value: n };
}

// ─── increment helper (no atomic increment in PB — returns a marker) ─────────
export interface IncrementSentinel {
  __sentinel: 'increment';
  amount: number;
}
export function increment(n: number): IncrementSentinel {
  return { __sentinel: 'increment', amount: n };
}

// ─── onSnapshot — real-time subscription ────────────────────────────────────
type UnsubscribeFn = () => void;

// Global subscription counter for staggering initial requests
let subscriptionCounter = 0;
const SUBSCRIPTION_DELAY_MS = 150; // Reduced from 500ms for faster initial loading
const MAX_STAGGER_SUBSCRIPTIONS = 20;
let realtimeUnavailableLogged = false;

// Shared per-zone subscription pool so crossing a sector boundary reuses already-loaded sectors
// without tearing down or re-downloading overlapping zones over HTTP.
const MAX_WARM_IDLE_ZONES_PER_COL = 6;
const WARM_IDLE_ZONE_TTL_MS = 60000;

interface ZonePoolEntry {
  key: string;
  col: string;
  zoneId: string;
  refCount: number;
  lastUsedAt: number;
  loaded: boolean;
  docs: any[];
  auditSource: string;
  listeners: Set<() => void>;
  errorListeners: Set<(e: unknown) => void>;
  unsub: () => void;
  // Reconciliation metadata: the single-zone query descriptor and the last time
  // this entry received data (initial fetch or realtime event). Used by the
  // watchdog to re-fetch zones whose SSE stream silently died.
  singleQuery?: QueryDescriptor;
  lastActivityAt?: number;
}

const zoneSubscriptionPool = new Map<string, ZonePoolEntry>();

// ─── Zone reconciliation watchdog ───────────────────────────────────────────
// A dead SSE stream (proxy hiccup, PocketBase hooks hot-reload, sleep/wake)
// otherwise leaves a client with stale buildings/resources until a manual page
// refresh. Every 60s we re-fetch active zone entries that have not received any
// data for 90s, so the client converges with the server even without realtime.
const ZONE_RECONCILE_INTERVAL_MS = 60000;
const ZONE_RECONCILE_STALE_MS = 90000;
const ZONE_RECONCILE_COLS = new Set(['buildings', 'map_resources', 'dropped_items']);
let zoneReconcileTimer: ReturnType<typeof setInterval> | null = null;

function ensureZoneReconcileTimer(): void {
  if (zoneReconcileTimer) return;
  zoneReconcileTimer = setInterval(() => {
    const now = Date.now();
    for (const entry of Array.from(zoneSubscriptionPool.values())) {
      if (!ZONE_RECONCILE_COLS.has(entry.col)) continue;
      if (entry.refCount <= 0) continue;
      const lastActivity = entry.lastActivityAt || entry.lastUsedAt || 0;
      const stale = !entry.loaded || (now - lastActivity) > ZONE_RECONCILE_STALE_MS;
      if (!stale) continue;
      const query = entry.singleQuery;
      if (!query) continue;
      fetchQueryRecords(query)
        .then((records) => {
          entry.loaded = true;
          entry.lastActivityAt = Date.now();
          entry.docs = records.map(toDocSnapshot);
          entry.listeners.forEach((listener) => {
            try { listener(); } catch { /* one broken listener must not block others */ }
          });
        })
        .catch((err) => {
          console.warn(`[PB Realtime] zone reconcile failed for ${entry.key}:`, err);
        });
    }
  }, ZONE_RECONCILE_INTERVAL_MS);
  if (typeof zoneReconcileTimer.unref === 'function') zoneReconcileTimer.unref();
}

function evictExpiredOrExcessWarmZones(col: string) {
  const now = Date.now();
  const idleEntries: ZonePoolEntry[] = [];
  for (const entry of zoneSubscriptionPool.values()) {
    if (entry.col !== col || entry.refCount > 0) continue;
    if ((now - entry.lastUsedAt) > WARM_IDLE_ZONE_TTL_MS) {
      zoneSubscriptionPool.delete(entry.key);
      try { entry.unsub(); } catch {}
    } else {
      idleEntries.push(entry);
    }
  }
  if (idleEntries.length > MAX_WARM_IDLE_ZONES_PER_COL) {
    idleEntries.sort((a, b) => a.lastUsedAt - b.lastUsedAt);
    const toRemove = idleEntries.length - MAX_WARM_IDLE_ZONES_PER_COL;
    for (let i = 0; i < toRemove; i++) {
      const victim = idleEntries[i];
      zoneSubscriptionPool.delete(victim.key);
      try { victim.unsub(); } catch {}
    }
  }
}

// ─── Shared collection-level SSE subscription per zone-partitioned collection ─
// Avoids N duplicate EventSource listeners (one per zone), which flooded the client
// with duplicate JSON parsing and GC allocations whenever any building changed.
const zoneCollectionRealtimeUnsubs = new Map<string, () => void>();

function getRecordZoneId(record: any): string | null {
  if (!record) return null;
  const unwrapped = unwrapData(record);
  if (unwrapped.zoneId) return String(unwrapped.zoneId);
  const x = Number(unwrapped.x);
  const y = Number(unwrapped.y);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    return `${Math.floor(x / ZONE_SIZE)}_${Math.floor(y / ZONE_SIZE)}`;
  }
  return null;
}

function ensureZoneCollectionRealtime(col: string): void {
  if (zoneCollectionRealtimeUnsubs.has(col)) return;

  let unsubCallback: (() => void) | null = null;
  let isCancelled = false;

  zoneCollectionRealtimeUnsubs.set(col, () => {
    isCancelled = true;
    if (unsubCallback) {
      try { unsubCallback(); } catch {}
    }
  });

  const onEvent = (event: any) => {
    const record = event?.record;
    if (!record) return;
    const recordId = String(record.id || '').trim();
    if (!recordId) return;

    const action = String(event?.action || '').toLowerCase();
    const isDelete = action === 'delete';
    const gameId = String((record as any)?.gameId || (record as any)?.data?.gameId || '').trim();
    const newZoneId = getRecordZoneId(record);
    const targetKey = newZoneId ? `${col}:${newZoneId}` : null;
    const targetEntry = targetKey ? zoneSubscriptionPool.get(targetKey) : null;

    // 1. If this record was previously tracked in a DIFFERENT loaded zone
    // (e.g. monster or entity moved across sector boundaries, or deleted),
    // remove it from the old zone so it doesn't linger or duplicate.
    for (const entry of Array.from(zoneSubscriptionPool.values())) {
      if (entry.col !== col || !entry.loaded) continue;
      if (entry === targetEntry) continue;

      const idx = entry.docs.findIndex(
        (d: any) => d.id === recordId || (Boolean(gameId) && d.id === gameId)
      );
      if (idx !== -1) {
        entry.docs.splice(idx, 1);
        entry.lastActivityAt = Date.now();
        entry.auditSource = 'realtime-event';
        entry.listeners.forEach((listener) => {
          try { listener(); } catch {}
        });
      }
    }

    // 2. Route the event to targetEntry if that zone is active or warm
    if (targetEntry && targetEntry.loaded) {
      const idx = targetEntry.docs.findIndex(
        (d: any) => d.id === recordId || (Boolean(gameId) && d.id === gameId)
      );

      let changed = false;
      if (isDelete) {
        if (idx !== -1) {
          targetEntry.docs.splice(idx, 1);
          changed = true;
        }
      } else {
        const nextDoc = toDocSnapshot(record);
        if (idx !== -1) {
          targetEntry.docs[idx] = nextDoc;
          changed = true;
        } else {
          targetEntry.docs.push(nextDoc);
          changed = true;
        }
      }

      if (changed) {
        targetEntry.lastActivityAt = Date.now();
        targetEntry.auditSource = 'realtime-event';
        targetEntry.listeners.forEach((listener) => {
          try { listener(); } catch {}
        });
      }
    }
  };

  pb.collection(col)
    .subscribe('*', onEvent)
    .then((unsub) => {
      if (isCancelled) {
        try { unsub(); } catch {}
      } else {
        unsubCallback = unsub;
      }
    })
    .catch((err) => {
      console.warn(`[PB Realtime] Collection subscription failed for ${col}:`, err);
      zoneCollectionRealtimeUnsubs.delete(col);
    });
}

function subscribeZonePartitionedQuery(
  desc: QueryDescriptor,
  callback: (snapshot: any) => void,
  errCallback?: (e: unknown) => void
): UnsubscribeFn {
  const zoneIds = Array.from(
    new Set(
      (Array.isArray(desc.whereValue) ? desc.whereValue : [])
        .map((v) => String(v || '').trim())
        .filter(Boolean)
    )
  );
  let destroyed = false;
  let scheduledEmit = false;

  if (zoneIds.length === 0) {
    queueMicrotask(() => {
      if (destroyed) return;
      callback({
        size: 0,
        empty: true,
        docs: [],
        forEach: () => {},
      });
    });
    return () => {
      destroyed = true;
    };
  }

  const now = Date.now();
  for (const existing of zoneSubscriptionPool.values()) {
    if (existing.col === desc.col && existing.refCount === 0 && (now - existing.lastUsedAt) > WARM_IDLE_ZONE_TTL_MS) {
      zoneSubscriptionPool.delete(existing.key);
      try { existing.unsub(); } catch {}
    }
  }

  const entries: ZonePoolEntry[] = [];
  const emitCombined = () => {
    if (destroyed) return;
    if (entries.some((e) => !e.loaded)) return;

    const dedupMap = new Map<string, any>();
    let latestAuditSource = 'onSnapshot';
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.auditSource && entry.auditSource !== 'onSnapshot') {
        latestAuditSource = entry.auditSource;
      }
      for (let j = 0; j < entry.docs.length; j++) {
        const d = entry.docs[j];
        dedupMap.set(String(d.id), d);
      }
    }

    const docs = Array.from(dedupMap.values());
    const snap: any = {
      size: docs.length,
      empty: docs.length === 0,
      docs,
      forEach: (cb: (doc: any) => void) => {
        for (let i = 0; i < docs.length; i++) cb(docs[i]);
      },
      __auditSource: latestAuditSource,
    };
    callback(snap);
  };

  // Realtime events for the same zone often arrive in bursts (monster movement,
  // attacks, production ticks — up to 8 writes/sec from the hosting client).
  // Each emitCombined callback runs a full zone rebuild + React setState in the
  // app (~10-16ms with hundreds of buildings), so emitting per event froze the
  // main thread in 50-260ms bursts while flying. Coalesce events: emit at most
  // once per EMIT_MIN_INTERVAL_MS. emitCombined always reads the CURRENT
  // entry.docs, so no update is ever lost — only the delivery is batched; the
  // app-side interpolation of monster movement hides the extra latency.
  const ZONE_EMIT_MIN_INTERVAL_MS = 100;
  let lastEmitAt = 0;
  const onEntryUpdate = () => {
    if (destroyed || scheduledEmit) return;
    scheduledEmit = true;
    const emitNow = () => {
      scheduledEmit = false;
      if (destroyed) return;
      lastEmitAt = performance.now();
      emitCombined();
    };
    const elapsed = performance.now() - lastEmitAt;
    if (elapsed >= ZONE_EMIT_MIN_INTERVAL_MS) {
      setTimeout(emitNow, 0);
    } else {
      setTimeout(emitNow, ZONE_EMIT_MIN_INTERVAL_MS - elapsed);
    }
  };

  const onEntryError = (err: unknown) => {
    if (destroyed) return;
    errCallback?.(err);
  };

  for (let i = 0; i < zoneIds.length; i++) {
    const zoneId = zoneIds[i];
    const key = `${desc.col}:${zoneId}`;
    let entry = zoneSubscriptionPool.get(key);
    if (!entry) {
      const singleQuery = query(collection(null, desc.col), where('zoneId', 'in', [zoneId]));
      singleQuery.__bypassZonePool = true;
      const createdEntry: ZonePoolEntry = {
        key,
        col: desc.col,
        zoneId,
        refCount: 0,
        lastUsedAt: now,
        loaded: false,
        docs: [],
        auditSource: 'initial-fetch',
        listeners: new Set(),
        errorListeners: new Set(),
        unsub: () => {},
        singleQuery,
        lastActivityAt: now,
      };
      zoneSubscriptionPool.set(key, createdEntry);

      ensureZoneCollectionRealtime(desc.col);

      fetchQueryRecords(singleQuery)
        .then((records) => {
          createdEntry.loaded = true;
          createdEntry.lastUsedAt = Date.now();
          createdEntry.lastActivityAt = Date.now();
          createdEntry.docs = records.map(toDocSnapshot);
          createdEntry.listeners.forEach((listener) => {
            try { listener(); } catch { /* one broken listener must not block others */ }
          });
        })
        .catch((err) => {
          if (!createdEntry.loaded) {
            zoneSubscriptionPool.delete(createdEntry.key);
          }
          createdEntry.errorListeners.forEach((listener) => {
            try { listener(err); } catch { /* isolate listener errors */ }
          });
        });

      entry = createdEntry;
    }

    entry.refCount += 1;
    ensureZoneReconcileTimer();
    entry.lastUsedAt = now;
    entry.listeners.add(onEntryUpdate);
    entry.errorListeners.add(onEntryError);
    entries.push(entry);
  }

  evictExpiredOrExcessWarmZones(desc.col);

  if (entries.every((e) => e.loaded)) {
    onEntryUpdate();
  }

  return () => {
    destroyed = true;
    const releasedAt = Date.now();
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      entry.listeners.delete(onEntryUpdate);
      entry.errorListeners.delete(onEntryError);
      entry.refCount = Math.max(0, entry.refCount - 1);
      entry.lastUsedAt = releasedAt;
    }
    evictExpiredOrExcessWarmZones(desc.col);
  };
}

/**
 * Subscribe to a single document or a collection/query.
 * Returns an unsubscribe function (same as Firebase).
 */
export function onSnapshot(
  refOrQuery: DocRef | QueryDescriptor,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (snapshot: any) => void,
  _errCallback?: (e: unknown) => void
): UnsubscribeFn {
  if (
    refOrQuery &&
    'col' in refOrQuery &&
    !refOrQuery.__bypassZonePool &&
    !refOrQuery.maxItems &&
    !refOrQuery.sort &&
    (refOrQuery.col === 'map_resources' || refOrQuery.col === 'buildings' || refOrQuery.col === 'dropped_items') &&
    refOrQuery.whereField === 'zoneId' &&
    refOrQuery.whereOp === 'in' &&
    Array.isArray(refOrQuery.whereValue)
  ) {
    return subscribeZonePartitionedQuery(refOrQuery, callback, _errCallback);
  }

  let destroyed = false;
  let cleanup: UnsubscribeFn = () => {};
  const safeCleanup = () => {
    Promise.resolve(cleanup()).catch((err: any) => {
      const staleClient = err?.status === 404 || String(err).toLowerCase().includes('client id');
      if (!staleClient) {
        console.warn('[PB Realtime] cleanup error:', err);
      }
    });
  };
  
  // Calculate staggered delay based on subscription order
  const currentSubIndex = subscriptionCounter++ % MAX_STAGGER_SUBSCRIPTIONS;
  const staggerDelay = currentSubIndex * SUBSCRIPTION_DELAY_MS;

  // Helper to safely execute subscribe with retries for 404 (stale CID)
  const safeSubscribe = async (
    collection: string,
    topic: string,
    onEvent: (e: any) => void
  ) => {
    let retries = 0;

    // Stagger subscriptions to avoid "storm" on initial mount
    // Use stagger delay + small random jitter
    const jitter = Math.floor(Math.random() * 200);
    await new Promise(r => setTimeout(r, staggerDelay + jitter));

    while (!destroyed) {
      try {
        const unsub = await pb.collection(collection).subscribe(topic, onEvent);
        if (destroyed) {
          Promise.resolve(unsub()).catch(() => {});
        } else {
          cleanup = unsub;
        }
        return;
      } catch (err: any) {
        retries++;
        const errText = String(err ?? '').toLowerCase();
        const isClientId404 = err?.status === 404 && errText.includes('client id');
        const isGenericRealtime404 = err?.status === 404 && !errText.includes('client id');
        const isTransient =
          isClientId404 ||
          isGenericRealtime404 ||
          err?.status === 429 ||
          err?.status === 503 ||
          errText.includes('network') ||
          errText.includes('timeout') ||
          errText.includes('socket') ||
          errText.includes('fetch');

        const backoffMs = Math.min(30000, 1000 * Math.pow(2, Math.min(retries, 5)));

        if (isGenericRealtime404 && !realtimeUnavailableLogged) {
          realtimeUnavailableLogged = true;
          console.warn('[PB Realtime] /api/realtime returned 404 (likely a PocketBase hot-reload window). Retrying with backoff — realtime will recover automatically instead of falling back to fetch-only.');
        }

        if (!destroyed && isTransient) {
          console.warn(`[PB Realtime] subscribe retry #${retries} in ${backoffMs}ms (${collection}/${topic})`);
          await new Promise(r => setTimeout(r, backoffMs));
          continue;
        }

        _errCallback?.(err);
        if (destroyed) return;
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  };

  // Single document subscription
  if ('collectionName' in refOrQuery) {
    const ref = refOrQuery as DocRef;
    const pbId = sanitizePbId(ref.id);

    // Initial fetch
    getDoc(ref).then((snap) => {
      if (!destroyed) {
        const audited = Object.assign(snap as any, {
          __auditSource: 'refresh-load',
          __auditIncrementalMerge: false,
          __auditFullRefetch: false,
          __auditEventAction: 'initial-fetch',
          __auditEventRecordId: ref.id,
        }) as DocSnapshot;
        logPbAudit('onSnapshot-doc', {
          collectionName: ref.collectionName,
          id: ref.id,
          pbId,
          source: 'refresh-load',
          ...summarizeDocSnapshotForAudit(audited),
        });
        callback(audited);
      }
    }).catch(err => {
      // Silently handle 404 for single doc subscriptions - doc may not exist yet
      if (err?.status !== 404) {
        console.error('[PB onSnapshot] Initial fetch failed:', ref.collectionName, 'id:', ref.id, 'error:', err);
      }
    });

    safeSubscribe(ref.collectionName, pbId, (e) => {
      if (destroyed) return;
      logPbAudit('onSnapshot-event', {
        collectionName: ref.collectionName,
        id: ref.id,
        action: e?.action ?? null,
        eventRecordId: e?.record?.id ?? null,
        source: 'realtime-event',
      });
      if (e.action === 'delete') {
        const snapshot = Object.assign({ id: ref.id, exists: () => false, data: () => ({}) } as any, {
          __auditSource: 'realtime-event',
          __auditIncrementalMerge: false,
          __auditFullRefetch: false,
          __auditEventAction: 'delete',
          __auditEventRecordId: ref.id,
        }) as DocSnapshot;
        callback(snapshot);
      } else {
        const snap = toDocSnapshot(e.record);
        const audited = Object.assign(snap as any, {
          __auditSource: 'realtime-event',
          __auditIncrementalMerge: false,
          __auditFullRefetch: false,
          __auditEventAction: e?.action ?? 'update',
          __auditEventRecordId: e?.record?.id ?? ref.id,
        }) as DocSnapshot;
        callback(audited);
      }
    });

    return () => {
      destroyed = true;
      safeCleanup();
    };
  }

  // Collection / query subscription
  const desc = refOrQuery as QueryDescriptor;
  let prevDocs: DocSnapshot[] = [];
  let initialSnapshotReady = false;
  const isZoneScopedRealtimeQuery =
    (desc.col === 'map_resources' || desc.col === 'buildings' || desc.col === 'dropped_items') &&
    desc.whereField === 'zoneId' &&
    desc.whereOp === 'in' &&
    Array.isArray(desc.whereValue);
  const queriedZoneIds = isZoneScopedRealtimeQuery
    ? new Set(
        (desc.whereValue as unknown[])
          .map((value) => String(value || '').trim())
          .filter(Boolean)
      )
    : null;
  const querySummary = {
    collectionName: desc.col,
    filter: desc.filter || '',
    sort: desc.sort || '',
    maxItems: desc.maxItems ?? null,
    whereField: desc.whereField ?? null,
    whereOp: desc.whereOp ?? null,
    whereValue: Array.isArray(desc.whereValue) ? desc.whereValue.length : desc.whereValue ?? null,
  };
  const attachAuditMeta = (snapshot: any, meta: Record<string, unknown>) => {
    try {
      Object.assign(snapshot as Record<string, unknown>, {
        __auditQuery: querySummary,
        ...meta,
      });
    } catch {
      // Ignore audit annotation failures.
    }
    return snapshot;
  };

  const buildSnapshotFromDocs = (docs: DocSnapshot[]): QuerySnapshot => {
    const changes: { type: 'added' | 'modified' | 'removed'; doc: DocSnapshot }[] = [];

    const prevMap = new Map(prevDocs.map((d) => [d.id, d]));
    const newMap = new Map(docs.map((d) => [d.id, d]));

    newMap.forEach((doc, id) => {
      changes.push({ type: prevMap.has(id) ? 'modified' : 'added', doc });
    });
    prevMap.forEach((doc, id) => {
      if (!newMap.has(id)) changes.push({ type: 'removed', doc });
    });

    prevDocs = docs;
    return { docs, size: docs.length, empty: docs.length === 0, forEach: (cb) => docs.forEach(cb), docChanges: () => changes };
  };

  const buildSnapshot = (records: RecordModel[]): QuerySnapshot => buildSnapshotFromDocs(records.map(toDocSnapshot));

  const checkRecordMatchesQuery = (record: RecordModel | undefined): boolean => {
    if (!record) return false;

    // Use unwrapped data to reliably check both top-level columns and data JSON fields
    const item = unwrapData(record);

    // Check where constraints if present
    if (desc.whereField && desc.whereOp) {
      const recVal = (item as any)[desc.whereField];
      const strRecVal = recVal !== undefined && recVal !== null ? String(recVal).trim() : '';

      if (desc.whereOp === '==' || desc.whereOp === '===') {
        if (strRecVal !== String(desc.whereValue ?? '').trim()) {
          return false;
        }
      } else if (desc.whereOp === 'in') {
        if (Array.isArray(desc.whereValue)) {
          const allowed = new Set(desc.whereValue.map((v) => String(v ?? '').trim()));
          if (!allowed.has(strRecVal)) {
            return false;
          }
        } else {
          return false;
        }
      } else if (desc.whereOp === 'array-contains') {
        const expected = String(desc.whereValue ?? '').trim();
        if (Array.isArray(recVal)) {
          if (!recVal.map(String).includes(expected)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return true;
  };

  const buildIncrementalSnapshot = (event: any): QuerySnapshot | null => {
    if (!initialSnapshotReady) return null;

    const record = event?.record as RecordModel | undefined;
    const recordId = String(record?.id || '').trim();
    if (!recordId) return null;

    const action = String(event?.action || '').toLowerCase();
    const isDelete = action === 'delete';
    const matches = !isDelete && checkRecordMatchesQuery(record);

    const gameId = String((record as any)?.gameId || (record as any)?.data?.gameId || '').trim();
    const existingIndex = prevDocs.findIndex((doc) => doc.id === recordId || (Boolean(gameId) && doc.id === gameId));

    if (isDelete || !matches) {
      if (existingIndex === -1) return null;
      const nextDocs = [...prevDocs];
      nextDocs.splice(existingIndex, 1);
      return buildSnapshotFromDocs(nextDocs);
    }

    const nextDoc = toDocSnapshot(record);
    const nextDocs = [...prevDocs];
    if (existingIndex >= 0) {
      nextDocs[existingIndex] = nextDoc;
    } else {
      if (typeof desc.maxItems === 'number' && nextDocs.length >= desc.maxItems) {
        return null;
      }
      nextDocs.push(nextDoc);
    }

    return buildSnapshotFromDocs(nextDocs);
  };

  // Initial fetch (using queue)
  const initialFetchStartedAt = Date.now();
  fetchQueryRecords(desc)
    .then((records) => {
      if (!destroyed) {
        initialSnapshotReady = true;
        const snapshot = attachAuditMeta(buildSnapshot(records as RecordModel[]), {
          __auditSource: 'refresh-load',
          __auditIncrementalMerge: false,
          __auditFullRefetch: true,
          __auditRefetchMs: Date.now() - initialFetchStartedAt,
          __auditEventAction: 'initial-fetch',
          __auditEventRecordId: null,
        });
        logPbAudit('onSnapshot-refresh-load', {
          ...querySummary,
          durationMs: Date.now() - initialFetchStartedAt,
          ...summarizeQuerySnapshotForAudit(snapshot),
        });
        callback(snapshot);
      }
    })
    .catch((err) => {
      console.error(`[PB onSnapshot] Collection fetch error for ${desc.col}:`, err);
      _errCallback?.(err);
    });

  // Real-time Update Handler with light throttling.
  // We refetch immediately on the first event, then coalesce bursts into a short cooldown.
  // Presence gets a long cooldown: every MOVING player's 800ms PATCH triggered a full
  // presence-list refetch (75KB+ for ~90 players, parse + rebuild) up to 4x/sec, which
  // scales linearly with online players. Client-side nameplate interpolation makes the
  // 2s delay invisible, and chat/players list refresh is not latency-critical.
  // buildings (my/clan/initiated wildcards) also get a long cooldown: production
  // completion bursts (workTimeSeconds ~15s cycles) made EVERY connected client
  // refetch its building queries up to 4x/sec — 4 subscriptions x full zone parses
  // = the reported 3-5s freezes on all clients simultaneously. Optimistic local
  // updates already reflect the player's own actions instantly; the refetch only
  // confirms server state, so a 1.2s delay is invisible.
  let throttleTimeout: NodeJS.Timeout | null = null;
  const THROTTLE_MS_BY_COLLECTION: Record<string, number> = { presence: 2000, buildings: 1200 };
  const THROTTLE_MS = THROTTLE_MS_BY_COLLECTION[desc.col] ?? 250;
  let pendingUpdate = false;

  const fetchLatestSnapshot = async (meta: Record<string, unknown> = {}) => {
    const refetchStartedAt = Date.now();
    try {
      const records = await fetchQueryRecords(desc);
      if (!destroyed) {
        const snapshot = attachAuditMeta(buildSnapshot(records as RecordModel[]), {
          __auditSource: 'realtime-event',
          __auditIncrementalMerge: false,
          __auditFullRefetch: true,
          __auditRefetchMs: Date.now() - refetchStartedAt,
          ...meta,
        });
        logPbAudit('onSnapshot-refetch', {
          ...querySummary,
          refetchMs: Date.now() - refetchStartedAt,
          ...meta,
          ...summarizeQuerySnapshotForAudit(snapshot),
        });
        callback(snapshot);
      }
    } catch (e) {
      console.error(`[PB onSnapshot] Update fetch error for ${desc.col}:`, e);
      _errCallback?.(e);
    }
  };

  const armCooldown = () => {
    throttleTimeout = setTimeout(async () => {
      throttleTimeout = null;
      if (destroyed) return;

      if (!pendingUpdate) return;

      pendingUpdate = false;
      await fetchLatestSnapshot({ __auditRefetchMode: 'cooldown' });
      if (!destroyed) {
        armCooldown();
      }
    }, THROTTLE_MS);
  };

  const handleUpdate = async (meta: Record<string, unknown> = {}) => {
    if (destroyed) return;

    if (throttleTimeout) {
      pendingUpdate = true;
      logPbAudit('onSnapshot-queued', {
        ...querySummary,
        ...meta,
        refetchMode: 'pending-cooldown',
      });
      return;
    }

    await fetchLatestSnapshot({ __auditRefetchMode: 'immediate', ...meta });
    if (!destroyed) {
      armCooldown();
    }
  };

  safeSubscribe(desc.col, '*', async (event) => {
    const eventAction = String(event?.action || '').toLowerCase();
    const eventRecordId = String(event?.record?.id || '').trim() || null;
    if (PB_RUNTIME_AUDIT_ENABLED) {
      logPbAudit('onSnapshot-event', {
        ...querySummary,
        action: eventAction || null,
        eventRecordId,
        source: 'realtime-event',
      });
    }
    const nextSnapshot = buildIncrementalSnapshot(event);
    if (nextSnapshot) {
      const auditedSnapshot = attachAuditMeta(nextSnapshot, {
        __auditSource: 'realtime-event',
        __auditIncrementalMerge: true,
        __auditFullRefetch: false,
        __auditRefetchMs: 0,
        __auditEventAction: eventAction || null,
        __auditEventRecordId: eventRecordId,
      });
      if (PB_RUNTIME_AUDIT_ENABLED) {
        logPbAudit('onSnapshot-incremental', {
          ...querySummary,
          action: eventAction || null,
          eventRecordId,
          refetchMode: 'incremental-merge',
          ...summarizeQuerySnapshotForAudit(auditedSnapshot),
        });
      }
      callback(auditedSnapshot);
      return;
    }

    // If nextSnapshot is null:
    // If the record does not match our query criteria and was not tracked, ignore it safely without refetch!
    const matches = checkRecordMatchesQuery(event?.record);
    const wasTracked = eventRecordId ? prevDocs.some((doc) => doc.id === eventRecordId) : false;
    if (!matches && !wasTracked) {
      return;
    }

    handleUpdate({
      __auditEventAction: eventAction || null,
      __auditEventRecordId: eventRecordId,
    });
  });

  return () => {
    destroyed = true;
    if (throttleTimeout) clearTimeout(throttleTimeout);
    safeCleanup();
  };
}

// ─── Exports for Storage (stubs — not used actively) ─────────────────────────
export const storage = null;
export function ref(): null { return null; }
export async function uploadBytes(): Promise<void> {}
export async function getDownloadURL(): Promise<string> { return ''; }
export async function uploadBytesResumable(): Promise<void> {}

// ─── Transaction object with get/update/set/delete (sequential, not atomic) ──
export interface PBTransaction {
  get(ref: DocRef): Promise<DocSnapshot>;
  update(ref: DocRef, data: AnyRecord): void;
  set(ref: DocRef, data: AnyRecord): void;
  delete(ref: DocRef): void;
}

export async function runTransaction<T>(
  _db: unknown,
  fn: (t: PBTransaction) => Promise<T>
): Promise<T> {
  const startedAt = Date.now();
  const pendingOps: (() => Promise<void>)[] = [];
  logPbAudit('runTransaction-start', {
    pendingOpsCount: pendingOps.length,
  });

  const transaction: PBTransaction = {
    get: (ref: DocRef) => getDoc(ref),
    update: (ref: DocRef, data: AnyRecord) => {
      pendingOps.push(() => updateDoc(ref, data));
    },
    set: (ref: DocRef, data: AnyRecord) => {
      pendingOps.push(() => setDoc(ref, data));
    },
    delete: (ref: DocRef) => {
      pendingOps.push(() => deleteDoc(ref));
    },
  };

  try {
    const result = await fn(transaction);
    await Promise.all(pendingOps.map((op) => op()));
    logPbAudit('runTransaction-end', {
      durationMs: Date.now() - startedAt,
      pendingOpsCount: pendingOps.length,
    });
    return result;
  } catch (error) {
    logPbAudit('runTransaction-error', {
      durationMs: Date.now() - startedAt,
      pendingOpsCount: pendingOps.length,
      error: String(error),
    });
    throw error;
  }
}

// ─── writeBatch stub ─────────────────────────────────────────────────────────
export function writeBatch(_db: unknown) {
  const ops: (() => Promise<void>)[] = [];
  return {
    set: (ref: DocRef, data: AnyRecord) => {
      ops.push(() => setDoc(ref, data));
    },
    update: (ref: DocRef, data: AnyRecord) => {
      ops.push(() => updateDoc(ref, data));
    },
    delete: (ref: DocRef) => {
      ops.push(() => deleteDoc(ref));
    },
    commit: async () => {
      // Execute sequentially to prevent concurrent read-modify-write races on same document
      for (const op of ops) {
        await op();
      }
    },
  };
}

// ─── Dummy db/googleProvider (not needed in PB) ──────────────────────────────
export const db = null;
export const googleProvider = null;

// ─── OperationType enum (same as Firebase version) ───────────────────────────
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path?: string | null
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  let details = typeof error === 'object' && error !== null && 'data' in error ? ((error as any).data?.data || (error as any).data) : undefined;
  
  if (!details && typeof error === 'object' && error !== null && 'response' in error) {
      details = (error as any).response?.data;
  }

  console.error(`❌ [POCKETBASE ERROR] ${operationType.toUpperCase()} on ${path || 'unknown'}: ${errorMessage}`);
  if (details) {
      console.error('Details:', JSON.stringify(details, null, 2));
      if (typeof details === 'object') {
          for (const [field, info] of Object.entries(details as any)) {
             console.error(`❌ Field Validation Error => ${field}: ${(info as any)?.message}`);
          }
      }
  }
  
  // Visual log for user if it's a permission error
  if (errorMessage.toLowerCase().includes('forbidden') || errorMessage.includes('403')) {
      console.warn("⚠️ PERMISSION DENIED: Check your PocketBase API Rules for collection: " + (path ? path.split('/')[0] : 'unknown'));
  }

  // Ignore throw globally to prevent background sync crashes, 
  // but explicitly rethrow it in critical functions like `updateDoc` transactions.
}

export async function testConnection(): Promise<boolean> {
  try {
    await pb.health.check();
    return true;
  } catch (error) {
    console.error('PocketBase connection failed:', error);
    return false;
  }
}

export const TREE_HIT_API_PATH = '/api/basingse/tree-hit';

export type TreeHitResponse = {
  success: boolean;
  applied?: boolean;
  resourceId?: string;
  depleted?: boolean;
  currentHp?: number;
  rewardGold?: number;
  rewardWood?: number;
  rewardGlory?: number;
  energyCost?: number;
  treesChoppedIncrement?: number;
  code?: string;
  error?: string;
  requiredEnergy?: number;
  currentEnergy?: number;
  message?: string;
  reason?: string;
  playerGold?: number;
  playerEnergy?: number;
  playerGlory?: number;
  playerTreesChopped?: number;
  inventory?: Record<string, number>;
};

export async function requestTreeHit(resourceId: string): Promise<TreeHitResponse> {
  const token = pb.authStore.token;
  if (!token) {
    const error = new Error('Authentication required') as Error & { status?: number };
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${pb.baseUrl}${TREE_HIT_API_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ resourceId }),
  });

  const payload = await response.json().catch(() => ({})) as TreeHitResponse;
  if (!response.ok) {
    const message = payload?.message || payload?.error || payload?.code || `Tree hit failed (${response.status})`;
    const error = new Error(message) as Error & { status?: number; details?: TreeHitResponse };
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}

export const CHEST_COLLECT_API_PATH = '/api/basingse/chest-collect';

export type ChestCollectMode = 'share' | 'private';

export type ChestCollectResponse = {
  success: boolean;
  applied?: boolean;
  resourceId?: string;
  mode?: ChestCollectMode;
  rewardGold?: number;
  playerGold?: number;
  playerEnergy?: number;
  playerGlory?: number;
  requiredEnergy?: number;
  currentEnergy?: number;
  chestDeleted?: boolean;
  createdShare?: boolean;
  chest?: {
    gameId?: string;
    x?: number;
    y?: number;
    zoneId?: string;
    finderId?: string;
    finderName?: string;
    collectors?: string[];
  } | null;
  code?: string;
  error?: string;
  message?: string;
  details?: {
    alreadyCollected?: boolean;
    playerGold?: number;
    chestDeleted?: boolean;
    chest?: ChestCollectResponse['chest'];
    [key: string]: unknown;
  };
};

export async function requestChestCollect(
  resourceId: string,
  mode: ChestCollectMode
): Promise<ChestCollectResponse> {
  const token = pb.authStore.token;
  if (!token) {
    const error = new Error('Authentication required') as Error & { status?: number };
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${pb.baseUrl}${CHEST_COLLECT_API_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ resourceId, mode }),
  });

  const payload = await response.json().catch(() => ({})) as ChestCollectResponse;
  if (!response.ok) {
    const message = payload?.message || payload?.error || payload?.code || `Chest collect failed (${response.status})`;
    const error = new Error(message) as Error & { status?: number; details?: ChestCollectResponse };
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}

export const GIFT_SEND_API_PATH = '/api/basingse/gift-send';

export type GiftSendResponse = {
  success: boolean;
  targetUserId?: string;
  targetName?: string;
  buildingId?: number;
  buildingName?: string;
  rubyPrice?: number;
  senderRubies?: number;
  senderName?: string;
  grantedCount?: number;
  notificationAt?: number;
  code?: string;
  error?: string;
  message?: string;
  details?: {
    required?: number;
    available?: number;
    buildingId?: string;
    [key: string]: unknown;
  };
};

export async function requestGiftSend(
  targetUserId: string,
  buildingId: number
): Promise<GiftSendResponse> {
  const token = pb.authStore.token;
  if (!token) {
    const error = new Error('Authentication required') as Error & { status?: number };
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${pb.baseUrl}${GIFT_SEND_API_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ targetUserId, buildingId }),
  });

  const payload = await response.json().catch(() => ({})) as GiftSendResponse;
  if (!response.ok) {
    const message = payload?.message || payload?.error || payload?.code || `Gift send failed (${response.status})`;
    const error = new Error(message) as Error & { status?: number; details?: GiftSendResponse };
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}


