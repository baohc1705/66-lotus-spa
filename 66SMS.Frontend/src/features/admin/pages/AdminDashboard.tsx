import { motion } from "motion/react";
import { RevenueDashboard } from "@/features/revenue";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

export function AdminDashboard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="w-full"
    >
      <RevenueDashboard />
    </motion.div>
  );
}

