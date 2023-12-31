const moduleMap = {"D:\\Prjs\\my_own_webpack\\sample\\input\\index.js": () => {
  const {
    component: component
  } = importModule('D:\\Prjs\\my_own_webpack\\sample\\input\\components.js');
  document.body.appendChild(component());
},"D:\\Prjs\\my_own_webpack\\sample\\input\\components.js": () => {
  const {
    throttle: throttle
  } = importModule('D:\\Prjs\\my_own_webpack\\sample\\input\\throttle.js');
  const component = () => {
    const ele = document.createElement('div');
    ele.style.width = '300px';
    ele.style.height = '300px';
    ele.style.backgroundColor = 'green';
    ele.style.display = 'flex';
    ele.style.alignItems = 'center';
    ele.style.justifyContent = 'center';
    ele.style.color = 'black';
    ele.textContent = '(0, 0)';
    const onMouseMoveThrottled = throttle(event => {
      const {
        clientX,
        clientY
      } = event;
      ele.textContent = `(${clientX}, ${clientY})`;
    });
    window.addEventListener('mousemove', onMouseMoveThrottled);
    return ele;
  };
  return {
    component: component
  };
},"D:\\Prjs\\my_own_webpack\\sample\\input\\throttle.js": () => {
  return {
    'throttle': (callback, time = 300) => {
      let previousCallTime = -Infinity;
      const callbackThrottled = function (...args) {
        if (globalThis.performance.now() - previousCallTime < time) return;
        callback.call(this, ...args);
        previousCallTime = globalThis.performance.now();
      };
      return callbackThrottled;
    }
  };
}};
    const importModule = (path) => {
      return moduleMap[path]();
    };
    importModule('D:\\Prjs\\my_own_webpack\\sample\\input\\index.js');