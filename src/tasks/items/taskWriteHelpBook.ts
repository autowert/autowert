import { Task } from '../task';

import type { Bot } from 'mineflayer';

import df from 'dateformat';

export class TaskWriteHelpBook extends Task {
  protected addressee: string;

  constructor(addressee: string) {
    super();

    this.addressee = addressee;
  }

  async execute(bot: Bot): Promise<void> {
    const pages: string[] = [
      ...this.getFirstPages(bot),
      ...this.getKitPages(bot),
      ...this.getLastPages(bot),
    ];

    try {
      await bot.useWritableBook(pages, '§d§lautowert help', { drop: true });
    } catch {
      console.warn('failed to write help book');
    }
  }

  private getFirstPages(bot: Bot): string[] {
    const firstPage = `
Hey §l${this.addressee}§r,
you can find all the kits I have on the following pages of this book.

If you like §2§l${bot.username}§r, please consider telling your friends about it.



§7> ${df(Date.now(), 'UTC: hh:MM TT, dd.mm.yy Z')}
`.slice(1, -1);
    return [firstPage];
  }
  private getKitPages(bot: Bot): string[] {
    const kitPages: string[] = [];

    let n = 1;
    const allKits = bot.kitStore.taskInfos
      .filter(taskInfo => !taskInfo.hideFromHelp)
      .map(taskInfo => taskInfo.names[0]);

    const KITS_PER_PAGE = 8;
    const totalPages = Math.ceil(allKits.length / KITS_PER_PAGE);
    while (allKits.length) {
      const kitsToShow = allKits.splice(0, KITS_PER_PAGE);
      kitPages.push(`
§lKit List ${n} / ${totalPages}:§r
- ${kitsToShow.join('\n- ')}
${'\n'.repeat(KITS_PER_PAGE - kitsToShow.length)}


§8to get any kit,§r
 §8just type &kit <name>§r
`.slice(1, -1));

      n += 1;
    }

    return kitPages;
  }
  private getLastPages(bot: Bot): string[] {
    const lastPage = `
§2§l${bot.username}'s§r
§nmission§r
is to help new and old players §lbuild,§r
§lfight and explore§r
by giving them the §lblocks, tools and§r
§litems§r they need
in the §lfastest§r and §lmost convenient§r way possible.
`.slice(1, -1);
    return [lastPage];
  }
}
