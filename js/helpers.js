export const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
};

export const camelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

// не используется
export const sortObject2 = (obj) => {
  Object.keys(obj).reduce((accumulator, currentValue) => {
    accumulator[currentValue] = obj[currentValue];
    return accumulator;
  }, {});
};
