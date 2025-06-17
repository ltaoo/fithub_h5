import { Accessor, createSignal, onCleanup, onMount } from "solid-js";

export function useViewModel<
  T extends (...args: any[]) => {
    state: any;
    ready: () => void;
    destroy?: () => void;
    onStateChange: (handler: (v: any) => any) => any;
  }
>(factory: T, props: Parameters<T>): [Accessor<ReturnType<T>["state"]>, ReturnType<T>] {
  // @ts-ignore
  const $model: ReturnType<T> = factory(...props);

  const [state, setState] = createSignal($model.state);

  $model.onStateChange((v) => {
    setState(v);
  });
  onMount(() => {
    $model.ready();
  });
  onCleanup(() => {
    if ($model.destroy) {
      $model.destroy();
    }
  });

  return [state, $model];
}

export function useViewModelStore<
  T extends {
    state: any;
    ready?: () => void;
    destroy?: () => void;
    onStateChange: (handler: (v: any) => any) => any;
  }
>(vm: T, opt: Partial<{ silence: boolean }> = {}): [Accessor<T["state"]>, T] {
  const [state, setState] = createSignal(vm.state);

  vm.onStateChange((v) => {
    setState(v);
  });
  onMount(() => {});
  // 注释掉是因为一个 store 可能被 A B 两个组件共同使用，A 组件卸载后如果取消所有监听，B 组件就无法同步状态了
  // onCleanup(() => {
  //   if (vm.destroy) {
  //     vm.destroy();
  //   }
  // });
  if (vm.ready && !opt.silence) {
    vm.ready();
  }
  return [state, vm];
}
