import { Compass } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface QuestCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function QuestCallout({ children, title = 'Quest', className }: QuestCalloutProps) {
  return (
    <BaseCallout
      variant="quest"
      title={title}
      className={className}
      icon={<Compass className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default QuestCallout;
