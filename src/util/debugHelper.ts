import mineflayer from 'mineflayer';
import { Vec3 } from 'vec3';
import { inspect } from 'util';

import { getTotalStacks } from '../plugins/getConnectedContainers';
import { TaskGetWritableBook } from '../tasks/items/taskGetWritableBook';

Object.assign(global, {
  Vec3,
  mineflayer,
  getTotalStacks,
  TaskGetWritableBook,
});

// TODO: use repl
process.stdin.on('data', async (data) => {
  const code = data.toString('utf8');

  try {
    const result = await (0, eval)(code);
    console.log(inspect(result, {
      colors: true,
    }));
  } catch (err) {
    console.log('failed to run code');
    console.log(err);
  }
});

export { };
