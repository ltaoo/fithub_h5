import { lazy, Suspense } from "solid-js";
import { Loader, Loader2 } from "lucide-solid";

import { BodyPartWithMuscles } from "@/biz/muscle/types";

const Preview = lazy(() => import("./preview"));

export function BodyMusclePreview(props: { highlighted: string[]; onClick?: (part: BodyPartWithMuscles) => void }) {
  return (
    <Suspense
      fallback={
        <div class="flex items-center justify-center">
          <Loader2 class="w-8 h-8 text-w-fg-1 animate animate-spin" />
        </div>
      }
    >
      <Preview {...props} />
    </Suspense>
  );
}
