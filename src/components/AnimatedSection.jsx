// src/components/AnimatedSection.jsx
import React from 'react';
import { useInView } from 'react-intersection-observer';

function AnimatedSection({ children }) {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animation will trigger only once
    threshold: 0.1,    // Trigger when 10% of the section is visible
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-in-out transform 
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {children}
    </div>
  );
}

export default AnimatedSection;