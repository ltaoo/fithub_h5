import { expect, it, describe } from "vitest";

import { diff } from "./diff";

describe("diff", () => {
  it("有一个节点发生了更新", () => {
    const arr1 = [
      {
        id: 1,
        name: "hello",
      },
      {
        id: 2,
        name: "world",
      },
    ];
    const arr2 = [
      {
        id: 1,
        name: "hello_update",
      },
      {
        id: 2,
        name: "world",
      },
    ];
    const { has_update, nodes_added, nodes_removed, nodes_updated } = diff(arr1, arr2);
    expect(has_update).toBe(true);
    expect(nodes_added.length).toBe(0);
    expect(nodes_removed.length).toBe(0);
    expect(nodes_updated.length).toBe(1);
  });

  it("所有阶段都被替换", () => {
    const arr1 = [
      {
        id: 1,
        name: "hello",
      },
      {
        id: 2,
        name: "world",
      },
    ];
    const arr2 = [
      {
        id: 3,
        name: "hello_update",
      },
      {
        id: 4,
        name: "world",
      },
    ];
    const { has_update, nodes_added, nodes_removed, nodes_updated } = diff(arr1, arr2);
    expect(has_update).toBe(true);
    expect(nodes_added.length).toBe(2);
    expect(nodes_removed.length).toBe(2);
    expect(nodes_updated.length).toBe(0);
  });

  it("从零新增节点", () => {
    const arr1: { id: number }[] = [];
    const arr2 = [
      {
        id: 3,
        name: "hello_update",
      },
      {
        id: 4,
        name: "world",
      },
    ];
    const { has_update, nodes_added, nodes_removed, nodes_updated } = diff(arr1, arr2);
    expect(has_update).toBe(true);
    expect(nodes_added.length).toBe(2);
    expect(nodes_removed.length).toBe(0);
    expect(nodes_updated.length).toBe(0);
  });

  it("删除全部节点", () => {
    const arr1 = [
      {
        id: 1,
        name: "hello",
      },
      {
        id: 2,
        name: "world",
      },
    ];
    const arr2: { id: number }[] = [];
    const { has_update, nodes_added, nodes_removed, nodes_updated } = diff(arr1, arr2);
    expect(has_update).toBe(true);
    expect(nodes_added.length).toBe(0);
    expect(nodes_removed.length).toBe(2);
    expect(nodes_updated.length).toBe(0);
  });
});
