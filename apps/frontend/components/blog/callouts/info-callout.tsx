import { Info } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface InfoCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function InfoCallout({ children, title = 'Information', className }: InfoCalloutProps) {
  return (
    <BaseCallout
      variant="info"
      title={title}
      className={className}
      icon={<Info className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default InfoCallout;
