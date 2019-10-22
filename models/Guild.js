const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
  guildID: String,
  tier: {
    type: String,
    enum: ['lite', 'plus', 'pro'],
  },
  daysLeft: Number, // Days left till this guild's registration expires
  levelPerks: [
    {
      level: Number,
      badge: String,
      role: String,
      rep: Number,
    },
  ],
});

guildSchema.methods.addLevelPerk = async function(level, perkName, perkValue) {
  const levelPerkIndex = this.levelPerks.findIndex(
    (levelPerk) => levelPerk.level === level,
  );

  if (levelPerkIndex < 0) {
    // Level perks doesn't exist
    const perks = {
      level,
    };

    if (perkName === 'badge') perks.badge = perkValue;
    if (perkName === 'role') perks.role = perkValue;
    if (perkName === 'rep') perks.rep = parseInt(perkValue);

    this.levelPerks.push(perks);
  } else {
    // Level perks exists
    const perks = this.levelPerks[levelPerkIndex];

    if (perkName === 'badge') perks.badge = perkValue;
    if (perkName === 'role') perks.role = perkValue;
    if (perkName === 'rep') perks.rep = parseInt(perkValue);

    this.levelPerks[levelPerkIndex] = perks;
  }

  await this.save();

  return true;
};

model('Guild', guildSchema);
