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
  list: function(arr, conj = 'and') {
    const len = arr.length;
    return `${arr.slice(0, -1).join(', ')}${
      len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''
    }${arr.slice(-1)}`;
  },
  randomRange: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  shuffle: function(array) {
    const arr = array.slice(0);
    for (let i = arr.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  },
  base64: function(text, mode = 'encode') {
    if (mode === 'encode') return Buffer.from(text).toString('base64');
    if (mode === 'decode')
      return Buffer.from(text, 'base64').toString('utf8') || null;
    throw new TypeError(`${mode} is not a supported base64 mode.`);
  },
  verify: async function(channel, user, time = 30000) {
    const filter = (res) => {
      const value = res.content.toLowerCase();
      return (
        res.author.id === user.id &&
        (['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya'].includes(value) ||
          ['no', 'n', 'nah', 'nope', 'nop'].includes(value))
      );
    };
    const verify = await channel.awaitMessages(filter, {
      max: 1,
      time,
    });
    if (!verify.size) return 0;
    const choice = verify.first().content.toLowerCase();
    if (['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya'].includes(choice))
      return true;
    if (['no', 'n', 'nah', 'nope', 'nop'].includes(choice)) return false;
    return false;
  },
};
