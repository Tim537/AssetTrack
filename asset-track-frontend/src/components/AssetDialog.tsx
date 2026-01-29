import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Asset } from "./AssetTable";
import { Plus, Trash2, Download, FileIcon, Loader2 } from "lucide-react";
import { getAssetAttachments, deleteAssetAttachment, getDownloadAttachmentUrl } from "@/lib/api";
import { toast } from "sonner";
import {
  ASSET_LIFECYCLES,
  ASSET_TYPES,
  formatLifecycle,
  formatType,
} from "@/lib/asset-labels";

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSubmit: (data: any, file?: File) => Promise<void>;
  onAttachmentChange?: () => void;
}


export function AssetDialog({
  open,
  onOpenChange,
  asset,
  onSubmit,
  onAttachmentChange,
}: AssetDialogProps) {
  const [name, setName] = useState("");
  const [lifecycle, setLifecycle] = useState<string>(ASSET_LIFECYCLES[0]);
  const [type, setType] = useState<string>(ASSET_TYPES[0]);
  const [attributes, setAttributes] = useState<{ id: string; key: string; value: string }[]>([]);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setLifecycle(asset.lifecycle);
      setType(asset.type);
      
      const attrs = asset.custom_attributes || {};
      const attrsArray = Object.entries(attrs).map(([key, value]) => ({
        id: Math.random().toString(36).substr(2, 9),
        key,
        value: String(value),
      }));
      setAttributes(attrsArray);

      const token = localStorage.getItem('token');
      if (token) {
        getAssetAttachments(asset.id, token)
          .then(setAttachments)
          .catch(err => console.error("Failed to load attachments", err));
      } else {
        setAttachments([]);
      }
    } else {
      setName("");
      setLifecycle(ASSET_LIFECYCLES[0]);
      setType(ASSET_TYPES[0]);
      setAttributes([]);
      setAttachments([]);
    }
    setFile(undefined);
  }, [asset, open]);

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm("Bist du sicher, dass du diesen Anhang löschen möchtest?")) return;
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await deleteAssetAttachment(attachmentId, token);
        setAttachments(attachments.filter(a => a.id !== attachmentId));
        toast.success("Anhang erfolgreich gelöscht");
        if (onAttachmentChange) onAttachmentChange();
    } catch (e) {
        toast.error("Anhang konnte nicht gelöscht werden");
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { id: Math.random().toString(36).substr(2, 9), key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: "key" | "value", newValue: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = newValue;
    setAttributes(newAttributes);
  };

  const [duplicateKeys, setDuplicateKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const keys = attributes.map(a => a.key.trim()).filter(k => k);
    const duplicates = keys.filter((item, index) => keys.indexOf(item) !== index);
    setDuplicateKeys(new Set(duplicates));
  }, [attributes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (duplicateKeys.size > 0) {
        alert(`Doppelte Schlüssel gefunden: ${Array.from(duplicateKeys).join(", ")}. Bitte korrigiere sie vor dem Speichern.`);
        return;
    }

    setIsLoading(true);
    try {
      const custom_attributes = attributes.reduce((acc, curr) => {
        const key = curr.key.trim();
        if (key) {
             acc[key] = curr.value;
        }
        return acc;
      }, {} as Record<string, string>);

      await onSubmit(
        {
          name,
          lifecycle,
          type,
          custom_attributes,
        },
        file
      );
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Asset konnte nicht gespeichert werden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? "Asset bearbeiten" : "Neues Asset"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Typ</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatType(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lifecycle">Lebenszyklus</Label>
            <Select value={lifecycle} onValueChange={setLifecycle}>
              <SelectTrigger>
                <SelectValue placeholder="Lebenszyklus auswählen" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_LIFECYCLES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {formatLifecycle(l)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Benutzerdefinierte Attribute</Label>
            <div className="space-y-2">
              {attributes.map((attr, index) => {
                const isDuplicate = duplicateKeys.has(attr.key.trim()) && attr.key.trim() !== "";
                return (
                <div key={attr.id} className="flex gap-2 relative">
                  <div className="flex-1">
                      <Input
                        placeholder="Schlüssel"
                        value={attr.key}
                        onChange={(e) => updateAttribute(index, "key", e.target.value)}
                        className={`${isDuplicate ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                  </div>
                  <Input
                    placeholder="Wert"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, "value", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttribute(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttribute}
              className="w-full mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Attribut hinzufügen
            </Button>
          </div>

          {asset && attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Vorhandene Anhänge</Label>
              <div className="space-y-2 border rounded-md p-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate" title={att.filename}>
                        {att.filename}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={getDownloadAttachmentUrl(att.id, localStorage.getItem('token') || "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                        title="Herunterladen"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAttachment(att.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="file">Anhang hinzufügen</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


