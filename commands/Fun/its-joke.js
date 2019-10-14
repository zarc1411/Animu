const { Command } = require('klasa');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text', 'dm', 'group'],
      aliases: ['is-joke'],
      requiredPermissions: ['ATTACH_FILES'],
      cooldown: 10,
      description: "It's Joke",
    });
  }

  async run(msg) {
    msg.send({
      files: [`${__dirname}/../../images/its-joke.png`],
    });
  }
};
