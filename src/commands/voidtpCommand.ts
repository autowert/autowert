import { TPCommand } from './TPCommand';

import { TaskBedrockTP } from '../tasks/game/taskBedrockTP';

export const voidtpCommand = new TPCommand({
  name: 'voidtp',
  description: 'Teleports to you to help you get out of the void.',
  aliases: ['bedrocktp'],

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: () => ({
    TPYTask: new TaskBedrockTP(),
  }),
});
