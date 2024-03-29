const { Command } = require('klasa');
const { MessageEmbed, Util } = require('discord.js');
const { model } = require('mongoose');
const { youtubeAPIKey, botEnv } = require('../../config/keys');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const redis = require('redis');
const bluebird = require('bluebird');

//Init
const MusicQueue = model('MusicQueue');

bluebird.promisifyAll(redis.RedisClient.prototype);
const youtube = new Youtube(youtubeAPIKey);
const redisClient = redis.createClient();

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text'],
      aliases: ['pl'],
      requiredPermissions: ['EMBED_LINKS', 'CONNECT', 'SPEAK'],
      cooldown: 5,
      description: 'Play Music',
      usage: '<music:...string>',
      extendedHelp:
        'Play music using either:\n- URL\n- Search Term\n- Playlist URL\n\nPlease note that playlist support is currently in BETA and only first 20 songs will be played from playlist',
      quotedStringSupport: true,
    });
  }

  async run(msg, [music]) {
    const voiceChannel = msg.member.voice.channel;

    if (!voiceChannel)
      return msg.send(
        new MessageEmbed({
          title: 'Must be in a VC',
          description: 'You must be in a vc to play music',
          color: '#f44336',
        }),
      );

    const perms = voiceChannel.permissionsFor(this.client.user);
    if (!perms.has('CONNECT') || !perms.has('SPEAK'))
      return msg.send(
        "It seems I don't have perms in Voice Channel that you're currently in",
      );

    if (
      !music.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)
    ) {
      // ? Is NOT Playlist

      let video;

      const cached = await redisClient.hgetAsync(
        'yt_searches',
        music.toLowerCase().trim(),
      );

      if (!cached) {
        // ? Using Search API
        try {
          video = await youtube.getVideo(music);
        } catch (error) {
          try {
            video = (await youtube.search(music, 1))[0];
            await redisClient.hsetAsync(
              'yt_searches',
              music.toLowerCase().trim(),
              video.url,
            );
          } catch (error) {
            return msg.send(
              new MessageEmbed({
                title: 'Music Not Found',
                description:
                  "The music you're trying to play wasn't found on YouTube",
                color: '#f44336',
              }),
            );
          }
        }
      } else {
        // ? Using Cache
        video = await youtube.getVideo(cached);
      }
      this.handleMusic(voiceChannel, video, msg);
    } else {
      // ? Is Playlist
      const playlist = await youtube.getPlaylist(music);
      const videos = await playlist.getVideos(20);
      if (videos.length === 0)
        return msg.send(
          new MessageEmbed({
            title: 'Empty Playlist',
            description: "The playlist you're trying to play is empty",
            color: '#f44336',
          }),
        );

      for (const video of videos) {
        await this.handleMusic(voiceChannel, video, msg);
      }
    }
  }

  handleMusic(voiceChannel, video, msg) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const musicQueue = await MusicQueue.findOne({
        guildID: msg.guild.id,
      }).exec();

      if (!video)
        return msg.send(
          new MessageEmbed({
            title: 'Music Not Found',
            description:
              "The music you're trying to play wasn't found on YouTube",
            color: '#f44336',
          }),
        );

      if (!musicQueue) {
        const queue = new MusicQueue({
          guildID: msg.guild.id,
          songs: [],
          volume: msg.guild.settings.defaultVolume,
        });

        queue.songs.push({
          title: Util.escapeMarkdown(video.title),
          url: video.url,
        });

        await queue.save();

        try {
          const connection = await voiceChannel.join();
          this.play(
            msg.guild.id,
            msg,
            connection,
            queue.songs[0],
            queue.volume,
          );
        } catch (err) {
          await MusicQueue.deleteOne({ guildID: msg.guild.id }).exec();
          return msg.send(
            new MessageEmbed({
              title: "Can't Join",
              description: 'There was an error while trying to join VC',
              color: '#f44336',
            }),
          );
        }
      } else {
        musicQueue.songs.push({
          title: Util.escapeMarkdown(video.title),
          url: video.url,
        });

        await musicQueue.save();

        msg.send(
          new MessageEmbed({
            title: `Added to Queue`,
            description: `**${Util.escapeMarkdown(
              video.title,
            )}** is added to queue`,
            color: '#2196f3',
          }),
        );
      }

      resolve(true);
    });
  }

  async play(guildID, msg, connection, song, volume) {
    let tier;

    if (botEnv === 'production') {
      tier = await redisClient.hgetAsync('guild_tiers', msg.guild.id);
    } else tier = 'pro';

    if (!song) {
      if (this.client.guilds.get(guildID).me.voice.channel)
        this.client.guilds.get(guildID).me.voice.channel.leave();
      await MusicQueue.deleteOne({ guildID }).exec();
      return;
    }

    msg.send(
      new MessageEmbed({
        title: 'Playing',
        description: `[${song.title}](${song.url})`,
        color: '#2196f3',
      }).setFooter('Animu Music Beta'),
    );

    connection
      .play(
        ytdl(song.url, {
          quality: 'highestaudio',
          filter: 'audioonly',
          highWaterMark: 1 << 25,
        }),
        {
          volume: volume / 200,
          // type: 'opus',
          highWaterMark: 1,
          bitrate: tier === 'lite' ? 92000 : 192000,
        },
      )
      .on('end', async () => {
        const musicQueue = await MusicQueue.findOne({ guildID }).exec();

        if (musicQueue.loop === 'disabled') musicQueue.songs.shift();
        else if (musicQueue.loop === 'queue')
          musicQueue.songs.push(musicQueue.songs.shift());

        musicQueue.skipVotes = [];
        await musicQueue.save();
        this.play(
          guildID,
          msg,
          connection,
          musicQueue.songs[0],
          musicQueue.volume,
        );
      });
  }
};
