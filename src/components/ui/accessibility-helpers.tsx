import { forwardRef, useId, ReactNode, HTMLAttributes, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

// Composant pour les éléments focusables avec gestion clavier
interface FocusableProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onActivate?: () => void;
  disabled?: boolean;
}

export const Focusable = forwardRef<HTMLDivElement, FocusableProps>(
  ({ children, onActivate, disabled, className, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate?.();
      }
      
      onKeyDown?.(e);
    };

    return (
      <div
        ref={ref}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onKeyDown={handleKeyDown}
        role="button"
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Composant pour les labels accessibles
interface AccessibleLabelProps {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function AccessibleLabel({ htmlFor, children, required, className }: AccessibleLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-gray-700 dark:text-gray-300', className)}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="champ requis">*</span>
      )}
    </label>
  );
}

// Composant pour les messages d'erreur accessibles
interface ErrorMessageProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export function ErrorMessage({ id, children, className }: ErrorMessageProps) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn('text-sm text-red-600 dark:text-red-400 mt-1', className)}
    >
      {children}
    </div>
  );
}

// Composant pour les descriptions d'aide
interface HelpTextProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export function HelpText({ id, children, className }: HelpTextProps) {
  return (
    <div
      id={id}
      className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}
    >
      {children}
    </div>
  );
}

// Hook pour générer des IDs accessibles
export function useAccessibleIds(prefix: string = 'field') {
  const baseId = useId();
  
  return {
    fieldId: `${prefix}-${baseId}`,
    labelId: `${prefix}-label-${baseId}`,
    errorId: `${prefix}-error-${baseId}`,
    helpId: `${prefix}-help-${baseId}`,
  };
}

// Composant pour les régions avec des landmarks
interface LandmarkRegionProps extends HTMLAttributes<HTMLElement> {
  as?: 'main' | 'nav' | 'aside' | 'section' | 'article' | 'header' | 'footer';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
}

export function LandmarkRegion({ 
  as: Component = 'section', 
  ariaLabel, 
  ariaLabelledBy, 
  children, 
  className,
  ...props 
}: LandmarkRegionProps) {
  return (
    <Component
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      {...props}
    >
      {children}
    </Component>
  );
}

// Composant pour annoncer les changements d'état
interface LiveAnnouncementProps {
  children: ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export function LiveAnnouncement({ 
  children, 
  priority = 'polite', 
  atomic = false 
}: LiveAnnouncementProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

// Composant pour skip links
interface SkipLinkProps {
  href: string;
  children: ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

// Hook pour gérer le focus trap
export function useFocusTrap(isActive: boolean) {
  const focusableElementsSelector = 
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = (e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab') return;

    const focusableElements = document.querySelectorAll(focusableElementsSelector);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  return { trapFocus };
}

// Composant pour les groupes de contrôles
interface FieldGroupProps {
  legend: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

export function FieldGroup({ legend, children, className, required }: FieldGroupProps) {
  return (
    <fieldset className={cn('space-y-4', className)}>
      <legend className="text-base font-medium text-gray-900 dark:text-gray-100">
        {legend}
        {required && (
          <span className="text-red-500 ml-1" aria-label="groupe requis">*</span>
        )}
      </legend>
      {children}
    </fieldset>
  );
}
