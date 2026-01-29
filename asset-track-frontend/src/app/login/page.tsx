'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { login, getCurrentUser } from '@/lib/api';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageLoading } from "@/components/LoadingSpinner";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateAndRedirect = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        await getCurrentUser(token);
        router.push('/assets');
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsCheckingAuth(false);
      }
    };

    validateAndRedirect();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success("Anmeldung erfolgreich");
      router.push('/assets');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <PageLoading text="Authentifizierung wird überprüft..." />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>Gib deine Zugangsdaten ein, um auf dein Konto zuzugreifen</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="du@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Anmeldung läuft...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Noch kein Konto?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Hier registrieren
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
