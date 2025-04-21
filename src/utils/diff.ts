/**
 * 新旧内容对比，参考 https://zhuanlan.zhihu.com/p/20346379
 */
export function diff<T extends { id: number | string }>(arr1: T[], arr2: T[]) {
  const obj1 = arr1
    .map((v) => {
      return {
        [v.id]: v,
      };
    })
    .reduce((a, b) => {
      return { ...a, ...b };
    }, {});
  const obj2 = arr2
    .map((v) => {
      return {
        [v.id]: v,
      };
    })
    .reduce((a, b) => {
      return { ...a, ...b };
    }, {});
  // 移除的节点
  const nodes_removed: T[] = [];
  // 新增的节点
  const nodes_added: T[] = [];
  // 更新的节点
  const nodes_updated: T[] = [];
  let has_update = false;
  // 首先对新集合的节点进行遍历循环
  Object.keys(obj2).forEach((id) => {
    const sub1 = obj1[id];
    const sub2 = obj2[id];
    // 如果 prevChildren 中存在 nextChildren 也存在的节点，说明是「移动」或者「更新」
    if (sub1) {
      // 存在相同的节点，但不完全相同，说明是更新
      // 实际情况肯定不相等， nextChildren 每次都是新生成的，所以进行浅比较
      const keys = Object.keys(sub2);
      const is_equal = keys.every((key) => {
        // @ts-ignore
        return sub2[key] === sub1[key];
      });
      if (!is_equal) {
        has_update = true;
        nodes_updated.push(sub2);
      }
    } else {
      // 不存在，说明是新增了一个节点
      has_update = true;
      nodes_added.push(sub2);
    }
  });
  // 对老集合再次遍历
  Object.keys(obj1).forEach((id) => {
    // 如果在老集合中存在，新集合却不存在的节点，视为被删除
    if (obj1[id] && !obj2[id]) {
      has_update = true;
      nodes_removed.push(obj1[id]);
    }
  });
  return {
    has_update,
    nodes_added,
    nodes_updated,
    nodes_removed,
  };
}

/**
 * 新旧内容对比，参考 https://zhuanlan.zhihu.com/p/20346379
 */
export function diff2<T extends { action: { id: number | string } }>(arr1: T[], arr2: T[]) {
  const obj1 = arr1
    .map((v) => {
      return {
        [v.action.id]: v,
      };
    })
    .reduce((a, b) => {
      return { ...a, ...b };
    }, {});
  const obj2 = arr2
    .map((v) => {
      return {
        [v.action.id]: v,
      };
    })
    .reduce((a, b) => {
      return { ...a, ...b };
    }, {});
  // 移除的节点
  const nodes_removed: T[] = [];
  // 新增的节点
  const nodes_added: T[] = [];
  // 更新的节点
  const nodes_updated: T[] = [];
  let has_update = false;
  // 首先对新集合的节点进行遍历循环
  Object.keys(obj2).forEach((id) => {
    const sub1 = obj1[id];
    const sub2 = obj2[id];
    // 如果 prevChildren 中存在 nextChildren 也存在的节点，说明是「移动」或者「更新」
    if (sub1) {
      // 存在相同的节点，但不完全相同，说明是更新
      // 实际情况肯定不相等， nextChildren 每次都是新生成的，所以进行浅比较
      const keys = Object.keys(sub2);
      const is_equal = keys.every((key) => {
        // @ts-ignore
        return sub2[key] === sub1[key];
      });
      if (!is_equal) {
        has_update = true;
        nodes_updated.push(sub2);
      }
    } else {
      // 不存在，说明是新增了一个节点
      has_update = true;
      nodes_added.push(sub2);
    }
  });
  // 对老集合再次遍历
  Object.keys(obj1).forEach((id) => {
    // 如果在老集合中存在，新集合却不存在的节点，视为被删除
    if (obj1[id] && !obj2[id]) {
      has_update = true;
      nodes_removed.push(obj1[id]);
    }
  });
  return {
    has_update,
    nodes_added,
    nodes_updated,
    nodes_removed,
  };
}
