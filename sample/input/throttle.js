export const throttle = (callback,time=300) => {
  let previousCallTime = -Infinity;
  const callbackThrottled = function (...args) {
    if(globalThis.performance.now() - previousCallTime < time) return;
    callback.call(this, ...args);
    previousCallTime = globalThis.performance.now();
  };
  return callbackThrottled;
};