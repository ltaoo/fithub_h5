import { createSignal, JSX, Show } from "solid-js";

import { DragZoneCore } from "@/domains/ui/drag-zone";

export function DragZone(props: { store: DragZoneCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => setState(v));

  return (
    <div
      classList={{
        "overflow-hidden absolute inset-0 rounded-sm outline-slate-300 outline-2": true,
        outline: state().hovering,
        "outline-dashed": !state().hovering,
      }}
      onDragOver={(event) => {
        event.preventDefault();
        store.handleDragover();
      }}
      onDragLeave={() => {
        store.handleDragleave();
      }}
      onDrop={(event) => {
        event.preventDefault();
        store.handleDrop(Array.from(event.dataTransfer?.files || []));
      }}
    >
      <div class="w-full h-full" style={{ display: state().selected ? "block" : "none" }}>
        {props.children}
      </div>
      <div
        class="absolute inset-0 flex items-center justify-center cursor-pointer"
        // style={{ display: state().selected ? "none" : "block" }}
      >
        <div class="flex items-center justify-center h-full p-4 text-center">
          <div style={{ display: !state().selected ? "block" : "none" }}>{state().tip}</div>
          <input
            type="file"
            class="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(event) => {
              store.handleDrop(Array.from(event.currentTarget.files || []));
            }}
          />
        </div>
      </div>
    </div>
  );
}
