'use client';

import { useOrganization, Organization } from '@/contexts/OrganizationContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, ChevronDown, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const OrganizationSwitcher = () => {
  const { organizations, activeOrganization, setActiveOrganization, isLoading } = useOrganization();

  const handleValueChange = (value: string) => {
    if (value === 'manage') {
      return; // Link handles navigation
    }
    const org = organizations.find(o => o.id.toString() === value);
    if (org) {
      setActiveOrganization(org);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4 animate-pulse" />
        <span>Laden...</span>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <Link href="/organization">
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Organisation beitreten
        </Button>
      </Link>
    );
  }

  return (
    <Select
      value={activeOrganization?.id.toString() || ''}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-[200px] bg-background">
        <div className="flex items-center gap-2 truncate">
          <Building2 className="h-4 w-4 shrink-0" />
          <SelectValue placeholder="Organisation auswählen">
            {activeOrganization?.name || 'Organisation auswählen'}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id.toString()}>
            <div className="flex items-center gap-2">
              <span className="truncate">{org.name}</span>
              {org.is_admin && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                  Administrator
                </span>
              )}
            </div>
          </SelectItem>
        ))}
        <Separator className="my-1" />
        <Link href="/organization" className="block">
          <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Organisationen verwalten
          </div>
        </Link>
      </SelectContent>
    </Select>
  );
};

export default OrganizationSwitcher;
