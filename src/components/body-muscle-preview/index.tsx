import { lazy, Suspense } from "solid-js";

const Preview = lazy(() => import("./preview"));

export function BodyMusclePreview(props: { highlighted: string[] }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Preview {...props} />
    </Suspense>
  );
}
