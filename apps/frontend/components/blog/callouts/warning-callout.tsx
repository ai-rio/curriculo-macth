import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface WarningCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function WarningCallout({ children, title = 'Warning', className }: WarningCalloutProps) {
  return (
    <BaseCallout
      variant="warning"
      title={title}
      className={className}
      icon={<AlertTriangle className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default WarningCallout;
