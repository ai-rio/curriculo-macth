import { Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface CelebrationCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function CelebrationCallout({
  children,
  title = 'Celebration',
  className,
}: CelebrationCalloutProps) {
  return (
    <BaseCallout
      variant="celebration"
      title={title}
      className={className}
      icon={<Sparkles className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default CelebrationCallout;
