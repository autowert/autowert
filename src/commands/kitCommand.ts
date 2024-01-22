import { TPCommand } from './TPCommand';

export const kitCommand = new TPCommand({
  name: 'kit',
  description: 'Teleports to you with a kit.',
  usage: '[kitName]',

  prefixOverwrite: /.*/,

  execute: async ({ bot, invokerUsername, args }) => {
    const type = args[0]?.toLowerCase();
    const { success } = await bot.kitStore.getKit(invokerUsername, type);

    if (!success) return { success: false };
    return {}; // TODO: return beforeTPTask 
  },
});
