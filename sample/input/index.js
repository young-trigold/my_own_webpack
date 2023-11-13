import {component} from './components.js';
import {throttle} from './thottle.js';
console.debug(component);
const el = component();

const onMouseMoveThrottled = throttle((event) => {
  const {clientX,clientY} = event;
  el.textContent = `(${clientX}, ${clientY})`;
});

window.addEventListener('mousemove', onMouseMoveThrottled);
document.body.appendChild(el);
