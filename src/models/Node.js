import { min, sum } from 'lodash';

export default class Node {
  constructor(rawNode) {
    this.data = rawNode;
    this.leftLinks = [];
    this.rightLinks = [];

    this.id = -1;
    this.x = 0;
    this.y = 0;
    this.width = 50;
    this.height = 18;
  }

  isLeaf() {
    return this.leftLinks.length === 0 || this.rightLinks.length === 0;
  }

  isLeftLeaf() {
    return this.leftLinks.length === 0;
  }

  isRightLeaf() {
    return this.rightLinks.length === 0;
  }

  leftEdge() {
    return this.x - this.width / 2;
  }

  rightEdge() {
    return this.x + this.width / 2;
  }

  getLeftNodes() {
    return this.leftLinks.map(l => l.source);
  }

  getRightNodes() {
    return this.rightLinks.map(l => l.target);
  }

  createAlignmentConstraints(axis, nodes) {
    return nodes.length > 1 ? {
      type: 'alignment',
      axis,
      offsets: nodes.map(n => ({ node: n.id, offset: 0 })),
    } : null;
  }

  computeLeftConstraints() {
    const nodes = this.getLeftNodes()
      .filter(n => n.rightLinks.length === 1);

    return this.createAlignmentConstraints('x', nodes);
  }

  computeRightConstraints() {
    const nodes = this.getRightNodes()
      .filter(n => n.leftLinks.length === 1);

    return this.createAlignmentConstraints('x', nodes);
  }

  computeOrderConstraints() {
    const rules = [];

    if (this.getRightNodes().length > 1) {
      const nodes = this.getRightNodes();
      for (let i = 1; i < nodes.length; i++) {
        rules.push({
          axis: 'y',
          left: nodes[i - 1].id,
          right: nodes[i].id,
          gap: 5,
        });
      }
    }
    if (this.getLeftNodes().length > 1) {
      const nodes = this.getLeftNodes();
      for (let i = 1; i < nodes.length; i++) {
        rules.push({
          axis: 'y',
          left: nodes[i - 1].id,
          right: nodes[i].id,
          gap: 5,
        });
      }
    }

    return rules;
  }

  updateAttachPoints() {
    if (this.leftLinks.length === 1) {
      this.leftLinks[0].attachPoints.y2 = this.y;
    } else if (this.leftLinks.length > 1) {
      const totalLeft = sum(this.leftLinks.map(l => l.strokeWidth));
      let startPos = this.y - (totalLeft + (this.leftLinks.length - 1) * 2) / 2;
      this.leftLinks
        .concat()
        .sort((a, b) => a.source.y - b.source.y)
        .forEach(link => {
          link.attachPoints.y2 = startPos + link.strokeWidth / 2;
          startPos += link.strokeWidth + 2;
        });
    }

    if (this.rightLinks.length === 1) {
      this.rightLinks[0].attachPoints.y1 = this.y;
    } else if (this.rightLinks.length > 1) {
      const totalRight = sum(this.rightLinks.map(l => l.strokeWidth));
      let startPos = this.y - (totalRight + (this.rightLinks.length - 1) * 2) / 2;
      this.rightLinks
        .concat()
        .sort((a, b) => a.target.y - b.target.y)
        .forEach(link => {
          link.attachPoints.y1 = startPos + link.strokeWidth / 2;
          startPos += link.strokeWidth + 2;
        });
    }
  }

  canMerge(node) {
    return this.data.entity === node.data.entity;
  }

  static merge(nodes) {
    return new Node({
      id: min(nodes.map(n => n.data.id)),
      entity: nodes[0].data.entity,
      freq: sum(nodes.map(n => n.data.freq)),
      mergedData: nodes.map(n => n.data),
      topEntries: nodes
        .reduce(
          (acc, curr) => acc.concat(curr.data.topEntries),
          []
        )
        .slice(0, 5),
    });
  }
}
