import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { Card, CardContent } from "@/components/ui/card";
import type { Contact } from "@shared/schema";

interface NetworkGraphProps {
  contacts: Contact[];
}

export default function NetworkGraph({ contacts }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Contact | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Transform contacts into vis-network format
    const nodes = contacts.map(contact => ({
      id: contact.id,
      label: contact.name,
      title: contact.name,
      group: contact.department,
      color: contact.department === 'EECS' ? '#9333ea' : '#4f46e5',
    }));

    const edges = contacts.flatMap(contact => 
      (contact.connections || []).map(targetId => ({
        from: contact.id,
        to: targetId,
        color: { color: 'rgba(255, 255, 255, 0.2)' }
      }))
    ).filter(edge => 
      contacts.some(c => c.id === edge.from) && 
      contacts.some(c => c.id === edge.to)
    );

    const data = { nodes, edges };

    const options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: {
          color: '#ffffff',
          size: 14,
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 1,
        smooth: {
          type: 'continuous'
        }
      },
      physics: {
        stabilization: false,
        barnesHut: {
          gravitationalConstant: -80000,
          springConstant: 0.001,
          springLength: 200
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200
      },
      background: 'transparent'
    };

    const network = new Network(containerRef.current, data, options);

    network.on('hoverNode', (params) => {
      const contact = contacts.find(c => c.id === params.node);
      setHoveredNode(contact || null);
    });

    network.on('blurNode', () => {
      setHoveredNode(null);
    });

    return () => {
      network.destroy();
    };
  }, [contacts]);

  return (
    <div className="relative h-[600px] w-full bg-black/90 rounded-lg">
      <div ref={containerRef} className="h-full w-full" />

      {/* Hover Info Card */}
      {hoveredNode && (
        <Card className="absolute top-4 left-4 w-64 bg-black/80 border-purple-500">
          <CardContent className="p-4 text-white">
            <h3 className="font-bold text-lg">{hoveredNode.name}</h3>
            <p className="text-sm text-gray-300">{hoveredNode.department}</p>
            {hoveredNode.year && (
              <p className="text-sm text-gray-300">Class of {hoveredNode.year}</p>
            )}
            <p className="text-sm text-gray-300 mt-2">{hoveredNode.role}</p>
            {hoveredNode.notes && (
              <p className="text-sm text-gray-300 mt-2">{hoveredNode.notes}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}