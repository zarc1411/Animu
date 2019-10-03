const { Command } = require('klasa');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text'],
      aliases: ['p', 'member'],
      requiredPermissions: ['EMBED_LINKS'],
      cooldown: 10,
      description: 'View profile',
      extendedHelp:
        'View your own profile or mention someone to view their profile',
      usage: '[member:user]',
    });
  }

  async run(msg, [member = msg.author]) {
    msg.sendEmbed(await member.getProfileEmbed(msg.guild.id));
  }
};
