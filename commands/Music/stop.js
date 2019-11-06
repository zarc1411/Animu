const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { model } = require('mongoose');

//Init
const MusicQueue = model('MusicQueue');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text'],
      requiredPermissions: ['EMBED_LINKS'],
      cooldown: 10,
      description: 'Stop Music',
    });
  }

  async run(msg) {
    const musicQueue = await MusicQueue.findOne({
      guildID: msg.guild.id,
    }).exec();

    if (!msg.member.voice.channel)
      return msg.send(
        new MessageEmbed({
          title: 'Not in VC',
          description: 'You must be in a voice channel to stop the music',
          color: '#f44336',
        }),
      );

    if (msg.member.voice.channel.id !== msg.guild.me.voice.channel.id)
      return msg.send(
        new MessageEmbed({
          title: 'Not in Correct VC',
          description:
            'You must be in the same voice channel as Animu to stop music',
          color: '#f44336',
        }),
      );

    if (!musicQueue)
      return msg.send(
        new MessageEmbed({
          title: 'No song playing',
          description: 'No song is playing currently',
          color: '#f44336',
        }),
      );

    if (
      !(await msg.hasAtLeastPermissionLevel(6)) &&
      !msg.member.roles.find(
        (r) =>
          r.id === msg.guild.settings.djRole || r.name.toLowerCase() === 'dj',
      )
    )
      return msg.send(
        new MessageEmbed({
          title: 'DJ Only Command',
          description: 'Only members with DJ role can use this command',
          color: '#f44336',
        }),
      );

    musicQueue.songs = [];
    await musicQueue.save();
    if (this.client.guilds.get(msg.guild.id).me.voice.connection)
      this.client.guilds.get(msg.guild.id).me.voice.connection.dispatcher.end();
    else console.log(this.client.guilds.get(msg.guild.id).me.voice.connection);

    msg.send(
      new MessageEmbed({
        title: 'Stopped',
        description: 'Music stopped',
        color: '#2196f3',
      }),
    );
  }
};
