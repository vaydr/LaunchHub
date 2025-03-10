import { motion } from "framer-motion";
interface TitleProps {
    textColor?: string;
  }
  
  function Title({ textColor = "white" }: TitleProps) {
    return (
      <motion.h1
        className={`select-none text-9xl md:text-[11rem] font-bold text-${textColor} mb-6 hover:text-shadow-glow transition-all duration-300 hover:drop-shadow-xl`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Bloke
      </motion.h1>
    );
  }

  export default Title;