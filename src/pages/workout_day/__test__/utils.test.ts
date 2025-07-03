import { describe, it, expect } from "vitest";

import { InputCore } from "@/domains/ui/form/input";
import { calcTheHighlightIdxAfterRemoveSet } from "../utils";

describe("计算删除组后，高亮该如何更新", () => {
  it("删除最后一个动作的最后一组", async () => {
    const steps = [
      {
        uid: 1,
        sets: [
          {
            uid: 1,
          },
        ],
      },
    ];
    const r = calcTheHighlightIdxAfterRemoveSet(
      {
        step_idx: 0,
        set_idx: 0,
      },
      {
        steps,
        cur_step_idx: 0,
        cur_set_idx: 0,
      }
    );
    expect(r.error).toBeTruthy();
  });
  it("删除非高亮组。高亮[0, 1]，删除最后一个动作的最后一组 [1, 0]", async () => {
    const steps = [
      {
        uid: 1,
        sets: [
          {
            uid: 1,
          },
          {
            uid: 2,
          },
        ],
        note: "",
      },
      {
        uid: 2,
        sets: [
          {
            uid: 1,
          },
        ],
        note: "",
      },
    ];
    const r = calcTheHighlightIdxAfterRemoveSet(
      {
        step_idx: 1,
        set_idx: 0,
      },
      {
        steps,
        cur_step_idx: 0,
        cur_set_idx: 1,
      }
    );
    expect(r.error).toBe(null);
    if (r.error) {
      return;
    }
    expect(r.data.cur_step_idx).toBe(0);
    expect(r.data.cur_set_idx).toBe(1);
    expect(r.data.steps.length).toBe(1);
  });
  it("后面没有动作，前面还有组。当前高亮 [0,1]，删除[0,1]", async () => {
    const steps = [
      {
        uid: 1,
        sets: [
          {
            uid: 1,
          },
          {
            uid: 2,
          },
        ],
      },
    ];
    const r = calcTheHighlightIdxAfterRemoveSet(
      {
        step_idx: 0,
        set_idx: 1,
      },
      {
        steps,
        cur_step_idx: 0,
        cur_set_idx: 1,
      }
    );
    expect(r.error).toBeNull();
    if (r.error) {
      return;
    }
    expect(r.data.cur_step_idx).toBe(0);
    expect(r.data.cur_set_idx).toBe(0);
  });
  it("后面没有组，前面还有动作。当前高亮 [1,0]，删除[1,0]", async () => {
    const steps = [
      {
        uid: 1,
        sets: [
          {
            uid: 1,
          },
          {
            uid: 2,
          },
        ],
      },
      {
        uid: 2,
        sets: [
          {
            uid: 1,
          },
        ],
      },
    ];
    const r = calcTheHighlightIdxAfterRemoveSet(
      {
        step_idx: 1,
        set_idx: 0,
      },
      {
        steps,
        cur_step_idx: 1,
        cur_set_idx: 0,
      }
    );
    expect(r.error).toBeNull();
    if (r.error) {
      return;
    }
    expect(r.data.cur_step_idx).toBe(0);
    expect(r.data.cur_set_idx).toBe(1);
  });
  it("后面还有组，当前高亮 [0,0]，删除[0,0]", async () => {
    const steps = [
      {
        uid: 1,
        sets: [
          {
            uid: 1,
          },
          {
            uid: 2,
          },
        ],
      },
      {
        uid: 2,
        sets: [
          {
            uid: 1,
          },
        ],
      },
    ];
    const r = calcTheHighlightIdxAfterRemoveSet(
      {
        step_idx: 0,
        set_idx: 0,
      },
      {
        steps,
        cur_step_idx: 0,
        cur_set_idx: 0,
      }
    );
    expect(r.error).toBeNull();
    if (r.error) {
      return;
    }
    expect(r.data.cur_step_idx).toBe(0);
    expect(r.data.cur_set_idx).toBe(0);
  });
  it("后面还有动作，当前高亮 [0,1]，删除[0,1]", async () => {
    const steps = [
      {
        uid: 1,
        sets: [
          {
            uid: 1,
          },
          {
            uid: 2,
          },
        ],
      },
      {
        uid: 2,
        sets: [
          {
            uid: 1,
          },
        ],
      },
    ];
    const r = calcTheHighlightIdxAfterRemoveSet(
      {
        step_idx: 0,
        set_idx: 0,
      },
      {
        steps,
        cur_step_idx: 0,
        cur_set_idx: 0,
      }
    );
    expect(r.error).toBeNull();
    if (r.error) {
      return;
    }
    expect(r.data.cur_step_idx).toBe(0);
    expect(r.data.cur_set_idx).toBe(0);
  });
});
