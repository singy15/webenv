import { describe, test, expect } from "vitest";
import graph from "./graph.js";

describe("GraphNode", () => {
  test("new", () => {
    let node = new graph.GraphNode();
    expect(node.value).toBe(null);
    expect(node.oid).not.toBe(null);
    expect(node.edgeTo).toStrictEqual({});
    expect(node.edgeFrom).toStrictEqual({});

    let n2 = new graph.GraphNode(1);
    expect(n2.value).toBe(1);
    expect(n2.oid).not.toBe(null);
    expect(n2.edgeTo).toStrictEqual({});
    expect(n2.edgeFrom).toStrictEqual({});
  });

  test("setValue", () => {
    let node = new graph.GraphNode();
    node.setValue(1);
    expect(node.value).toBe(1);
  });

  test("getValue", () => {
    let node = new graph.GraphNode();
    node.setValue(1);
    expect(node.getValue()).toBe(1);
  });

  test("connectTo", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();

    n1.connectTo(n2);
    expect(n1.edgeTo[n2.oid].node).toBe(n2);
    expect(n2.edgeFrom[n1.oid].node).toBe(n1);

    n2.connectTo(n1);
    expect(n2.edgeTo[n1.oid].node).toBe(n1);
    expect(n1.edgeFrom[n2.oid].node).toBe(n2);
  });

  test("disconnectWith", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();

    n1.connectTo(n2);
    n1.disconnectWith(n2);
    expect(n1.edgeTo[n2.oid]).toStrictEqual(undefined);
    expect(n2.edgeFrom[n1.oid]).toStrictEqual(undefined);

    n1.connectTo(n2);
    n2.disconnectWith(n1);
    expect(n1.edgeTo[n2.oid]).toStrictEqual(undefined);
    expect(n2.edgeFrom[n1.oid]).toStrictEqual(undefined);
  });

  test("disconnectAll", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();
    let n3 = new graph.GraphNode();

    n1.connectTo(n2);
    n2.connectTo(n3);
    n1.connectTo(n3);
    n2.disconnectAll();

    expect(n1.edgeTo[n2.oid]).toStrictEqual(undefined);
    expect(n2.edgeFrom[n1.oid]).toStrictEqual(undefined);
    expect(n2.edgeTo[n3.oid]).toStrictEqual(undefined);
    expect(n3.edgeFrom[n2.oid]).toStrictEqual(undefined);
    expect(n1.edgeTo[n3.oid].node).toBe(n3);
    expect(n3.edgeFrom[n1.oid].node).toBe(n1);
  });

  test("getConnectedTo", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();
    let n3 = new graph.GraphNode();

    n1.connectTo(n2);
    n2.connectTo(n3);
    expect(n1.getConnectedTo().indexOf(n2) >= 0).toBe(true);
  });

  test("getConnectedFrom", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();
    let n3 = new graph.GraphNode();

    n1.connectTo(n2);
    n2.connectTo(n3);
    expect(n2.getConnectedFrom().indexOf(n1) >= 0).toBe(true);
  });

  test("getConnected", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();
    let n3 = new graph.GraphNode();

    n1.connectTo(n2);
    n2.connectTo(n3);
    expect(n2.getConnected().indexOf(n1) >= 0).toBe(true);
    expect(n2.getConnected().indexOf(n3) >= 0).toBe(true);
  });

  test("isConnectedTo", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();
    let n3 = new graph.GraphNode();

    n1.connectTo(n2);
    n2.connectTo(n3);
    expect(n1.isConnectedTo(n2)).toBe(n2);
  });

  test("isConnectedFrom", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();
    let n3 = new graph.GraphNode();

    n1.connectTo(n2);
    n2.connectTo(n3);
    expect(n2.isConnectedFrom(n1)).toBe(n1);
  });

  test("isConnected", () => {
    let n1 = new graph.GraphNode();
    let n2 = new graph.GraphNode();
    let n3 = new graph.GraphNode();

    n1.connectTo(n2);
    n2.connectTo(n3);
    expect(n2.isConnected(n1)).toBe(n1);
    expect(n2.isConnected(n3)).toBe(n3);
  });
});

describe("Graph", () => {
  test("new", () => {
    let g1 = new graph.Graph();
    expect(g1.nodes).toStrictEqual([]);
    expect(g1.oid).not.toBe(null);
  });

  test("createNode", () => {
    let g1 = new graph.Graph();
    let n1 = g1.createNode(1);
    expect(g1.nodes[0]).toBe(n1);
    expect(n1.getValue()).toBe(1);
  });
});
