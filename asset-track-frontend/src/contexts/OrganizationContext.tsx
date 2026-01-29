'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAllOrganizations } from '@/lib/api';

export interface Organization {
  id: number;
  name: string;
  join_code: string;
  is_admin: boolean;
  created_at?: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  activeOrganization: Organization | null;
  setActiveOrganization: (org: Organization | null) => void;
  refreshOrganizations: () => Promise<void>;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const ACTIVE_ORG_KEY = 'activeOrganizationId';

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrganizations = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOrganizations([]);
      setActiveOrganizationState(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getAllOrganizations(token);
      const orgs = data.organizations || [];
      setOrganizations(orgs);

      const savedOrgId = localStorage.getItem(ACTIVE_ORG_KEY);
      const savedOrg = savedOrgId ? orgs.find((o: Organization) => o.id === parseInt(savedOrgId)) : null;
      
      if (savedOrg) {
        setActiveOrganizationState(savedOrg);
      } else if (orgs.length > 0) {
        setActiveOrganizationState(orgs[0]);
        localStorage.setItem(ACTIVE_ORG_KEY, orgs[0].id.toString());
      } else {
        setActiveOrganizationState(null);
        localStorage.removeItem(ACTIVE_ORG_KEY);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      setOrganizations([]);
      setActiveOrganizationState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setActiveOrganization = useCallback((org: Organization | null) => {
    setActiveOrganizationState(org);
    if (org) {
      localStorage.setItem(ACTIVE_ORG_KEY, org.id.toString());
    } else {
      localStorage.removeItem(ACTIVE_ORG_KEY);
    }
    window.dispatchEvent(new CustomEvent('activeOrganizationChanged', { detail: org }));
  }, []);

  useEffect(() => {
    refreshOrganizations();

    const handleOrgUpdate = () => {
      refreshOrganizations();
    };

    window.addEventListener('organizationUpdated', handleOrgUpdate);
    window.addEventListener('storage', handleOrgUpdate);

    return () => {
      window.removeEventListener('organizationUpdated', handleOrgUpdate);
      window.removeEventListener('storage', handleOrgUpdate);
    };
  }, [refreshOrganizations]);

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        setActiveOrganization,
        refreshOrganizations,
        isLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
