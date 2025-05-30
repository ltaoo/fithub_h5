/**
 * @file 菜单 组件
 */
import { createSignal, onCleanup, onMount, JSX } from "solid-js";
import { Portal as PortalPrimitive } from "solid-js/web";

import { MenuCore } from "@/domains/ui/menu";
import { MenuItemCore } from "@/domains/ui/menu/item";
import { cn } from "@/utils/index";

import * as PopperPrimitive from "./popper";
import { Presence } from "./presence";
import { DismissableLayer } from "./dismissable-layer";

const Root = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  return (
    <PopperPrimitive.Root class={props.class} store={store.popper}>
      {props.children}
    </PopperPrimitive.Root>
  );
};

/** 锚点 */
const Anchor = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  return (
    <PopperPrimitive.Anchor class={props.class} store={store.popper}>
      {props.children}
    </PopperPrimitive.Anchor>
  );
};

const Portal = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  return (
    <Presence store={props.store.presence}>
      <PortalPrimitive>{props.children}</PortalPrimitive>
    </Presence>
  );
};

const Content = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  return (
    <Presence store={store.presence}>
      <ContentNonModal store={store} class={props.class}>
        {props.children}
      </ContentNonModal>
    </Presence>
  );
};
// 这里多一个，是因为还存在 MenuContentModal 场景，这两个和 MenuSubContent 都复用 MenuContentImpl
const ContentNonModal = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  // const { store } = props;

  return (
    <ContentImpl store={props.store} class={props.class} classList={props.classList}>
      {props.children}
    </ContentImpl>
  );
};

const ContentImpl = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  return (
    <PopperPrimitive.Content store={props.store.popper} class={props.class} classList={props.classList}>
      {props.children}
    </PopperPrimitive.Content>
  );
};

const Group = (props: {} & JSX.HTMLAttributes<HTMLElement>) => {
  return <div class={props.class}>{props.children}</div>;
};

const Label = (props: {} & JSX.HTMLAttributes<HTMLElement>) => {
  return <div class={props.class}>{props.children}</div>;
};

const Item = (props: { store: MenuItemCore; disabled?: boolean } & JSX.HTMLAttributes<HTMLElement>) => {
  return (
    <ItemImpl class={props.class} classList={props.classList} store={props.store}>
      {props.children}
    </ItemImpl>
  );
};
const ItemImpl = (props: { store: MenuItemCore } & JSX.HTMLAttributes<HTMLDivElement>) => {
  // const { store: item } = props;
  let $item: HTMLDivElement;

  const [state, setState] = createSignal(props.store.state);

  props.store.onStateChange((v) => {
    setState(v);
  });
  props.store.onFocus(() => {
    // $item.focus();
  });
  props.store.onBlur(() => {
    $item.blur();
  });
  // onCleanup(() => {
  //   console.log("[ItemImpl]onCleanup", item.label);
  // });

  return (
    <div
      ref={(el) => {
        // console.log("[COMPONENT]ItemImpl - ref", el);
        $item = el;
        if (typeof props.ref === "function") {
          props.ref(el);
          return;
        }
        props.ref = $item;
      }}
      class={cn("menu__item-impl", props.class)}
      classList={props.classList}
      role="menuitem"
      aria-haspopup="menu"
      aria-disabled={state().disabled || undefined}
      // aria-expanded=""
      data-state={getOpenState(state().open)}
      data-highlighted={state().focused ? "" : undefined}
      data-disabled={state().disabled ? "" : undefined}
      tabIndex={state().disabled ? undefined : -1}
      // onPointerEnter={(event) => {
      //   if (event.pointerType !== "mouse") {
      //     return;
      //   }
      //   event.currentTarget.focus();
      //   item.handlePointerEnter();
      // }}
      // onPointerLeave={(event) => {
      //   console.log("[COMPONENT]ui/menu ItemImpl - onPointerLeave", event.pointerType, item.label);
      //   if (event.pointerType !== "mouse") {
      //     return;
      //   }
      //   item.handlePointerLeave();
      // }}
      onClick={() => {
        // console.log("[COMPONENT]MenuItemImpl - on click");
        props.store.handleClick();
      }}
      onFocus={() => {
        // console.log("[COMPONENT]MenuItemImpl - on focus");
        props.store.handleFocus();
      }}
      onBlur={() => {
        props.store.handleBlur();
      }}
    >
      {props.children}
    </div>
  );
};

const Separator = (props: {} & JSX.HTMLAttributes<HTMLElement>) => {
  return <div class={props.class}></div>;
};
const Arrow = (
  props: {
    store: MenuCore;
  } & JSX.HTMLAttributes<HTMLElement>
) => {
  const { store } = props;
  // const store = useContext(MenuContext);

  return <PopperPrimitive.Arrow class={props.class} store={store.popper}></PopperPrimitive.Arrow>;
};

const Sub = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  return <PopperPrimitive.Root store={store.popper}>{props.children}</PopperPrimitive.Root>;
};
const SubTrigger = (
  props: { store: MenuItemCore; onMounted?: (el: HTMLDivElement) => void } & JSX.HTMLAttributes<HTMLDivElement>
) => {
  const { store: item } = props;

  let $item: HTMLDivElement | undefined;

  onMount(() => {
    const $$item = $item;
    // console.log("[COMPONENT]MenuSubTrigger - mount", $item, $$item, item.menu);
    if (!$$item) {
      return;
    }
    if (!item.menu) {
      return;
    }
    if (props.onMounted) {
      props.onMounted($$item);
    }
    item.menu.popper.setReference({
      getRect() {
        const rect = $$item.getBoundingClientRect();
        return rect;
      },
    });
  });
  onCleanup(() => {
    // console.log("[COMPONENT]MenuSubTrigger - unmounted");
    if (!item.menu) {
      return;
    }
    item.menu.popper.removeReference();
  });

  return (
    <Anchor store={item.menu!}>
      <ItemImpl ref={$item} class={props.class} store={item}>
        {props.children}
      </ItemImpl>
    </Anchor>
  );
};

// const MenuSubContentContext = createContext<MenuCore>();
const SubContent = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;
  // const store = useContext(MenuSubContext);
  // onCleanup(() => {
  //   console.log("[MenuSubContent]onCleanup");
  // });

  return (
    <Presence store={store.presence} class={props.class}>
      <ContentImpl store={store} class={props.class}>
        {props.children}
      </ContentImpl>
    </Presence>
  );
};

function getOpenState(open: boolean) {
  return open ? "open" : "closed";
}
type CheckedState = boolean | "indeterminate";
function isIndeterminate(checked?: CheckedState): checked is "indeterminate" {
  return checked === "indeterminate";
}

function getCheckedState(checked: CheckedState) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}

function focusFirst(candidates: HTMLElement[]) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    // if focus is already where we want to go, we don't want to keep going through the candidates
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus();
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
function wrapArray<T>(array: T[], startIndex: number) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}

/**
 * This is the "meat" of the typeahead matching logic. It takes in all the values,
 * the search and the current match, and returns the next match (or `undefined`).
 *
 * We normalize the search because if a user has repeatedly pressed a character,
 * we want the exact same behavior as if we only had that one character
 * (ie. cycle through options starting with that character)
 *
 * We also reorder the values by wrapping the array around the current match.
 * This is so we always look forward from the current match, and picking the first
 * match will always be the correct one.
 *
 * Finally, if the normalized search is exactly one character, we exclude the
 * current match from the values because otherwise it would be the first to match always
 * and focus would never move. This is as opposed to the regular case, where we
 * don't want focus to move if the current match still matches.
 */
function getNextMatch(values: string[], search: string, currentMatch?: string) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch) wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find((value) => value.toLowerCase().startsWith(normalizedSearch.toLowerCase()));
  return nextMatch !== currentMatch ? nextMatch : undefined;
}

type Point = { x: number; y: number };
type Polygon = Point[];
type Side = "left" | "right";
type GraceIntent = { area: Polygon; side: Side };

// Determine if a point is inside of a polygon.
// Based on https://github.com/substack/point-in-polygon
function isPointInPolygon(point: Point, polygon: Polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    // prettier-ignore
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

export { Root, Anchor, Portal, Content, Group, Label, Item, Separator, Arrow, Sub, SubTrigger, SubContent };
