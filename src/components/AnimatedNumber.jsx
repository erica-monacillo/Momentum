import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

const AnimatedNumber = ({ value }) => {
  const nodeRef = useRef();

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(parseInt(node.textContent) || 0, value, {
        duration: 1,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Math.round(v);
        }
      });
      return () => controls.stop();
    }
  }, [value]);

  return <span ref={nodeRef}>{value}</span>;
};

export default AnimatedNumber;
