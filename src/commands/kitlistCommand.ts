import { TPCommand } from './TPCommand';

import { TaskGetWritableBook } from '../tasks/items/taskGetWritableBook';
import { TaskWriteHelpBook } from '../tasks/items/taskWriteHelpBook';

export const kitlistCommand = new TPCommand({
  name: 'kitlist',
  description: 'Lists all available kits.',
  aliases: ['kits', 'list'],

  prefixOverwrite: /.*/,

  execute: ({ invokerUsername }) => ({
    beforeTPTask: new TaskGetWritableBook(),
    TPYTask: new TaskWriteHelpBook(invokerUsername),
  }),
});
