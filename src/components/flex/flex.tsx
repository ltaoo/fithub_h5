import { JSX } from "solid-js/jsx-runtime";

export function Flex(props: { justify?: "between" } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { class: className, ...rest } = props;
  return (
    <div
      {...rest}
      class={className}
      classList={{
        "flex items-center": true,
        [props.justify ? `justify-${props.justify}` : ""]: true,
        [props.class ?? ""]: true,
      }}
    >
      {props.children}
    </div>
  );
}
