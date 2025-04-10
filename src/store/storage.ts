import { StorageCore } from "@/domains/storage";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    token: "",
    avatar: "",
  },
  pending_workout_day: {
    step_idx: 0,
    set_idx: 0,
    data: [] as {
      step_idx: number;
      set_idx: number;
      act_idx: number;
      reps: number;
      weight: number;
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
