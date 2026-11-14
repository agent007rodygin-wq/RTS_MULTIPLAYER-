/// <reference path="../pb_data/types.d.ts" />
// ─── Basingse security utilities (2026-11 security pass) ─────────────────────
// PocketBase JSVM (goja) has no Node "crypto" module, so HMAC-SHA256 is
// implemented in pure JS. The crypto + Telegram initData helpers are
// dependency-free and unit-tested from Node (tests/security/hmac_initdata_test.mjs).
// Functions that need $app / $os must only touch them inside their body so the
// module can still be imported by Node for testing.

// NOTE: plain arrays are used instead of typed arrays (Uint8Array/Uint32Array)
// so the code runs identically inside the PocketBase goja JSVM regardless of
// its typed-array support level, and so Node can require() it for tests.

function newByteArray(len) {
  var a = [];
  for (var i = 0; i < len; i++) a[i] = 0;
  return a;
}

function copyInto(src, dest, destOffset) {
  for (var i = 0; i < src.length; i++) dest[destOffset + i] = src[i];
  return dest;
}

// ── SHA-256 (pure JS) ─────────────────────────────────────────────────────────

var SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function imul32(a, b) {
  if (Math.imul) return Math.imul(a, b) | 0;
  var ah = (a >>> 16) & 0xffff, al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
  return ((al * bl + (((ah * bl + al * bh) << 16) >>> 0)) | 0);
}

function rotr32(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256Bytes(bytes) {
  var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var len = bytes.length;
  var paddedLen = Math.ceil((len + 9) / 64) * 64;
  var padded = newByteArray(paddedLen);
  copyInto(bytes, padded, 0);
  padded[len] = 0x80;
  var bitLenHi = Math.floor(len / 536870912);
  var bitLenLo = (len << 3) >>> 0;
  padded[paddedLen - 8] = (bitLenHi >>> 24) & 0xff;
  padded[paddedLen - 7] = (bitLenHi >>> 16) & 0xff;
  padded[paddedLen - 6] = (bitLenHi >>> 8) & 0xff;
  padded[paddedLen - 5] = bitLenHi & 0xff;
  padded[paddedLen - 4] = (bitLenLo >>> 24) & 0xff;
  padded[paddedLen - 3] = (bitLenLo >>> 16) & 0xff;
  padded[paddedLen - 2] = (bitLenLo >>> 8) & 0xff;
  padded[paddedLen - 1] = bitLenLo & 0xff;

  var w = newByteArray(64);
  for (var off = 0; off < paddedLen; off += 64) {
    var i, t, t2;
    for (i = 0; i < 16; i++) {
      var j = off + i * 4;
      w[i] = ((padded[j] << 24) | (padded[j + 1] << 16) | (padded[j + 2] << 8) | padded[j + 3]) >>> 0;
    }
    for (t = 16; t < 64; t++) {
      var x = w[t - 15], y = w[t - 2];
      var s0 = rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
      var s1 = rotr32(y, 17) ^ rotr32(y, 19) ^ (y >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (t2 = 0; t2 < 64; t2++) {
      var S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      var ch = (e & f) ^ (~e & g);
      var temp1 = (h + S1 + ch + SHA256_K[t2] + w[t2]) >>> 0;
      var S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }

  var out = newByteArray(32);
  for (var k = 0; k < 8; k++) {
    out[k * 4] = (H[k] >>> 24) & 0xff;
    out[k * 4 + 1] = (H[k] >>> 16) & 0xff;
    out[k * 4 + 2] = (H[k] >>> 8) & 0xff;
    out[k * 4 + 3] = H[k] & 0xff;
  }
  return out;
}

// ── HMAC-SHA256 ────────────────────────────────────────────────────────────────

function hmacSha256Bytes(keyBytes, msgBytes) {
  var blockSize = 64;
  var k = keyBytes;
  if (k.length > blockSize) k = sha256Bytes(k);
  var paddedKey = newByteArray(blockSize);
  copyInto(k, paddedKey, 0);
  var ipad = newByteArray(blockSize);
  var opad = newByteArray(blockSize);
  for (var i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }
  var inner = newByteArray(blockSize + msgBytes.length);
  copyInto(ipad, inner, 0);
  copyInto(msgBytes, inner, blockSize);
  var innerHash = sha256Bytes(inner);
  var outer = newByteArray(blockSize + 32);
  copyInto(opad, outer, 0);
  copyInto(innerHash, outer, blockSize);
  return sha256Bytes(outer);
}

function hmacSha256Hex(keyUtf8, msgUtf8) {
  return bytesToHex(hmacSha256Bytes(utf8Bytes(String(keyUtf8)), utf8Bytes(String(msgUtf8))));
}

function sha256Hex(str) {
  return bytesToHex(sha256Bytes(utf8Bytes(String(str))));
}

// ── byte/string helpers ────────────────────────────────────────────────────────

function utf8Bytes(str) {
  var s = String(str);
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      var c2 = str.charCodeAt(i + 1);
      if (c2 >= 0xdc00 && c2 <= 0xdfff) {
        var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
        i++;
      } else {
        out.push(0xef, 0xbf, 0xbd); // unpaired surrogate → U+FFFD
      }
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
  }
  return out;
}

function bytesToHex(bytes) {
  var hex = "";
  for (var i = 0; i < bytes.length; i++) {
    hex += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
  }
  return hex;
}

function hexToBytes(hex) {
  var clean = String(hex || "").toLowerCase();
  if (clean.length % 2 !== 0) return [];
  var out = newByteArray(clean.length / 2);
  for (var i = 0; i < out.length; i++) {
    var v = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (isNaN(v)) return [];
    out[i] = v;
  }
  return out;
}

function constantTimeHexEquals(a, b) {
  a = String(a || "").toLowerCase();
  b = String(b || "").toLowerCase();
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  return diff === 0;
}

// ── Telegram initData validation (server-side proof of identity) ─────────────
// Spec: secret_key = HMAC_SHA256(bot_token, "WebAppData");
//       hash       = HMAC_SHA256(secret_key, data_check_string);
//       data_check_string = all fields except `hash`, sorted by key, joined "\n".

function validateTelegramInitData(initData, botToken, maxAgeSeconds) {
  var fail = function (reason) { return { ok: false, user: null, reason: reason }; };
  initData = String(initData || "");
  botToken = String(botToken || "");
  if (!initData || !botToken) return fail("MISSING_INPUT");

  var pairs = initData.split("&");
  var map = {};
  var keys = [];
  var providedHash = "";
  for (var i = 0; i < pairs.length; i++) {
    var idx = pairs[i].indexOf("=");
    if (idx <= 0) continue;
    var key = pairs[i].slice(0, idx);
    var value = pairs[i].slice(idx + 1);
    if (key === "hash") {
      providedHash = String(value || "").toLowerCase();
      continue;
    }
    if (keys.indexOf(key) === -1) keys.push(key);
    map[key] = value;
  }
  if (!providedHash || keys.indexOf("auth_date") === -1 || keys.indexOf("user") === -1) {
    return fail("MISSING_FIELDS");
  }

  keys.sort();
  var checkString = "";
  for (var k = 0; k < keys.length; k++) {
    checkString += (k ? "\n" : "") + keys[k] + "=" + map[keys[k]];
  }

  var secretKey = hmacSha256Bytes(utf8Bytes("WebAppData"), utf8Bytes(botToken));
  var computed = bytesToHex(hmacSha256Bytes(secretKey, utf8Bytes(checkString)));
  if (!constantTimeHexEquals(computed, providedHash)) return fail("BAD_SIGNATURE");

  var authDate = Number(map["auth_date"]);
  if (!isFinite(authDate) || authDate <= 0) return fail("BAD_AUTH_DATE");
  // maxAgeSeconds of 0 / null / undefined-but-explicit 0 → skip freshness check;
  // anything else bounds how long ago initData may have been signed.
  var maxAge = (maxAgeSeconds === undefined || maxAgeSeconds === null || maxAgeSeconds === "")
    ? 86400
    : Number(maxAgeSeconds);
  if (maxAge > 0 && Date.now() / 1000 - authDate > maxAge) return fail("EXPIRED");

  var user = null;
  try { user = JSON.parse(decodeURIComponent(map["user"])); } catch (_e) { user = null; }
  if (!user || typeof user !== "object" || Array.isArray(user) || !user.id) return fail("BAD_USER");

  return { ok: true, user: user, reason: "OK", authDate: authDate };
}

// ── In-memory rate limiting (fixed 1-minute window, per PocketBase process) ──

var _rateBuckets = {};

function checkRateLimit(key, maxPerMinute) {
  key = String(key || "");
  if (!key || !(maxPerMinute > 0)) return true;
  var now = Date.now();
  var windowStart = now - (now % 60000);
  var b = _rateBuckets[key];
  if (!b || b.windowStart !== windowStart) {
    b = { windowStart: windowStart, count: 0 };
    _rateBuckets[key] = b;
    if (Object.keys(_rateBuckets).length > 20000) pruneRateBuckets(now);
  }
  b.count++;
  return b.count <= maxPerMinute;
}

function pruneRateBuckets(now) {
  for (var key in _rateBuckets) {
    if (Object.prototype.hasOwnProperty.call(_rateBuckets, key)) {
      if (_rateBuckets[key].windowStart < now - 120000) delete _rateBuckets[key];
    }
  }
}

// ── Guards (need $app / $os — call-time only, not at import) ─────────────────

function securityLog(kind, details) {
  try {
    console.log("[SECURITY] " + kind + " " + JSON.stringify(details || {}));
  } catch (_e) {
    console.log("[SECURITY] " + kind);
  }
}

// requestInfo().headers key casing varies across PocketBase versions:
// newer versions lowercase keys and replace "-" with "_" (e.g. "x_internal_secret"),
// older ones use canonical HTTP casing. Look up all variants.

function headerValue(h, name) {
  var lower = String(name || "").toLowerCase();
  return h[name] || h[lower] || h[lower.replace(/-/g, "_")] || "";
}

function resolveAuthRecord(e) {
  try {
    var h = e.requestInfo().headers;
    var token = String(headerValue(h, "Authorization")).replace(/^Bearer\s+/i, "").trim();
    if (!token) return null;
    return $app.findAuthRecordByToken(token);
  } catch (_e) {
    return null;
  }
}

function getInternalSecret() {
  try {
    return String($os.getenv("TELEGRAM_LINK_SECRET") || "");
  } catch (_e) {
    return "";
  }
}

function getTelegramBotToken() {
  try {
    return String($os.getenv("TELEGRAM_BOT_TOKEN") || "");
  } catch (_e) {
    return "";
  }
}

function verifyInternalSecret(e) {
  var expected = getInternalSecret();
  if (!expected) return false;
  try {
    var h = e.requestInfo().headers;
    var provided = String(headerValue(h, "X-Internal-Secret"));
    if (!provided) return false;
    return constantTimeHexEquals(sha256Hex(provided), sha256Hex(expected));
  } catch (_e) {
    return false;
  }
}

function requestKey(e) {
  var record = resolveAuthRecord(e);
  if (record && record.id) return "u:" + record.id;
  try {
    var h = e.requestInfo().headers;
    var ip = String(headerValue(h, "X-Forwarded-For")).split(",")[0].trim();
    if (!ip) ip = String(headerValue(h, "X-Real-IP")).split(",")[0].trim();
    return "ip:" + (ip || "anon");
  } catch (_e) {
    return "ip:anon";
  }
}

function isValidTelegramId(id) {
  return /^[0-9]{1,20}$/.test(String(id || "").trim());
}

module.exports = {
  sha256Bytes: sha256Bytes,
  sha256Hex: sha256Hex,
  hmacSha256Bytes: hmacSha256Bytes,
  hmacSha256Hex: hmacSha256Hex,
  utf8Bytes: utf8Bytes,
  bytesToHex: bytesToHex,
  hexToBytes: hexToBytes,
  constantTimeHexEquals: constantTimeHexEquals,
  validateTelegramInitData: validateTelegramInitData,
  checkRateLimit: checkRateLimit,
  securityLog: securityLog,
  resolveAuthRecord: resolveAuthRecord,
  getInternalSecret: getInternalSecret,
  getTelegramBotToken: getTelegramBotToken,
  verifyInternalSecret: verifyInternalSecret,
  requestKey: requestKey,
  isValidTelegramId: isValidTelegramId
};
