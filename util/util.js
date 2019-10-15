module.exports = {
  trimArray: function(arr, maxLen = 10) {
    if (arr.length > maxLen) {
      const len = arr.length - maxLen;
      arr = arr.slice(0, maxLen);
      arr.push(`${len} more...`);
    }
    return arr;
  },
  shorten: function(text, maxLen = 2000) {
    return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
  },
  delay: function(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  formatNumber: function(number) {
    return Number.parseFloat(number).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  },
  base64: function(text, mode = 'encode') {
    if (mode === 'encode') return Buffer.from(text).toString('base64');
    if (mode === 'decode')
      return Buffer.from(text, 'base64').toString('utf8') || null;
    throw new TypeError(`${mode} is not a supported base64 mode.`);
  },
};
