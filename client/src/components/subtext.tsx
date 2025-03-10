import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function Subtext() {
    const activities = [
      "found a B2B SaaS with",
      "lease your bedroom to",
      "co-author a paper with",
      "take a hard class with",
      "try something new with",
    ];
    
    const [index, setIndex] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % activities.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }, []);
    
    return (
      <motion.div
        className="text-3xl drop-shadow-xl text-white max-w-2xl mb-12 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="flex">
          <span className="select-none whitespace-nowrap">Find people at MIT to </span>
          <div className="relative ml-2 inline-block h-[1.5em] min-w-[350px]">
            {activities.map((activity, i) => (
              <motion.span
                key={i}
                className="font-bold absolute left-0 top-0 underline no-select cursor-pointer transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: i === index ? 1 : 0,
                  y: i === index ? 0 : 20
                }}
                transition={{ duration: 0.5 }}
              >
                {activity}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }
  
  export default Subtext;