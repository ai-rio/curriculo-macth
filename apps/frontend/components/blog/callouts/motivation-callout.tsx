import { Heart } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface MotivationCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function MotivationCallout({
  children,
  title = 'Motivation',
  className,
}: MotivationCalloutProps) {
  return (
    <BaseCallout
      variant="motivation"
      title={title}
      className={className}
      icon={<Heart className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default MotivationCallout;
