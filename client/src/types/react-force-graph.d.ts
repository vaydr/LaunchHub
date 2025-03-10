declare module 'react-force-graph' {
  import { Component } from 'react';

  export interface GraphData {
    nodes: any[];
    links: any[];
  }

  export interface ForceGraphProps {
    graphData: GraphData;
    width?: number;
    height?: number;
    backgroundColor?: string;
    nodeLabel?: string | ((node: any) => string);
    nodeColor?: string | ((node: any) => string);
    nodeVal?: number | ((node: any) => number);
    nodeRelSize?: number;
    linkWidth?: number | ((link: any) => number);
    linkColor?: string | ((link: any) => string);
    nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    cooldownTime?: number;
    d3AlphaDecay?: number;
    d3VelocityDecay?: number;
    d3Force?: string;
    d3ForceStrength?: number;
    linkDistance?: number | ((link: any) => number);
    onNodeClick?: (node: any, event: MouseEvent) => void;
    onLinkClick?: (link: any, event: MouseEvent) => void;
    onNodeHover?: (node: any, prevNode: any) => void;
    onLinkHover?: (link: any, prevLink: any) => void;
    onNodeDrag?: (node: any, translate: { x: number, y: number }) => void;
    onNodeDragEnd?: (node: any, translate: { x: number, y: number }) => void;
    onEngineStop?: () => void;
    enableNodeDrag?: boolean;
    enableZoomPanInteraction?: boolean;
    enablePointerInteraction?: boolean;
  }

  export class ForceGraph2D extends Component<ForceGraphProps> {}
  export class ForceGraph3D extends Component<ForceGraphProps> {}
  export class ForceGraphVR extends Component<ForceGraphProps> {}
  export class ForceGraphAR extends Component<ForceGraphProps> {}
} 