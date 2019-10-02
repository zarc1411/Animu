//Dependencies
const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');

//Init
const Profile = mongoose.model('Profile');

module.exports = class extends Event {
  async run(member) {
    //If guild isn't valid
    if (!require('../data/validGuilds').has(member.guild.id)) return;

    //Register Profile
    const profile = await Profile.register(member.id);

    const profileFind = await Profile.findOne({ memberID: member.id }).exec();

    if (
      !profileFind.reputation.find(
        (guildRep) => guildRep.guildID === member.guild.id,
      )
    ) {
      profileFind.reputation.push({
        guildID: member.guild.id,
        rep: member.guild.settings.startingRep,
      });

      await profileFind.save();
    }

    if (
      !profileFind.level.find(
        (guildLevel) => guildLevel.guildID === member.guild.id,
      )
    ) {
      profileFind.level.push({
        guildID: member.guild.id,
        level: 1,
        exp: 0,
      });

      await profileFind.save();
    }

    if (
      profile.res === 'already_exists' &&
      member.guild.settings.mutedRole &&
      _.includes(profile.mutedIn, member.guild.id)
    )
      member.roles.add(member.guild.settings.mutedRole, 'Assigning Muted role');
    else if (member.guild.settings.joinRole)
      member.roles.add(member.guild.settings.joinRole, 'Assigning Member role');

    if (member.guild.settings.welcomeChannel) {
      // Send Welcome message
      const welcomeEmbed = new MessageEmbed()
        .setTitle(`${member}, Welcome to ${member.guild.name}`)
        .setColor('#2196f3');

      if (member.guild.settings.welcomeMessage)
        welcomeEmbed.setDescription(member.guild.settings.welcomeMessage);
      if (member.guild.settings.welcomeImageURL)
        welcomeEmbed.setImage(member.guild.settings.welcomeImageURL);

      member.guild.channels
        .get(member.guild.settings.welcomeChannel)
        .send(welcomeEmbed);
    }
  }
};
