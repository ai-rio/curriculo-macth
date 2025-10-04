import { Target } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface ChallengeCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function ChallengeCallout({
  children,
  title = 'Challenge',
  className,
}: ChallengeCalloutProps) {
  return (
    <BaseCallout
      variant="challenge"
      title={title}
      className={className}
      icon={<Target className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default ChallengeCallout;
