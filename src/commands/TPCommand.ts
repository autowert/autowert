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

        bot.chat('/tpa ' + target);

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

  beforeTPTask?: Task;
  TPYTask?: Task;

  targetOverwrite?: string;
};
