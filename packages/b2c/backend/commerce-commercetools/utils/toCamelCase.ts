export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key) => {
      const camelCaseKey =
        key.charAt(0).toLowerCase() +
        key
          .slice(1)
          .replace(/([A-Z])/g, (g) => `_${g[0].toLowerCase()}`)
          .replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelCaseKey] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}
