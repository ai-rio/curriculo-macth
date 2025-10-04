import { Trophy } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface RewardCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function RewardCallout({ children, title = 'Reward', className }: RewardCalloutProps) {
  return (
    <BaseCallout
      variant="reward"
      title={title}
      className={className}
      icon={<Trophy className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default RewardCallout;
