import { For } from "solid-js";

export function TagPreview(props: { tags: string[] }) {
  return (
    <div>
      <For each={props.tags}>
        {(opt) => {
          return <div></div>;
        }}
      </For>
    </div>
  );
}
