import { useCallback, useRef, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { Card, CardContent } from "@/components/ui/card";
import type { NetworkGraph, NetworkNode, NetworkLink, Contact } from "@shared/schema";

interface NetworkGraphProps {
  contacts: Contact[];
}

export default function NetworkGraph({ contacts }: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const graphRef = useRef<any>();

  // Transform contacts into graph data
  const graphData: NetworkGraph = {
    nodes: contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      department: contact.department,
      year: contact.year || undefined,
      group: contact.department
    })),
    links: contacts.flatMap(contact => 
      (contact.connections || []).map(targetId => ({
        source: contact.id,
        target: targetId,
        value: 1
      }))
    ).filter(link => 
      // Only show links where both nodes are in the filtered set
      contacts.some(c => c.id === link.source) && 
      contacts.some(c => c.id === link.target)
    )
  };

  const handleNodeHover = useCallback((node: NetworkNode | null) => {
    setHoveredNode(node);
    if (graphRef.current) {
      graphRef.current.style.cursor = node ? 'pointer' : 'default';
    }
  }, []);

  return (
    <div className="relative h-[600px] w-full bg-black/90 rounded-lg">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeColor={node => (node as NetworkNode).group === 'EECS' ? '#9333ea' : '#4f46e5'}
        nodeRelSize={8}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        backgroundColor="transparent"
        onNodeHover={handleNodeHover}
        nodeCanvasObject={(node: NetworkNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.fillText(label, node.x!, node.y! + 12);
        }}
      />

      {/* Hover Info Card */}
      {hoveredNode && (
        <Card className="absolute top-4 left-4 w-64 bg-black/80 border-purple-500">
          <CardContent className="p-4 text-white">
            <h3 className="font-bold text-lg">{hoveredNode.name}</h3>
            <p className="text-sm text-gray-300">{hoveredNode.department}</p>
            {hoveredNode.year && (
              <p className="text-sm text-gray-300">Class of {hoveredNode.year}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}