"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function AnimatedButton({
  children,
  className,
  onClick,
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
