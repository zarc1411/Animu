const { Command } = require('klasa');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text', 'dm', 'group'],
      requiredPermissions: ['ATTACH_FILES'],
      cooldown: 10,
      description: 'Spam',
    });
  }

  async run(msg) {
    msg.send({
      files: [`${__dirname}/../../images/spam.png`],
    });
  }
};
