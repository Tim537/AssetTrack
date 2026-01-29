'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export const LoadingSpinner = ({
  size = 'md',
  text,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
};

export const PageLoading = ({ text = 'Laden...' }: { text?: string }) => (
  <LoadingSpinner fullScreen size="lg" text={text} />
);

export const SectionLoading = ({ text }: { text?: string }) => (
  <div className="flex justify-center p-8">
    <LoadingSpinner size="md" text={text} />
  </div>
);

export const ButtonLoading = () => (
  <LoadingSpinner size="sm" />
);

export default LoadingSpinner;
