const { Task } = require('klasa');
const mongoose = require('mongoose');
const { botEnv } = require('../config/keys');
const redis = require('redis');
const bluebird = require('bluebird');

//Init
const Guild = mongoose.model('Guild');
bluebird.promisifyAll(redis.RedisClient.prototype);
const redisClient = redis.createClient();

module.exports = class extends Task {
  async run() {
    if (!botEnv === 'production') return;

    const guilds = await Guild.find({}).exec();

    guilds.forEach(async (guild) => {
      if (guild.daysLeft > 0) guild.daysLeft--;

      if (guild.daysLeft === 0) {
        await redisClient.sremAsync('valid_guilds', guild.guildID);
        await redisClient.hdelAsync('guild_tiers', guild.guildID);
      }
      await guild.save();
    });
  }
};
