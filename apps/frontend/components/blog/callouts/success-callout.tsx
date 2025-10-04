import { CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface SuccessCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function SuccessCallout({ children, title = 'Success', className }: SuccessCalloutProps) {
  return (
    <BaseCallout
      variant="success"
      title={title}
      className={className}
      icon={<CheckCircle className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default SuccessCallout;
