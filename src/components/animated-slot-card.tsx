
import { motion } from "framer-motion";
import { SlotCard } from "./slot-card";
import { Slot } from "@/types/venue";
import { cn } from "@/lib/utils";

interface AnimatedSlotCardProps {
  slot: Slot;
  index: number;
  className?: string;
}

export function AnimatedSlotCard({ slot, index, className }: AnimatedSlotCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn("relative", className)}
    >
      <motion.div
        className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-sports-blue to-sports-orange opacity-0 group-hover:opacity-100 blur-sm transition-all"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.3 }}
      />
      <SlotCard slot={slot} className="relative" />
    </motion.div>
  );
}
