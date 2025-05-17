import { ChatCommand, type ChatCommandParams, type ChatCommandContext, type ChatCommandResponse } from './ChatCommand';
import { type Task } from '../tasks/task';

export class TPCommand extends ChatCommand {
  constructor(params: TPCommandParams) {
    super({
      ...params,

      execute: async (chatCtx) => {
        const ctx: TPCommandContext = {
          ...chatCtx,
        };

        const { bot, invokerUsername, flags } = ctx;

        let overrideTarget: string | false = false;
        if ('to' in flags) {
          if (invokerUsername !== 'Manue__l')
            return null;

          const targetUsername = flags.to.toString().toLowerCase();
          const actualUsername = Object.keys(bot.players).find(username => username.toLowerCase() === targetUsername);

          if (!actualUsername) {
            bot.chat(`/w ${invokerUsername} Target not found`);
            return null;
          }

          console.log(`${this.name} command invoked by ${invokerUsername} with target ${targetUsername}`);
          overrideTarget = actualUsername;
        }

        const returnVal = await params.execute(ctx);
        const target = returnVal.targetOverwrite || overrideTarget || invokerUsername;

        if (returnVal.beforeTPTask) await returnVal.beforeTPTask.execute(bot);
        if (returnVal.TPYTask) bot.TPYTask.set(target, returnVal.TPYTask);

        if (returnVal.success !== false) {
          if (bot.entity.pitch > -0.49 * Math.PI) {
            bot.look(0, -0.495 * Math.PI, true);
          }

          bot.chat('/tpa ' + target);
        }

        return returnVal.chatResponse || null;
      },
    });
  }
}

export type TPCommandParams = Omit<ChatCommandParams, 'execute'> & {
  execute: (ctx: TPCommandContext) => Promise<TPCommandReturnValue> | TPCommandReturnValue;
};
export type TPCommandContext = ChatCommandContext & {

};

export type TPCommandReturnValue = {
  chatResponse?: ChatCommandResponse;
  success?: false; /* if not set, assume true */

  beforeTPTask?: Task;
  TPYTask?: Task;

  targetOverwrite?: string;
};
