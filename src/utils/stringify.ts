/**
 * 序列化（考虑循环引用）
 * @param value 序列化值
 * @returns {string} 序列化字符串
 */
export const stringify = (value: any) => {
  const moduleMap = new Set();
  return JSON.stringify(value, (k, v) => {
    if ((Object(v) === v)) {
      if (moduleMap.has(v)) return { circular: true, path: v.path };
      moduleMap.add(v);
      return v;
    }
    return v;
  });
};
