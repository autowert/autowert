import mineflayer from 'mineflayer';
import { Vec3 } from 'vec3';

import { registerExitHandler } from './exitHandler';

import { getTotalStacks } from '../plugins/getConnectedContainers';
import { TaskGetWritableBook } from '../tasks/items/taskGetWritableBook';

Object.assign(global, {
  Vec3,
  mineflayer,
  getTotalStacks,
  TaskGetWritableBook,
});

const debuggerEnabled = process.execArgv.includes('--inspect');
if (debuggerEnabled) {
  process.stdout.write = () => true;

  registerExitHandler(() => {
    console.log('debugger enabled, keeping process alive');
    return new Promise(() => { });
  });
}

// TODO: use repl
process.stdin.on('data', async (data) => {
  const code = data.toString('utf8');

  try {
    const result = await eval(code);
    console.log(result || 'done');
  } catch (err) {
    console.log('failed to run code');
    console.log(err);
  }
});

export { };
