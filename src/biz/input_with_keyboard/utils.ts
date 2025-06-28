/**
 * 弹出键盘时，希望指定元素不被键盘遮挡，将整个页面向上移动一定距离
 * 该方法用于计算所需要移动的「一定距离」
 */
export function calc_bottom_padding_need_add(arg: {
  keyboard: {
    height: number;
    visible: boolean;
    /** 键盘处于展示状态，已经将页面移动了多少距离 */
    prev_padding: number;
  };
  /** 要避免被键盘遮挡的元素 */
  object: { x: number; y: number; width: number; height: number };
  screen: { width: number; height: number };
}) {
  const { keyboard, object, screen } = arg;
  if (keyboard.visible) {
    object.y = object.y + keyboard.prev_padding;
  }
  const y = object.y + object.height;
  /** 页面底部可以用于放置键盘的剩余高度 */
  const space_height_place_keyboard = screen.height - y;
  // console.log("[UTILS]space_height_place_keyboard", space_height_place_keyboard, keyboard.height, object);
  if (space_height_place_keyboard < keyboard.height) {
    return keyboard.height - space_height_place_keyboard;
  }
  return 0;
}
