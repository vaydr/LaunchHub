import { useEffect, useRef } from "react";

const WaveBG = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const graph = new SvgGraph();
    graph.setOutput(svg).initSvgGraph();
    
    // Periodically update graph to create animation
    const frameIntervalMs = 20;
    const interval = setInterval(() => {
      graph.stepFrame();
      graph.redrawOutput();
    }, frameIntervalMs);
    
    return () => clearInterval(interval);
  }, []);

  
  
  return (
    <div className="fixed isolate inset-0 overflow-hidden">
      <div 
        className="absolute inset-0" 
        style={{
          background: 'linear-gradient(-45deg, rgba(102, 0, 255, 0.8), rgba(26, 0, 255, 0.8), rgba(157, 0, 255, 0.8), rgba(60, 0, 255, 0.8), rgba(119, 0, 255, 0.8), rgba(0, 51, 255, 0.8))',
          backgroundSize: '300% 300%',
          animation: 'gradient 75s ease infinite',
          isolation: 'isolate',
        }}
      />
      
      {/* Add keyframes for the gradient animation in a style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes gradient {
          0% { background-position: 0% 50% }
          16.66% { background-position: 100% 50% }
          33.33% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          66.66% { background-position: 0% 50% }
          83.33% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        `
      }} />
      
      {/* Floating graph nodes */}
      <svg ref={svgRef} className="z-10 absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" />
            <stop offset="100%" />
          </linearGradient>
        </defs>
        <rect width="1" height="1" fill="none" />
        <g></g>
      </svg>
    </div>
  );
};

// Graph implementation
class GObject {
  public opacity: number = 0.0;
  
  public fade(delta: number): void {
    this.opacity = Math.max(Math.min(this.opacity + delta, 1.0), 0.0);
  }
}

class GNode extends GObject {
  public dPosX: number = 0;
  public dPosY: number = 0;
  public fillColor: string = "";
  public edgeColor: string = "";
  
  public constructor(
    public posX: number,
    public posY: number,
    public radius: number,
    public velX: number,
    public velY: number
  ) {
    super();
  }
}

class GEdge extends GObject {
  public color: string = "";
  
  public constructor(
    public nodeA: GNode,
    public nodeB: GNode
  ) {
    super();
  }
}

class DisjointSet {
  private parents: Array<number> = [];
  private ranks: Array<number> = [];
  
  public constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.parents.push(i);
      this.ranks.push(0);
    }
  }
  
  public mergeSets(i: number, j: number): boolean {
    const repr0: number = this.getRepr(i);
    const repr1: number = this.getRepr(j);
    if (repr0 == repr1)
      return false;
    const cmp: number = this.ranks[repr0] - this.ranks[repr1];
    if (cmp >= 0) {
      if (cmp == 0)
        this.ranks[repr0]++;
      this.parents[repr1] = repr0;
    } else
      this.parents[repr0] = repr1;
    return true;
  }
  
  private getRepr(i: number): number {
    if (this.parents[i] != i)
      this.parents[i] = this.getRepr(this.parents[i]);
    return this.parents[i];
  }
}

class Graph {
  // Configuration
  public idealNumNodes: number = 20;
  public extraEdgeProportion: number = 0.5;
  public radiiWeightPower: number = 0.3;
  public driftSpeed: number = 0.00005;
  public repulsionForce: number = 0.000005;
  public borderFade: number = -0.02;
  public fadeInPerFrame: number = 0.02;
  public fadeOutPerFrame: number = -0.01;
  
  // State
  protected relWidth: number = 1;
  protected relHeight: number = 1;
  private frameNumber: number = 0;
  protected nodes: Array<GNode> = [];
  protected edges: Array<GEdge> = [];
  
  public setDimensions(rw: number, rh: number): Graph {
    if (rw < 0 || rw > 1 || rh < 0 || rh > 1 || (rw != 1 && rh != 1))
      throw new Error("Assertion error");
    this.relWidth = rw;
    this.relHeight = rh;
    return this;
  }
  
  public initGraph(): void {
    this.nodes = [];
    this.edges = [];
    this.frameNumber = 0;
  }
  
  public stepFrame(): void {
    this.updateNodes();
    this.updateEdges();
    this.frameNumber++;
  }
  
  private updateNodes(): void {
    // Update each node's position, velocity, opacity. Remove fully transparent nodes.
    let newNodes: Array<GNode> = [];
    let curIdealNumNodes = Math.min(Math.floor(this.frameNumber / 3), this.idealNumNodes);
    for (let node of this.nodes) {
      // Move based on velocity
      node.posX += node.velX * this.driftSpeed;
      node.posY += node.velY * this.driftSpeed;
      // Randomly perturb velocity, with damping
      node.velX = node.velX * 0.99 + (Math.random() - 0.5) * 0.3;
      node.velY = node.velY * 0.99 + (Math.random() - 0.5) * 0.3;
      
      // Fade out nodes near the borders of the rectangle, or exceeding the target number of nodes
      const insideness = Math.min(node.posX, this.relWidth - node.posX,
        node.posY, this.relHeight - node.posY);
      node.fade(newNodes.length < curIdealNumNodes && insideness > this.borderFade ?
        this.fadeInPerFrame : this.fadeOutPerFrame);
      // Only keep visible nodes
      if (node.opacity > 0)
        newNodes.push(node);
    }
    
    // Add new nodes to fade in
    while (newNodes.length < curIdealNumNodes) {
      newNodes.push(new GNode(
        Math.random() * this.relWidth, Math.random() * this.relHeight,  // Position X and Y
        (Math.pow(Math.random(), 5) + 0.35) * 0.015,  // Radius skewing toward smaller values
        0.0, 0.0));  // Velocity
    }
    
    // Spread out nodes a bit
    this.nodes = newNodes;
    this.doForceField();
  }
  
  private doForceField(): void {
    // For aesthetics, we perturb positions instead of velocities
    for (let i = 0; i < this.nodes.length; i++) {
      let a: GNode = this.nodes[i];
      a.dPosX = 0;
      a.dPosY = 0;
      for (let j = 0; j < i; j++) {
        let b: GNode = this.nodes[j];
        let dx: number = a.posX - b.posX;
        let dy: number = a.posY - b.posY;
        const distSqr: number = dx * dx + dy * dy;
        const factor: number = this.repulsionForce / (Math.sqrt(distSqr) * (distSqr + 0.00001));
        dx *= factor;
        dy *= factor;
        a.dPosX += dx;
        a.dPosY += dy;
        b.dPosX -= dx;
        b.dPosY -= dy;
      }
    }
    for (let node of this.nodes) {
      node.posX += node.dPosX;
      node.posY += node.dPosY;
    }
  }
  
  private updateEdges(): void {
    // Calculate array of spanning tree edges, then add some extra low-weight edges
    let allEdges: Array<[number,number,number]> = this.calcAllEdgeWeights();
    const idealNumEdges = Math.round((this.nodes.length - 1) * (1 + this.extraEdgeProportion));
    let idealEdges: Array<GEdge> = this.calcSpanningTree(allEdges);
    for (const [_, i, j] of allEdges) {
      if (idealEdges.length >= idealNumEdges)
        break;
      let edge = new GEdge(this.nodes[i], this.nodes[j]);
      if (!Graph.containsEdge(idealEdges, edge))
        idealEdges.push(edge);
    }
    
    // Classify each current edge, checking whether it is in the ideal set; prune faded edges
    let newEdges: Array<GEdge> = [];
    for (let edge of this.edges) {
      edge.fade(Graph.containsEdge(idealEdges, edge) ?
        this.fadeInPerFrame : this.fadeOutPerFrame);
      if (Math.min(edge.opacity, edge.nodeA.opacity, edge.nodeB.opacity) > 0)
        newEdges.push(edge);
    }
    
    // If there's room for new edges, add some missing spanning tree edges (higher priority), then extra edges
    for (const edge of idealEdges) {
      if (newEdges.length >= idealNumEdges)
        break;
      if (!Graph.containsEdge(newEdges, edge))
        newEdges.push(edge);
    }
    this.edges = newEdges;
  }
  
  private calcAllEdgeWeights(): Array<[number,number,number]> {
    let result: Array<[number,number,number]> = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const a: GNode = this.nodes[i];
      for (let j = 0; j < i; j++) {
        const b: GNode = this.nodes[j];
        let weight: number = Math.hypot(a.posX - b.posX, a.posY - b.posY);
        weight /= Math.pow(a.radius * b.radius, this.radiiWeightPower);
        result.push([weight, i, j]);
      }
    }
    return result.sort((a, b) => a[0] - b[0]);
  }
  
  private calcSpanningTree(allEdges: Readonly<Array<[number,number,number]>>): Array<GEdge> {
    let result: Array<GEdge> = [];
    let ds = new DisjointSet(this.nodes.length);
    for (const [_, i, j] of allEdges) {
      if (ds.mergeSets(i, j)) {
        result.push(new GEdge(this.nodes[i], this.nodes[j]));
        if (result.length >= this.nodes.length - 1)
          break;
      }
    }
    return result;
  }
  
  private static containsEdge(edges: Readonly<Array<GEdge>>, edge: GEdge): boolean {
    for (const e of edges) {
      if ((e.nodeA == edge.nodeA && e.nodeB == edge.nodeB) ||
          (e.nodeA == edge.nodeB && e.nodeB == edge.nodeA))
        return true;
    }
    return false;
  }
}

class SvgGraph extends Graph {
  private svgElem: Element|null = null;
  private NODE_FILL: string[] = ["150,0,255", "126,15,255", "157,0,255", "255,255,255", "150,150,255"]; // Fill colors for nodes
  private NODE_EDGE: string[] = ["0,0,0"]; // Edge colors for nodes
  private EDGE_COLOR: string[] = ["0,0,0"]; // Colors for edges
  
  // Array of GitHub avatar profile pictures
  private AVATAR_URLS: string[] = [
    "https://avatars.githubusercontent.com/u/1?v=4",
    "https://avatars.githubusercontent.com/u/17?v=4",
    "https://avatars.githubusercontent.com/u/18?v=4",
    "https://avatars.githubusercontent.com/u/19?v=4",
    "https://avatars.githubusercontent.com/u/20?v=4",
    "https://avatars.githubusercontent.com/u/25?v=4",
    "https://avatars.githubusercontent.com/u/30?v=4",
    "https://avatars.githubusercontent.com/u/35?v=4",
    "https://avatars.githubusercontent.com/u/37?v=4",
    "https://avatars.githubusercontent.com/u/40?v=4",
    "https://avatars.githubusercontent.com/u/45?v=4",
    "https://avatars.githubusercontent.com/u/50?v=4",
    "https://avatars.githubusercontent.com/u/55?v=4",
    "https://avatars.githubusercontent.com/u/60?v=4",
    "https://avatars.githubusercontent.com/u/65?v=4",
    "https://avatars.githubusercontent.com/u/70?v=4",
    "https://avatars.githubusercontent.com/u/75?v=4",
    "https://avatars.githubusercontent.com/u/80?v=4",
    "https://avatars.githubusercontent.com/u/85?v=4",
    "https://avatars.githubusercontent.com/u/90?v=4",
    "https://avatars.githubusercontent.com/u/95?v=4",
    "https://avatars.githubusercontent.com/u/100?v=4",
    "https://avatars.githubusercontent.com/u/105?v=4",
    "https://avatars.githubusercontent.com/u/110?v=4",
    "https://avatars.githubusercontent.com/u/115?v=4",
    "https://avatars.githubusercontent.com/u/120?v=4",
    "https://avatars.githubusercontent.com/u/125?v=4",
    "https://avatars.githubusercontent.com/u/130?v=4",
    "https://avatars.githubusercontent.com/u/135?v=4",
    "https://avatars.githubusercontent.com/u/140?v=4"
  ];
  
  public setOutput(svg: Element): SvgGraph {
    let br = svg.getBoundingClientRect();
    this.setDimensions(
      br.width / Math.max(br.width, br.height),
      br.height / Math.max(br.width, br.height));
    
    this.svgElem = svg;
    svg.setAttribute("viewBox", `0 0 ${this.relWidth} ${this.relHeight}`);
    svg.querySelectorAll("stop")[0].setAttribute("stop-color", "#575E85");
    svg.querySelectorAll("stop")[1].setAttribute("stop-color", "#2E3145");
    return this;
  }
  
  public initSvgGraph(): void {
    this.initGraph();
    this.redrawOutput();
  }
  
  private getRandomColor(colorArray: string[]): string {
    return colorArray[Math.floor(Math.random() * colorArray.length)];
  }
  
  private getRandomAvatar(): string {
    return this.AVATAR_URLS[Math.floor(Math.random() * this.AVATAR_URLS.length)];
  }
  
  public redrawOutput(): void {
    if (this.svgElem === null)
      throw new Error("Invalid state");
    let svg = this.svgElem as Element;
    
    // Clear movable objects
    let gElem = svg.querySelector("g") as Element;
    while (gElem.firstChild !== null)
      gElem.removeChild(gElem.firstChild);
    
    function createSvgElem(tag: string, attribs: any): Element {
      let result = document.createElementNS(svg.namespaceURI, tag);
      for (const key in attribs)
        result.setAttribute(key, attribs[key].toString());
      return result;
    }
    
    // Draw every edge FIRST
    for (const edge of this.edges) {
      const a: GNode = edge.nodeA;
      const b: GNode = edge.nodeB;
      let dx: number = a.posX - b.posX;
      let dy: number = a.posY - b.posY;
      const mag: number = Math.hypot(dx, dy);
      
      // Assign random color if not already assigned
      if (!edge.color) {
        edge.color = this.getRandomColor(this.EDGE_COLOR);
      }
      
      // Draw edge as a line
      gElem.append(createSvgElem("line", {
        "x1": a.posX,
        "y1": a.posY,
        "x2": b.posX,
        "y2": b.posY,
        "stroke": `rgba(${edge.color},${Math.min(a.opacity, b.opacity, edge.opacity).toFixed(3)})`,
        "stroke-width": "0.0015",
      }));
    }
    
    // Draw every node SECOND (so they appear on top)
    for (const node of this.nodes) {
      // Assign random colors if not already assigned
      if (!node.fillColor) {
        node.fillColor = this.getRandomColor(this.NODE_FILL);
        // Assign a random avatar URL
        (node as any).avatarUrl = this.getRandomAvatar();
      }
      if (!node.edgeColor) {
        node.edgeColor = this.getRandomColor(this.NODE_EDGE);
      }
      
      // Create a group for the node
      const nodeGroup = createSvgElem("g", {
        "transform": `translate(${node.posX - node.radius},${node.posY - node.radius})`,
        "opacity": node.opacity.toFixed(3)
      });
      
      // Create a clipPath for the circular avatar
      const clipPathId = `clip-${node.posX}-${node.posY}`;
      const clipPath = createSvgElem("clipPath", {
        "id": clipPathId
      });
      
      const clipCircle = createSvgElem("circle", {
        "cx": node.radius,
        "cy": node.radius,
        "r": node.radius
      });
      
      clipPath.appendChild(clipCircle);
      
      // Create the image element for the avatar
      const image = createSvgElem("image", {
        "href": (node as any).avatarUrl,
        "width": node.radius * 2,
        "height": node.radius * 2,
        "clip-path": `url(#${clipPathId})`,
        "preserveAspectRatio": "xMidYMid slice"
      });
      
      // Create the circle for the border
      const circle = createSvgElem("circle", {
        "cx": node.radius,
        "cy": node.radius,
        "r": node.radius,
        "fill": "none",
        "stroke": `rgba(${node.edgeColor},${node.opacity.toFixed(3)})`,
        "stroke-width": "0.001"
      });
      
      // Add the clipPath and elements to the SVG
      nodeGroup.appendChild(clipPath);
      nodeGroup.appendChild(image);
      nodeGroup.appendChild(circle);
      gElem.appendChild(nodeGroup);
    }
  }
}

export default WaveBG;