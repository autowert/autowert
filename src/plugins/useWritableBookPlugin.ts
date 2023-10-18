import type { Plugin as BotPlugin } from 'mineflayer';

export const useWritableBookPlugin: BotPlugin = (bot) => {
  bot.useWritableBook = async (pages, title) => {
    const shouldSign = title !== null;

    const writableBookSlot = bot.inventory.slots.findIndex(item => item && item.name === 'writable_book');
    if (writableBookSlot === -1) throw new Error('no writable book found');

    if (shouldSign) {
      // bot.signBook( slot, pages, author, title )
      await (<any>bot).signBook(writableBookSlot, pages, bot.username, title);
    } else {
      await bot.writeBook(writableBookSlot, pages);
    }

    return writableBookSlot;
  };
};

declare module 'mineflayer' {
  interface Bot {
    useWritableBook: (pages: string[], title: string | null) => Promise<number>;
  }
}

