'use client';

import { ReactNode } from 'react';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  );
};

export default Providers;
