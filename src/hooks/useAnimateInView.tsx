import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const useAnimateInView = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.45, // Set intersection threshold for triggering animation
  });

  const getBreakpointX = () => {
    const screenWidth = window.innerWidth;

    if (screenWidth < 600) {
      // xs screen size
      return "50px";
    } else if (screenWidth >= 600 && screenWidth < 960) {
      // md screen size
      return "75px";
    } else {
      // lg screen size and above
      return "200px";
    }
  };

  const variants = {
    messageSelf: {
      visible: { opacity: 1, scale: 1, transition: { duration: 0.5 }, x: 0 },
      hidden: { opacity: 0, scale: 0, x: 100 },
    },
    message: {
      visible: { opacity: 1, scale: 1, transition: { duration: 0.75 }, x: 0 },
      hidden: { opacity: 0, scale: 0, x: -100 },
    },
    svg: {
      visible: { opacity: 1, scale: 1, transition: { duration: 1 }, y: 0 },
      hidden: { opacity: 0, scale: 0, y: 100 },
    },
  };

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return { motion, ref, controls, variants };
};

export default useAnimateInView;
