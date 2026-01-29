'use client';

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { AssetTable, Asset } from "@/components/AssetTable";
import { AssetDialog } from "@/components/AssetDialog";
import { AssetHistoryDialog } from "@/components/AssetHistoryDialog";
import { getAssets, createAsset, updateAsset, deleteAsset, uploadAssetFile } from "@/lib/api";
import { Plus, Loader2, RefreshCw, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  ASSET_LIFECYCLE_FILTER_VALUES,
  ASSET_TYPE_FILTER_VALUES,
  formatLifecycle,
  formatType,
} from "@/lib/asset-labels";

export default function AssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);

  const [filterLifecycle, setFilterLifecycle] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");

  const fetchAssets = useCallback(async () => {
    if (!activeOrganization) {
      setAssets([]);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const data = await getAssets(activeOrganization.id, token, {
          lifecycle: filterLifecycle,
          type: filterType
      });
      setAssets(data);
    } catch (error) {
      console.error("Failed to fetch assets", error);
      toast.error("Assets konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [activeOrganization, filterLifecycle, filterType]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    const handleOrgChange = () => {
      fetchAssets();
    };
    window.addEventListener('activeOrganizationChanged', handleOrgChange);
    return () => {
      window.removeEventListener('activeOrganizationChanged', handleOrgChange);
    };
  }, [fetchAssets]);

  const handleCreateOrUpdate = async (data: any, file?: File) => {
    if (!activeOrganization) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      let savedAsset;
      if (selectedAsset) {
        savedAsset = await updateAsset(selectedAsset.id, data, token);
        toast.success("Asset erfolgreich aktualisiert");
      } else {
        savedAsset = await createAsset(activeOrganization.id, data, token);
        toast.success("Asset erfolgreich erstellt");
      }

      if (file && savedAsset) {
        await uploadAssetFile(savedAsset.id, file, token);
        toast.success("Datei erfolgreich hochgeladen");
      }

      await fetchAssets();
    } catch (error) {
        console.error("Operation failed", error);
        throw error;
    }
  };

  const handleDelete = async (assetId: number) => {
      if (!confirm("Bist du sicher, dass du dieses Asset löschen möchtest?")) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
          await deleteAsset(assetId, token);
          toast.success("Asset erfolgreich gelöscht");
          await fetchAssets();
      } catch (error) {
          console.error("Failed to delete", error);
          toast.error("Asset konnte nicht gelöscht werden");
      }
  };

  const openNewAssetDialog = () => {
      setSelectedAsset(null);
      setDialogOpen(true);
  };

  const openEditAssetDialog = (asset: Asset) => {
      setSelectedAsset(asset);
      setDialogOpen(true);
  };

  const openHistoryDialog = (asset: Asset) => {
      setHistoryAsset(asset);
      setHistoryOpen(true);
  };

  if (authLoading || orgLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Laden...</p>
          </div>
        </div>
      );
  }

  if (!user) {
      return null;
  }

  if (!activeOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Keine Organisation ausgewählt</h2>
          <p className="text-muted-foreground mb-4">
            Bitte tritt einer Organisation bei oder erstelle eine, um Assets anzuzeigen
          </p>
          <Link href="/organization">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Organisationen verwalten
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          </div>
          <Button onClick={openNewAssetDialog}>
            <Plus className="mr-2 h-4 w-4" /> Neues Asset
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
             <div className="grid gap-2 w-full md:w-[200px]">
                <label className="text-sm font-medium">Lebenszyklus</label>
                <Select value={filterLifecycle} onValueChange={setFilterLifecycle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nach Lebenszyklus filtern" />
                  </SelectTrigger>
                  <SelectContent>
                     {ASSET_LIFECYCLE_FILTER_VALUES.map((l) => (
                       <SelectItem key={l} value={l}>
                         {formatLifecycle(l)}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
             </div>

             <div className="grid gap-2 w-full md:w-[250px]">
                <label className="text-sm font-medium">Typ</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nach Typ filtern" />
                  </SelectTrigger>
                  <SelectContent>
                     {ASSET_TYPE_FILTER_VALUES.map((t) => (
                       <SelectItem key={t} value={t}>
                         {formatType(t)}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
             </div>
             
             <Button variant="outline" size="icon" onClick={fetchAssets} title="Aktualisieren">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
             </Button>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
            <AssetTable 
                assets={assets} 
                onEdit={openEditAssetDialog} 
                onDelete={handleDelete} 
                onHistory={openHistoryDialog}
            />
        </div>

        <AssetDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen} 
            asset={selectedAsset}
            onSubmit={handleCreateOrUpdate}
            onAttachmentChange={fetchAssets}
        />

        <AssetHistoryDialog
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            assetId={historyAsset?.id || null}
            assetName={historyAsset?.name || ''}
        />
      </div>
    </div>
  );
}
