'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const { refreshOrganizations } = useOrganization();

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
        window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeOrganizationId');
    setUser(null);
    router.push('/login');
  };

  if (!mounted) return null;

  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  if (!user) return null;

  return (
    <nav className="border-b bg-card text-card-foreground shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-6">
            <Link href="/assets" className="text-xl font-bold tracking-tight">
              AssetTrack
            </Link>
            <div className="hidden md:block">
              <OrganizationSwitcher />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
