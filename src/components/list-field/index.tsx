import { ChevronRight } from "lucide-solid";
import "./index.css";

export function Field() {
  return (
    <div class="field">
      <div class="field__main">
        <div class="field__label">
          <div class="field__title">标题</div>
        </div>
        <div class="field__content">
          <div class="field__value">13822136046</div>
          <div class="field__extra">
            <div class="field__line--vertical"></div>
            <div class="field__text-btn"></div>
            <div class="field__icon w-4 h-4">
              <ChevronRight class="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
