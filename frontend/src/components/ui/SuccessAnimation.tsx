import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface SuccessAnimationProps {
  title?: string;
  description?: string;
  onComplete?: () => void;
}

const SuccessAnimation = ({ 
  title = "Success!", 
  description = "Operation completed successfully",
  onComplete 
}: SuccessAnimationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
        duration: 0.5,
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 shadow-2xl max-w-sm mx-4 border-2 border-green-200 dark:border-green-700"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 10
          }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            {/* Outer ring animation */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full bg-green-400"
            />
            
            {/* Middle ring animation */}
            <motion.div
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.2
              }}
              className="absolute inset-0 rounded-full bg-green-500"
            />
            
            {/* Success icon */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: "easeOut"
              }}
              className="relative bg-green-500 rounded-full p-4"
            >
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
            {title}
          </h3>
          <p className="text-green-700 dark:text-green-300 text-sm">
            {description}
          </p>
        </motion.div>

        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: "50%", 
                y: "50%",
                scale: 0,
                opacity: 1
              }}
              animate={{ 
                x: `${50 + (Math.random() - 0.5) * 100}%`,
                y: `${50 + (Math.random() - 0.5) * 100}%`,
                scale: Math.random() * 1.5 + 0.5,
                opacity: 0
              }}
              transition={{
                duration: 1.5,
                delay: 0.3 + Math.random() * 0.3,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#60a5fa'][i % 5]
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuccessAnimation;
