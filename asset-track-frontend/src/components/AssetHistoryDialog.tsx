import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { getAssetHistory } from "@/lib/api";
import { Loader2, Circle, CheckCircle2, AlertCircle, Trash2, FileUp, FileX2, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AssetHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: number | null;
  assetName: string;
}

interface AssetLog {
  logId: number;
  userId: number;
  userName: string;
  assetId: number;
  action: string;
  requestJSON: string | null;
  timestamp: string;
}

const HistoryItem = ({ log, isLast }: { log: AssetLog; isLast: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case "UPDATE":
        return <Edit className="h-5 w-5 text-primary" />;
      case "DELETE":
        return <Trash2 className="h-5 w-5 text-destructive" />;
      case "UPLOAD_ATTACHMENT":
        return <FileUp className="h-5 w-5 text-primary" />;
      case "DELETE_ATTACHMENT":
        return <FileX2 className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: string) => {
      switch (action) {
        case "CREATE": return "Asset erstellt";
        case "UPDATE": return "Asset aktualisiert";
        case "DELETE": return "Asset gelöscht";
        case "UPLOAD_ATTACHMENT": return "Anhang hochgeladen";
        case "DELETE_ATTACHMENT": return "Anhang gelöscht";
        default: return action;
      }
  }

  const renderDetails = (jsonString: string | null) => {
      if (!jsonString) return null;
      try {
          const data = JSON.parse(jsonString);
          if (data.message) {
              return <p className="text-sm text-muted-foreground italic">{data.message}</p>
          }

          return (
              <div className="flex flex-col gap-1 mt-1">
                  {Object.entries(data).map(([key, value]) => {
                      if (key === 'custom_attributes' && typeof value === 'object') {
                          return (
                              <div key={key} className="text-sm">
                                  <span className="font-bold text-foreground block">Benutzerdefinierte Attribute:</span>
                                  <div className="ml-2 pl-3 border-l-2 border-border space-y-1 mt-1">
                                      {Object.entries(value as object).map(([k, v]) => (
                                          <div key={k} className="flex gap-2">
                                            <span className="font-semibold text-muted-foreground shrink-0">{k}:</span> 
                                            <span className="text-foreground break-all">{String(v)}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )
                      }
                      if (['id', 'organization_id'].includes(key)) return null;

                      return (
                          <div key={key} className="text-sm flex gap-2">
                              <span className="font-bold text-muted-foreground capitalize shrink-0">{key.replace('_', ' ')}:</span> 
                              <span className="text-foreground break-all">{String(value)}</span>
                          </div>
                      )
                  })}
              </div>
          )
      } catch (e) {
          return <p className="text-sm text-muted-foreground">{jsonString}</p>;
      }
  }

  return (
    <div className="flex gap-4 group relative pb-6">
        {!isLast && (
             <div className="absolute left-[14px] top-8 bottom-0 w-0.5 bg-border -z-10" />
        )}

        <div className="relative flex-none mt-1">
            <div className="bg-card p-1 rounded-full border border-border shadow-sm transition-shadow z-10 relative">
                {getActionIcon(log.action)}
            </div>
        </div>

        <Card className="flex-1 border-border bg-card shadow-sm transition-all hover:border-primary/50 p-0 gap-0">
            <CardHeader 
                className="py-3 px-4 bg-muted/30 hover:bg-muted/50 rounded-t-lg cursor-pointer transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                            {getActionLabel(log.action)}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">
                            von <span className="font-bold text-foreground">{log.userName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <time className="text-xs text-muted-foreground font-medium whitespace-nowrap" dateTime={log.timestamp}>
                            {new Date(log.timestamp).toLocaleString()}
                        </time>
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                </div>
            </CardHeader>
            {isOpen && (
                <>
                    <Separator className="bg-border" />
                    <CardContent className="p-3 bg-card rounded-b-lg animate-in fade-in zoom-in-95 duration-200">
                        {renderDetails(log.requestJSON)}
                    </CardContent>
                </>
            )}
        </Card>
    </div>
  );
};

export function AssetHistoryDialog({
  open,
  onOpenChange,
  assetId,
  assetName,
}: AssetHistoryDialogProps) {
  const [history, setHistory] = useState<AssetLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && assetId) {
      fetchHistory(assetId);
    }
  }, [open, assetId]);

  const fetchHistory = async (id: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const data = await getAssetHistory(id, token);
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Verlauf für {assetName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden mt-4 pr-2">
            {loading ? (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
            ) : (
            <ScrollArea className="h-[60vh] pr-4">
                {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Kein Verlauf gefunden.</div>
                ) : (
                    <div className="ml-2">
                        {history.map((log, index) => (
                            <HistoryItem 
                                key={log.logId} 
                                log={log} 
                                isLast={index === history.length - 1}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
