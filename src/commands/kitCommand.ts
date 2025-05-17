import { TPCommand } from './TPCommand';

export const kitCommand = new TPCommand({
  name: 'kit',
  description: 'Teleports to you with a kit.',
  usage: '[kitName] [--to=<username>]',
  aliases: ['rekit'],

  prefixOverwrite: /.*/,

  execute: async ({ bot, invokerUsername, args, flags }) => {
    const type = args[0]?.toLowerCase();

    let target = invokerUsername;
    if ('to' in flags) {
      if (invokerUsername !== 'Manue__l')
        return { success: false };

      const targetUsername = flags.to.toString().toLowerCase();
      const actualUsername = Object.keys(bot.players).find(username => username.toLowerCase() === targetUsername);

      if (!actualUsername) {
        bot.chat(`/w ${invokerUsername} Target not found`);
        return { success: false };
      }

      console.log(`kit command invoked by ${invokerUsername} with target ${targetUsername}`);
      target = actualUsername;
    }

    const { success } = await bot.kitStore.getKit(invokerUsername, type);

    if (!success) return { success: false };
    return { targetOverwrite: target }; // TODO: return beforeTPTask 
  },
});
