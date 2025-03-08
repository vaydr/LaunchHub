import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  const [_, setLocation] = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (overlayRef.current) {
        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;
        const translateY = Math.max(0, viewportHeight - scrolled);
        overlayRef.current.style.transform = `translateY(${translateY}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-[200vh]">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-purple-900 to-indigo-900 animate-gradient">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] animate-pulse"></div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            MIT Directory
          </motion.h1>
          <motion.p 
            className="text-xl text-white/80 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Connect with the MIT community. Track interactions. Build relationships.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-white text-purple-900 hover:bg-white/90"
              onClick={() => setLocation("/contacts")}
            >
              Open Directory
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Black Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black"
        style={{ 
          transform: 'translateY(100vh)',
          transition: 'transform 0.1s linear'
        }}
      >
        <div className="container mx-auto px-4 py-24 text-white">
          <div className="max-w-4xl mx-auto space-y-24">
            <section>
              <h2 className="text-4xl font-bold mb-6">Smart Contact Management</h2>
              <p className="text-lg text-gray-300">
                Keep track of your network within the MIT community with our intelligent contact management system. Never lose touch with important connections.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-bold mb-6">Track Meaningful Interactions</h2>
              <p className="text-lg text-gray-300">
                Record and measure the strength of your interactions. Build stronger relationships over time with smart reminders and insights.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-bold mb-6">Future Integrations</h2>
              <p className="text-lg text-gray-300">
                Coming soon: Connect with Outlook, Gmail, and other platforms to automatically sync your contacts and interactions across all your communication channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}