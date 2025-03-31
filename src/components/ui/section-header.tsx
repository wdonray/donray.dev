import { motion } from "framer-motion";

interface SectionHeaderProps {
  id: string;
  title: string;
  isInView: boolean;
}

export function SectionHeader({ id, title, isInView }: SectionHeaderProps) {
  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={isInView ? { opacity: 1, width: 40 } : { opacity: 0, width: 0 }}
        transition={{ duration: 0.5 }}
        className="h-1 bg-primary rounded-full"
        aria-hidden="true"
      />
      <motion.h2
        id={id}
        className="text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {title}
      </motion.h2>
    </div>
  );
} 