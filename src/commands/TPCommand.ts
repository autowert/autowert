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

        const { bot, invokerUsername } = ctx;

        const returnVal = await params.execute(ctx);
        const target = returnVal.targetOverwrite || invokerUsername;

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
