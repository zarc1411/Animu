const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text', 'dm', 'group'],
      requiredPermissions: ['EMBED_LINKS'],
      cooldown: 10,
      description: 'Get a fact about a number',
      usage: '<number:int>',
    });
  }

  async run(msg, [number]) {
    const { res, data } = await axios.get(`http://numbersapi.com/${number}`);

    msg.sendEmbed(
      new MessageEmbed()
        .setTitle(`A fact about number **${number}**`)
        .setDescription(!data ? 'No fact found' : data)
        .setColor(!data ? '#f44336' : '#2196f3'),
    );
  }
};
