function genUuid4() {
  let str = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  for (let i = 0, len = str.length; i < len; i++) {
    switch (str[i]) {
      case "x":
        str[i] = Math.floor(Math.random() * 16).toString(16);
        break;
      case "y":
        str[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
        break;
    }
  }
  return str.join("");
}

class GraphNode {
  constructor(value = undefined) {
    if(value !== undefined) {
      this.value = value;
    } else {
      this.value = null;
    }
    this.oid = genUuid4();
    this.edgeTo = {};
    this.edgeFrom = {};
  }

  setValue(value) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  connectTo(nodeTo, edgeInfo) {
    this.edgeTo[nodeTo.oid] = { node: nodeTo, info: edgeInfo };
    nodeTo.edgeFrom[this.oid] = { node: this, info: edgeInfo };
  }

  disconnectWith(node) {
    delete this.edgeTo[node.oid];
    delete this.edgeFrom[node.oid];
    delete node.edgeTo[this.oid];
    delete node.edgeFrom[this.oid];
  }

  disconnectAll() {
    Object.keys(this.edgeTo).forEach(k => {
      this.disconnectWith(this.edgeTo[k].node);
    });
    Object.keys(this.edgeFrom).forEach(k => {
      this.disconnectWith(this.edgeFrom[k].node);
    });
  }

  getConnectedTo() {
    return Object.keys(this.edgeTo).map(k => this.edgeTo[k].node);
  }

  getConnectedFrom() {
    return Object.keys(this.edgeFrom).map(k => this.edgeFrom[k].node);
  }

  getConnected() {
    return [...this.getConnectedTo(), ...this.getConnectedFrom()];
  }

  isConnectedTo(node) {
    return this.edgeTo[node.oid]?.node;
  }

  isConnectedFrom(node) {
    return this.edgeFrom[node.oid]?.node;
  }

  isConnected(node) {
    return this.edgeTo[node.oid]?.node || this.edgeFrom[node.oid]?.node;
  }
}

class Graph {
  constructor() {
    this.nodes = [];
    this.oid = genUuid4();
  }

  createNode(value) {
    let n = new GraphNode(value);
    this.nodes.push(n);
    return n;
  }

  getNodes() {
    return this.nodes;
  }
}

export default {
  GraphNode: GraphNode,
  // GraphEdge: GraphEdge,
  Graph: Graph,
};
