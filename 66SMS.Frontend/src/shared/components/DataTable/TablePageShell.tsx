import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/shared/motion/pageVariants";

interface TablePageShellProps {
  children: React.ReactNode;
  isFetching?: boolean;
  isLoading?: boolean;
}

export function TablePageShell({
  children,
  isFetching = false,
  isLoading = false,
}: TablePageShellProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <motion.div variants={itemVariants} className="lotus-admin-table-page-card">
        {children}
        {isFetching && !isLoading && (
          <div className="lotus-admin-table-fetch-bar">
            <div className="lotus-admin-table-fetch-bar-inner" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
