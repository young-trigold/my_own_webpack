let num = 0;

export const uniqueId = () => (Math.random() + num++).toString(36);
