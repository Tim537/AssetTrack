import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        router.push('/login');
        return;
      }

      if (userDataStr) {
        setUser(JSON.parse(userDataStr));
      }

      try {
        const freshUser = await getCurrentUser(token);
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch (error) {
        console.error("Auth validation failed", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const handleOrgUpdate = () => {
        setLoading(true);
        checkAuth();
    };

    window.addEventListener('organizationUpdated', handleOrgUpdate);
    
    return () => {
        window.removeEventListener('organizationUpdated', handleOrgUpdate);
    };

  }, [router]);

  return { user, loading };
}
