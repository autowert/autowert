import type { Plugin as BotPlugin } from 'mineflayer';

export const useWritableBookPlugin: BotPlugin = (bot) => {
  bot.findWritableBookSlot = () => {
    const slot = bot.inventory.slots.findIndex(item => item && item.name === 'writable_book');
    return slot === -1 ? null : slot;
  }
  bot.hasWritableBookInInventory = () => {
    const slot = bot.findWritableBookSlot();
    return slot !== null;
  }

  bot.useWritableBook = async (pages, title, options) => {
    const shouldSign = title !== null;

    const writableBookSlot =
      options?.slot !== undefined
        ? options.slot
        : bot.findWritableBookSlot();
    if (writableBookSlot === null) throw new Error('no writable book found');

    if (shouldSign) {
      // bot.signBook( slot, pages, author, title )
      await (<any>bot).signBook(writableBookSlot, pages, bot.username, title);
    } else {
      await bot.writeBook(writableBookSlot, pages);
    }

    if (options?.drop) {
      bot.windowInteractions.dropItemFromSlot(writableBookSlot);
    }
  };
};

type UseWritableBookOptions = {
  slot: number;
  drop: boolean;
};
declare module 'mineflayer' {
  interface Bot {
    findWritableBookSlot: () => number | null;
    hasWritableBookInInventory: () => boolean;
    useWritableBook: (pages: string[], title: string | null, options?: Partial<UseWritableBookOptions>) => Promise<void>;
  }
}

