import { SetValueUnit } from "@/biz/set_value_input";
import { StorageCore } from "@/domains/storage";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    token: "",
    avatar: "",
  },
  pending_workout_day: {
    started_at: 0,
    step_idx: 0,
    set_idx: 0,
    data: [] as {
      step_idx: number;
      set_idx: number;
      act_idx: number;
      reps: number;
      reps_unit: SetValueUnit;
      weight: number;
      weight_unit: SetValueUnit;
      completed: boolean;
    }[],
  },
};
const key = "a_global";
const e = globalThis.localStorage.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: e ? JSON.parse(e) : DEFAULT_CACHE_VALUES,
  client: globalThis.localStorage,
});
