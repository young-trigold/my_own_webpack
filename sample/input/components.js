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
  return ele;
} 
export {component};