// Polyfill for Drizzle ORM - DOMException is not available in Hermes (React Native JS engine)
// This MUST run before any drizzle-orm code is imported
if (typeof globalThis.DOMException === 'undefined') {
  function DOMExceptionPolyfill(message, name) {
    const err = new Error(message);
    err.name = name || 'Error';
    err.code = 0;
    return err;
  }
  DOMExceptionPolyfill.prototype = Object.create(Error.prototype);
  globalThis.DOMException = DOMExceptionPolyfill;
  if (typeof global !== 'undefined') {
    global.DOMException = DOMExceptionPolyfill;
  }
}
