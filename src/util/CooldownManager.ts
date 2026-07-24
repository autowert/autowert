import ms, { type StringValue } from 'ms';

export class CooldownManager {
  static minDelay = (delay: number | StringValue) => new LimitMinDelay(delay);
  static limit(limit: number) {
    return {
      per: (time: number | StringValue) => new LimitPer(limit, time),
    }
  };

  protected limits: LimitDefinition[];
  protected playerUses: Map<string, number[]>;

  protected minDelay: LimitMinDelay | null;
  protected perLimits: LimitPer[];

  // TODO: max save time, delete uses that are no longer relevant

  constructor(name: string, limits: LimitDefinition[]) {
    this.limits = limits;

    this.playerUses = new Map();

    this.minDelay = null;
    this.perLimits = [];
    this.buildLimits();
  }

  private buildLimits() {
    for (const limit of this.limits) {
      if (limit instanceof LimitMinDelay) {
        if (this.minDelay && this.minDelay.delay >= limit.delay) {
          continue;
        }

        this.minDelay = limit;
      } else if (limit instanceof LimitPer) {
        this.perLimits.push(limit)
      }
    }

    this.perLimits.sort((a, b) => a.per - b.per);
  }

  public checkWithReason(username: string) {
    const uses = this.playerUses.get(username);
    if (!uses) return true;

    if (this.minDelay) {
      const lastUse = uses.at(-1);
      if (lastUse && lastUse >= Date.now() - this.minDelay.delay) {
        return `You are on cooldown (${ms(this.minDelay.delay, { long: true })}).`;
      }
    }

    for (const perLimit of this.perLimits) {
      const { per } = perLimit;
      const perUsages = uses.filter((date) => date >= Date.now() - per);
      if (perUsages.length > perLimit.limit) {
        return `You reached the limit of ${perLimit.limit} uses per ${ms(perLimit.per, { long: true })}.`;
      }
    }

    return true;
  }

  public check(username: string) {
    return this.checkWithReason(username) === true;
  }

  public used(username: string) {
    if (!this.playerUses.has(username)) {
      this.playerUses.set(username, []);
    }

    this.playerUses.get(username)!.push(Date.now());
  }

  public useIfPossible(username: string): { canUse: boolean, reason: string } {
    const reason = this.checkWithReason(username);
    const canUse = reason === true;

    if (canUse) {
      this.used(username);
      return { canUse, reason: 'can use' };
    }
    return { canUse, reason };
  }
}

class LimitMinDelay {
  readonly delay: number;
  constructor(delay: number | StringValue) {
    this.delay = typeof delay === 'number' ? delay : ms(delay);
  }
}

class LimitPer {
  readonly limit: number;
  readonly per: number;
  constructor(limit: number, per: number | StringValue) {
    this.limit = limit;
    this.per = typeof per === 'number' ? per : ms(per);
  }
}

type LimitDefinition = LimitMinDelay | LimitPer;
