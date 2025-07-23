import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function PageTransition({ children, className, delay = 0 }: PageTransitionProps) {
  return (
    <div 
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
}

export function StaggeredChildren({ 
  children, 
  className,
  stagger = 100 
}: { 
  children: ReactNode[];
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={className}>
      {Array.isArray(children) ? children.map((child, index) => (
        <PageTransition key={index} delay={index * stagger}>
          {child}
        </PageTransition>
      )) : children}
    </div>
  );
}

export function SlideIn({ 
  children, 
  direction = "bottom",
  duration = 500,
  delay = 0,
  className 
}: {
  children: ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const directionClasses = {
    top: "slide-in-from-top-4",
    bottom: "slide-in-from-bottom-4",
    left: "slide-in-from-left-4",
    right: "slide-in-from-right-4"
  };

  return (
    <div
      className={cn(
        "animate-in fade-in",
        directionClasses[direction],
        className
      )}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
}
