"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  createOrganization, 
  joinOrganization, 
  getOrganizationById, 
  kickMemberFromOrg, 
  leaveOrganization,
  getAllOrganizations 
} from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Building2, Users, LogOut, UserMinus, Plus, ChevronRight } from "lucide-react";
import { useOrganization, Organization } from "@/contexts/OrganizationContext";
import { Separator } from "@/components/ui/separator";

interface Member {
  id: number;
  name: string;
  email: string;
  is_org_admin: boolean;
}

interface OrganizationDetails extends Organization {
  members?: Member[];
}

export default function OrganizationPage() {
  const router = useRouter();
  const { organizations, activeOrganization, setActiveOrganization, refreshOrganizations, isLoading: contextLoading } = useOrganization();
  
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [orgName, setOrgName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [kickingMemberId, setKickingMemberId] = useState<number | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const joinModalRef = useRef<HTMLDivElement>(null);
  const createModalRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || '{}') : {};

  const fetchOrgDetails = async (orgId: number) => {
    if (!token) return;
    setLoadingDetails(true);
    try {
      const data = await getOrganizationById(orgId, token);
      setSelectedOrg(data.organization);
    } catch (err: any) {
      console.error(err);
      toast.error("Organisationsdetails konnten nicht geladen werden");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
  }, [token, router]);

  useEffect(() => {
    if (activeOrganization) {
      fetchOrgDetails(activeOrganization.id);
    } else {
      setSelectedOrg(null);
    }
  }, [activeOrganization]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) return;

    setIsCreating(true);
    try {
      const result = await createOrganization(orgName, token);
      toast.success("Organisation erfolgreich erstellt");
      await refreshOrganizations();
      setOrgName("");
      setShowCreateForm(false);
      if (result.organization) {
        setActiveOrganization({
          ...result.organization,
          is_admin: true
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent, modalRef: React.RefObject<HTMLDivElement | null>, closeFunc: () => void) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeFunc();
      setError("");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) return;

    setIsJoining(true);
    try {
      await joinOrganization(joinCode, token);
      toast.success("Organisation erfolgreich beigetreten");
      await refreshOrganizations();
      setJoinCode("");
      setShowJoinForm(false);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleKick = async (memberId: number) => {
    if (!token || !selectedOrg) return;
    setKickingMemberId(memberId);
    try {
      await kickMemberFromOrg(selectedOrg.id, memberId, token);
      toast.success("Mitglied erfolgreich entfernt");
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setKickingMemberId(null);
    }
  };

  const handleLeave = async (orgId: number) => {
    if (!token) return;
    if (!confirm("Bist du sicher, dass du diese Organisation verlassen möchtest?")) return;
    
    setIsLeaving(true);
    try {
      await leaveOrganization(token, orgId);
      toast.success("Organisation erfolgreich verlassen");
      await refreshOrganizations();
      setSelectedOrg(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleSelectOrg = (org: Organization) => {
    setActiveOrganization(org);
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Organisationen werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Organisationen</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateForm(true)} variant="secondary" className="gap-2">
              <Plus className="h-4 w-4" />
              Erstellen
            </Button>
            <Button onClick={() => setShowJoinForm(true)} className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="h-4 w-4" />
              Beitreten
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Meine Organisationen</CardTitle>
                <CardDescription>
                  {organizations.length === 0 
                    ? "Du bist noch kein Mitglied einer Organisation"
                    : `${organizations.length} Organisation${organizations.length !== 1 ? 'en' : ''}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrg(org)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                      activeOrganization?.id === org.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{org.name}</p>
                        {org.is_admin && (
                          <span className="text-xs text-primary">Administrator</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}

                {organizations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Erstelle oder tritt einer Organisation bei, um loszulegen
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {loadingDetails ? (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </Card>
            ) : selectedOrg ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedOrg.name}</CardTitle>
                  <CardDescription>
                    {selectedOrg.members?.length || 0} Mitglied{(selectedOrg.members?.length || 0) !== 1 ? 'er' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedOrg.is_admin && (
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-muted-foreground">Beitrittscode</Label>
                      <div className="text-2xl font-mono tracking-widest font-bold mt-1">
                        {selectedOrg.join_code}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Teile diesen Code mit anderen, damit sie beitreten können
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Mitglieder</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedOrg.members?.map(member => (
                        <div 
                          key={member.id} 
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {member.name}
                              {member.id === currentUser.id && (
                                <span className="text-xs text-muted-foreground">(Du)</span>
                              )}
                              {member.is_org_admin && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  Administrator
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                          {selectedOrg.is_admin && member.id !== currentUser.id && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleKick(member.id)}
                              disabled={kickingMemberId === member.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {kickingMemberId === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  Entfernen
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Button 
                    variant="outline" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleLeave(selectedOrg.id)}
                    disabled={isLeaving}
                  >
                    {isLeaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verlasse...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Organisation verlassen
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Wähle eine Organisation aus, um Details anzuzeigen</p>
                  <p className="text-sm mt-1">oder erstelle/tritt einer bei, um loszulegen</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {showJoinForm && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => handleBackdropClick(e, joinModalRef, () => {
              setShowJoinForm(false);
              setJoinCode("");
            })}
          >
            <Card ref={joinModalRef} className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Organisation beitreten</CardTitle>
                <CardDescription>
                  Gib den Beitrittscode ein, um Mitglied zu werden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinCode">Beitrittscode</Label>
                    <Input
                      id="joinCode"
                      placeholder="z.B. ABC123"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      required
                      disabled={isJoining}
                      className="text-center text-lg tracking-widest font-mono"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowJoinForm(false);
                        setJoinCode("");
                        setError("");
                      }}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isJoining}>
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Beitritt läuft...
                        </>
                      ) : (
                        'Beitreten'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {showCreateForm && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => handleBackdropClick(e, createModalRef, () => {
              setShowCreateForm(false);
              setOrgName("");
            })}
          >
            <Card ref={createModalRef} className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Organisation erstellen</CardTitle>
                <CardDescription>
                  Erstelle eine neue Organisation und werde ihr Administrator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organisationsname</Label>
                    <Input
                      id="orgName"
                      placeholder="Meine Firma"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                      disabled={isCreating}
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowCreateForm(false);
                        setOrgName("");
                        setError("");
                      }}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Erstelle...
                        </>
                      ) : (
                        'Erstellen'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
