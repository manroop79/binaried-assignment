import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 48, className = "" }: SpinnerProps) {
  return (
    <motion.div
      className={`flex justify-center items-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 1, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Sparkles className="text-blue-500" size={size} />
      </motion.div>
    </motion.div>
  );
}

