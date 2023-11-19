import {throttle} from './throttle.js';

const component = () =>{
  const ele = document.createElement('div');
  ele.style.width = '300px';
  ele.style.height = '300px';
  ele.style.backgroundColor = 'green';
  ele.style.display = 'flex';
  ele.style.alignItems = 'center';
  ele.style.justifyContent = 'center';
  ele.style.color = 'black';
  ele.textContent = '(0, 0)';
  const onMouseMoveThrottled = throttle((event) => {
    const {clientX,clientY} = event;
    ele.textContent = `(${clientX}, ${clientY})`;
  });
  
  window.addEventListener('mousemove', onMouseMoveThrottled);
  return ele;
} 
export {component};