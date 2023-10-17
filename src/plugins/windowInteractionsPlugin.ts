import type { Plugin as BotPlugin } from 'mineflayer';

// see https://wiki.vg/index.php?title=Protocol&oldid=14204#Click_Window
export const windowInteractionsPlugin: BotPlugin = (bot) => {
  const click = (mode: number, button: number, slot: number): Promise<void> => {
    return bot.clickWindow(slot, button, mode);
  }

  const leftClick = (slot: number) => click(0, 0, slot);
  const rightClick = (slot: number) => click(0, 1, slot);

  const shiftLeftClick = (slot: number) => click(1, 0, slot);
  const shiftRightClick = (slot: number) => click(1, 1, slot);

  const swapWithQuickbarSlot = (slot: number, quickbarSlot: number) => click(2, quickbarSlot, slot);

  const creativePickupStack = (slot: number) => click(3, 2, slot);

  const dropItemFromSlot = (slot: number) => click(4, 0, slot);
  const dropStackFromSlot = (slot: number) => click(4, 1, slot);
  const dropItemFromCursor = () => click(4, 0, -999);
  const dropStackFromCursor = () => click(4, 1, -999);

  const leftClickDrag = {
    start: () => click(5, 0, -999),
    add: (slot: number) => click(5, 1, slot),
    end: () => click(5, 2, -999),
  };
  const rightClickDrag = {
    start: () => click(5, 4, -999),
    add: (slot: number) => click(5, 5, slot),
    end: () => click(5, 6, -999),
  };
  const creativeMiddleClickDrag = {
    start: () => click(5, 8, -999),
    add: (slot: number) => click(5, 9, slot),
    end: () => click(5, 10, -999),
  };

  const doubleClick = (slot: number) => click(6, 0, slot);

  bot.windowInteractions = {
    leftClick,
    rightClick,

    shiftLeftClick,
    shiftRightClick,

    swapWithQuickbarSlot,

    creativePickupStack,

    dropItemFromSlot,
    dropStackFromSlot,
    dropItemFromCursor,
    dropStackFromCursor,

    leftClickDrag,
    rightClickDrag,
    creativeMiddleClickDrag,

    doubleClick,
  };
};

type SlotFunction = (slot: number) => Promise<void>;
type DragFunctions = {
  start: () => Promise<void>;
  add: SlotFunction,
  end: () => Promise<void>,
};

declare module 'mineflayer' {
  interface Bot {
    windowInteractions: {
      leftClick: SlotFunction,
      rightClick: SlotFunction,

      shiftLeftClick: SlotFunction,
      shiftRightClick: SlotFunction,

      swapWithQuickbarSlot: (slot: number, quickbarSlot: number) => Promise<void>,

      creativePickupStack: SlotFunction,

      dropItemFromSlot: SlotFunction,
      dropStackFromSlot: SlotFunction,
      dropItemFromCursor: ()  => Promise<void>,
      dropStackFromCursor: ()  => Promise<void>,

      leftClickDrag: DragFunctions,
      rightClickDrag: DragFunctions,
      creativeMiddleClickDrag: DragFunctions,

      doubleClick: SlotFunction,
    };
  }
}
