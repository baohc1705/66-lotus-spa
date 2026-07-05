import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/shared/motion/pageVariants";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

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
      <motion.div variants={itemVariants} className={TABLE_STYLES.pageCard}>
        {children}
        {isFetching && !isLoading && (
          <div className={TABLE_STYLES.fetchBar}>
            <div className={TABLE_STYLES.fetchBarInner} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
