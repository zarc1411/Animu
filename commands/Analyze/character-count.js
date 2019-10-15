const { Command } = require('klasa');
const { formatNumber } = require('../../util/util');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text', 'dm', 'group'],
      aliases: ['characters', 'chars', 'length'],
      cooldown: 10,
      description: 'Count characters of a text',
      usage: '<text:string>',
      quotedStringSupport: true,
    });
  }

  async run(msg, [text]) {
    return msg.reply(formatNumber(text.length));
  }
};
