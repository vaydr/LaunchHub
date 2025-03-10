import React, { useRef, useEffect } from "react";
import { useNetwork } from "@/contexts/network-context";
import { useQuery } from "@tanstack/react-query";
import { ForceGraph2D } from "react-force-graph";
import type { Contact } from "@shared/schema";

// Define types for graph nodes and links
interface GraphNode {
  id: string;
  name: string;
  role?: string;
  year?: number | null;
  interactionStrength?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface NetworkCanvasProps {
  theme: 'light' | 'dark';
}

export default function NetworkCanvas({ theme }: NetworkCanvasProps) {
  const { settings, updateSettings } = useNetwork();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  
  // Fetch contacts data
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/contacts'],
    queryFn: async () => {
      return fetch('/api/contacts').then(res => res.json());
    }
  });

  // Apply physics settings when they change
  useEffect(() => {
    if (!graphRef.current) return;
    
    const fg = graphRef.current;
    
    try {
      // Apply charge strength (repulsion force)
      if (fg.d3Force && typeof fg.d3Force === 'function') {
        const chargeForce = fg.d3Force('charge');
        if (chargeForce && typeof chargeForce.strength === 'function') {
          chargeForce.strength(settings.chargeStrength);
        }
        
        // Apply link distance
        const linkForce = fg.d3Force('link');
        if (linkForce && typeof linkForce.distance === 'function') {
          linkForce.distance(settings.linkDistance);
        }
        
        // Reheat simulation to apply changes
        if (typeof fg.d3ReheatSimulation === 'function') {
          fg.d3ReheatSimulation();
        }
      }
    } catch (error) {
      console.error("Error applying physics settings:", error);
    }
  }, [settings.chargeStrength, settings.linkDistance]);

  // Prepare graph data
  const graphData = React.useMemo(() => {
    if (isLoading || !contacts.length) {
      return { nodes: [], links: [] };
    }
    
    // Sort contacts by interaction strength (descending) to prioritize important nodes
    const sortedContacts = [...contacts]
      .sort((a, b) => (b.interactionStrength || 0) - (a.interactionStrength || 0))
      .slice(0, settings.maxNodeCount);
    
    // Create nodes from contacts
    const nodes = sortedContacts.map((contact: Contact) => ({
      id: contact.id.toString(),
      name: contact.name,
      role: contact.role,
      year: contact.year,
      interactionStrength: contact.interactionStrength || 0
    }));
    
    // Create links with 20% probability
    const links = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // 20% chance of creating a link
        if (Math.random() < 0.2) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight: 1
          });
        }
      }
    }
    
    return { nodes, links };
  }, [contacts, isLoading, settings.maxNodeCount]);

  // Get node color based on interaction strength and color scheme
  const getNodeColor = (node: GraphNode) => {
    const strength = node.interactionStrength || 0;
    
    switch (settings.colorScheme) {
      case 'rainbow':
        // Rainbow color scheme based on interaction strength
        if (strength > 8) return '#FF0000'; // Red
        if (strength > 6) return '#FF7F00'; // Orange
        if (strength > 4) return '#FFFF00'; // Yellow
        if (strength > 2) return '#00FF00'; // Green
        return '#0000FF'; // Blue
        
      case 'heat':
        // Heat map color scheme
        if (strength > 8) return '#FF0000'; // Hot (red)
        if (strength > 6) return '#FF4500'; 
        if (strength > 4) return '#FF8C00';
        if (strength > 2) return '#FFA500';
        return '#FFD700'; // Cold (yellow)
        
      case 'default':
      default:
        // Default color scheme
        if (strength > 7) return theme === 'dark' ? '#10b981' : '#059669'; // Green
        if (strength > 4) return theme === 'dark' ? '#3b82f6' : '#2563eb'; // Blue
        return theme === 'dark' ? '#6366f1' : '#4f46e5'; // Indigo
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!graphData.nodes.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No contacts available to display</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try adding some contacts first</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={window.innerWidth - 40} // Subtract padding
        height={window.innerHeight - 120} // Subtract header and padding
        backgroundColor={theme === 'dark' ? '#1f2937' : '#f9fafb'}
        nodeLabel={(node: any) => `${node.name}${node.role ? ` (${node.role})` : ''}`}
        nodeColor={(node: any) => getNodeColor(node as GraphNode)}
        nodeVal={() => settings.nodeSize * 2}
        nodeRelSize={settings.nodeRelSize}
        linkWidth={() => settings.edgeThickness}
        linkColor={() => theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}
        cooldownTime={settings.cooldownTime}
        d3AlphaDecay={0.1}
        d3VelocityDecay={0.4}
        d3Force="charge"
        d3ForceStrength={settings.chargeStrength}
        linkDistance={settings.linkDistance}
        enableNodeDrag={true}
        enableZoomPanInteraction={true}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const typedNode = node as GraphNode;
          const { x, y, name } = typedNode;
          if (!x || !y) return;
          
          // Draw node
          const size = settings.nodeSize;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fillStyle = getNodeColor(typedNode);
          ctx.fill();
          
          // Draw label if enabled
          if (settings.showLabels) {
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = theme === 'dark' ? '#e5e7eb' : '#4b5563';
            
            // Add background to text for better readability
            const textWidth = ctx.measureText(name).width;
            const bgPadding = 2;
            
            ctx.fillStyle = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(249, 250, 251, 0.8)';
            ctx.fillRect(
              x - textWidth/2 - bgPadding,
              y + size + fontSize/2 - bgPadding,
              textWidth + bgPadding*2,
              fontSize + bgPadding*2
            );
            
            ctx.fillStyle = theme === 'dark' ? '#f9fafb' : '#1f2937';
            ctx.fillText(name, x, y + size + fontSize);
          }
        }}
      />
      
      {/* Settings info */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 text-xs">
        <div className="text-gray-600 dark:text-gray-300">
          <div>Repulsion: {Math.abs(settings.chargeStrength)}</div>
          <div>Link Distance: {settings.linkDistance}</div>
          <div>Node Size: {settings.nodeSize}</div>
          <div>Color: {settings.colorScheme}</div>
        </div>
      </div>
      
      {/* Node count indicator */}
      {contacts.length > settings.maxNodeCount && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            Showing top {settings.maxNodeCount} of {contacts.length} contacts
          </span>
        </div>
      )}
    </div>
  );
} 