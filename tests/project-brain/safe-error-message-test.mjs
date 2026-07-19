import { safeErrorMessage } from '../../src/project-brain/safe-error-message.ts';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
  } else {
    console.error(`FAIL [safe-error-message]: ${name}`);
    failed++;
  }
}

assert(safeErrorMessage(new Error('boom')) === 'boom', 'Error instance returns error.message');
assert(safeErrorMessage(new TypeError('type err')) === 'type err', 'TypeError returns message');
assert(safeErrorMessage('plain string') === 'plain string', 'plain string returned as-is');
assert(safeErrorMessage('') === '', 'empty string returned as-is');
assert(safeErrorMessage(42) === '42', 'number converted to string');
assert(safeErrorMessage(0) === '0', 'zero converted to string');
assert(safeErrorMessage(true) === 'true', 'boolean true converted to string');
assert(safeErrorMessage(false) === 'false', 'boolean false converted to string');
assert(safeErrorMessage(null) === 'null', 'null converted to string');
assert(safeErrorMessage(undefined) === 'undefined', 'undefined converted to string');
assert(safeErrorMessage(Symbol('test')) === 'Symbol(test)', 'symbol returns symbol.toString()');
assert(safeErrorMessage(123n) === '123', 'BigInt converted to string');
assert(safeErrorMessage([1, 2, 3]) === '1,2,3', 'array converted via Array.toString');
assert(safeErrorMessage({}) === '[object Object]', 'plain object returns [object Object]');
assert(safeErrorMessage({ key: 'value' }) === '[object Object]', 'object with keys returns [object Object]');

const throwingObj = {
  toString() { throw new Error('toString exploded'); },
};
assert(safeErrorMessage(throwingObj) === 'An unknown error occurred.', 'object with throwing toString returns fallback');

const customToString = {
  toString() { return 'custom'; },
};
assert(safeErrorMessage(customToString) === 'custom', 'object with custom toString returns its result');

const throwingSymbol = Object(Symbol('bad'));
assert(typeof safeErrorMessage(throwingSymbol) === 'string', 'boxed symbol produces a string');

console.log(`safe-error-message-test: ${passed} passed, ${failed} failed`);
