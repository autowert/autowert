import { type Bot, type Player } from 'mineflayer';
import { type ParsedMsg } from '../util/parseMsg';

export class BaseCommand {
  public name: string;
  public description: string;
  public usage?: string;

  public aliases: string[];

  public prefixOverwrite?: Prefix;
  public adminOnly?: boolean;
  public invokeTypeOnly?: InvokeType;

  public execute: (ctx: BaseCommandContext) => void | Promise<void>;

  constructor(params: {
    name: string;
    description: string;
    usage?: string;

    aliases?: string[];

    prefixOverwrite?: Prefix;
    adminOnly?: boolean;
    invokeTypeOnly?: InvokeType;

    execute: (ctx: BaseCommandContext) => Promise<void> | void;
  }) {
    this.name = params.name;
    this.description = params.description;
    this.usage = params.usage;

    this.aliases = params.aliases || [];

    this.prefixOverwrite = params.prefixOverwrite;
    this.adminOnly = params.adminOnly;
    this.invokeTypeOnly = params.invokeTypeOnly;

    this.execute = params.execute;
  }
}

export type BaseCommandParams = ConstructorParameters<typeof BaseCommand>[0];
export type BaseCommandContext = {
  bot: Bot;

  invokerUsername: string;
  invokerPlayer: Player;

  invokeType: InvokeType;
  invokePrefix: string;
  invokeMessage: string; /** The message sent by the invoker, without the invoke prefix. */

  args: ParsedMsg['args'],
  flags: ParsedMsg['flags'],
};
export type InvokeType = 'public' | 'private'

export type Prefix =
  (string | RegExp) |
  (string | RegExp)[];
