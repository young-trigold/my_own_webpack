import {throttle} from './thottle.js';
const component = document.createElement('div');
component.style.width = '300px';
component.style.height = '300px';
component.style.backgroundColor = 'green';
component.style.display = 'flex';
component.style.alignItems = 'center';
component.style.justifyContent = 'center';
component.style.color = 'black';
component.textContent = '(0, 0)';

const onMouseMoveThrottled = throttle((event) => {
  const {clientX,clientY} = event;
  component.textContent = `(${clientX}, ${clientY})`;
});

window.addEventListener('mousemove', onMouseMoveThrottled);
export {component};