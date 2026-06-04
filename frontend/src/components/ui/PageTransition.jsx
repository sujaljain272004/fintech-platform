import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 14, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(6px)" },
};

const PageTransition = ({ children, className = "" }) => (
  <motion.div
    className={className}
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.28, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;