import { BaseCommand, type BaseCommandParams, type BaseCommandContext } from './BaseCommand';

export class ChatCommand extends BaseCommand {
  constructor(params: ChatCommandParams) {
    super({
      ...params,

      execute: async (baseCtx) => {
        const ctx: ChatCommandContext = {
          ...baseCtx,
        };

        const { bot, invokeType, invokerUsername } = ctx;

        try {
          const response = await params.execute(ctx);

          if (response === null) return;

          if (invokeType === 'public') bot.chat(response);
          else if (invokeType === 'private') bot.chat(`/w ${invokerUsername} ${response}`)
        } catch (err) {
          console.log('error while executing chat command', params.name, err);
          // TODO: notify target about error
        }
      },
    });
  }
}

export type ChatCommandParams = Omit<BaseCommandParams, 'execute'> & {
  // TODO: implement args and params definition + parsing
  // argsDefinition?: never[];
  // paramsDefinition?: never[];

  execute: (ctx: ChatCommandContext) => Promise<ChatCommandResponse> | ChatCommandResponse;
};
export type ChatCommandContext = BaseCommandContext & {
  // TODO: include args and params, see above
};

// TODO: implement ChatCommandResponse, ChatCommandPrivateResponse, ChatCommandInvalidResponse, ChatCommandNoResponse
export type ChatCommandResponse = string | null;

