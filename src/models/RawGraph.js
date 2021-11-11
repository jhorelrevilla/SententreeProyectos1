import RenderedGraph from './RenderedGraph.js';

export default class RawGraph {
  constructor(minSupport, maxSupport) {
    this.nodes = [];
    this.linkadj = [];
    this.minSupport = minSupport;
    this.maxSupport = maxSupport;
    this.totalNodeCnt = 0;
  }

  clear() {
    this.nodes = [];
    this.linkadj = [];
    return this;
  }

  toRenderedGraph() {
    return new RenderedGraph(this);
  }
}
