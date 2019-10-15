const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const { formatNumber } = require('../../util/util');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Search steam for a game',
      cooldown: 10,
      requiredPermissions: ['EMBED_LINKS'],
      usage: '<query:string>',
      quotedStringSupport: true,
    });
  }

  async run(msg, [query]) {
    const id = await this.search(query);
    if (!id) return msg.send('Could not find any results.');
    const data = await this.fetchGame(id);
    const current = data.price_overview
      ? `$${data.price_overview.final / 100}`
      : 'Free';
    const original = data.price_overview
      ? `$${data.price_overview.initial / 100}`
      : 'Free';
    const price = current === original ? current : `~~${original}~~ ${current}`;
    const platforms = [];
    if (data.platforms) {
      if (data.platforms.windows) platforms.push('Windows');
      if (data.platforms.mac) platforms.push('Mac');
      if (data.platforms.linux) platforms.push('Linux');
    }
    const embed = new MessageEmbed()
      .setColor(0x101d2f)
      .setAuthor(
        'Steam',
        'https://i.imgur.com/xxr2UBZ.png',
        'http://store.steampowered.com/',
      )
      .setTitle(data.name)
      .setURL(`http://store.steampowered.com/app/${data.steam_appid}`)
      .setThumbnail(data.header_image)
      .addField('❯ Price', price, true)
      .addField(
        '❯ Metascore',
        data.metacritic ? data.metacritic.score : '???',
        true,
      )
      .addField(
        '❯ Recommendations',
        data.recommendations ? formatNumber(data.recommendations.total) : '???',
        true,
      )
      .addField('❯ Platforms', platforms.join(', ') || 'None', true)
      .addField(
        '❯ Release Date',
        data.release_date ? data.release_date.date : '???',
        true,
      )
      .addField(
        '❯ DLC Count',
        data.dlc ? formatNumber(data.dlc.length) : 0,
        true,
      )
      .addField(
        '❯ Developers',
        data.developers ? data.developers.join(', ') || '???' : '???',
      )
      .addField(
        '❯ Publishers',
        data.publishers ? data.publishers.join(', ') || '???' : '???',
      );
    return msg.send(embed);
  }

  async search(query) {
    const { data: body } = await axios.get(
      'https://store.steampowered.com/api/storesearch',
      {
        params: {
          cc: 'us',
          l: 'en',
          term: query,
        },
      },
    );
    if (!body.items.length) return null;
    return body.items[0].id;
  }

  async fetchGame(id) {
    const { data: body } = await axios.get(
      'https://store.steampowered.com/api/appdetails',
      { params: { appids: id } },
    );
    return body[id.toString()].data;
  }
};
