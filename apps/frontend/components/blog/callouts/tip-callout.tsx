import { Lightbulb } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface TipCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function TipCallout({ children, title = 'Pro Tip', className }: TipCalloutProps) {
  return (
    <BaseCallout
      variant="tip"
      title={title}
      className={className}
      icon={<Lightbulb className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default TipCallout;
