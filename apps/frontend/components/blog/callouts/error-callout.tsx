import { XCircle } from 'lucide-react';
import { ReactNode } from 'react';

import { BaseCallout } from './callout';

interface ErrorCalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function ErrorCallout({ children, title = 'Error', className }: ErrorCalloutProps) {
  return (
    <BaseCallout
      variant="error"
      title={title}
      className={className}
      icon={<XCircle className="w-full h-full" />}
    >
      {children}
    </BaseCallout>
  );
}

export default ErrorCallout;
