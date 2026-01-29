import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileIcon, Pencil, Trash2, History } from "lucide-react";

export interface Asset {
  id: number;
  name: string;
  lifecycle: string;
  type: string;
  download_url?: string;
  attachment_count?: number;
  custom_attributes: Record<string, any>;
  organization_id: number;
}

interface AssetTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: number) => void;
  onHistory: (asset: Asset) => void;
}

const API_URL = "http://localhost:5000";

export function AssetTable({ assets, onEdit, onDelete, onHistory }: AssetTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Lebenszyklus</TableHead>
          <TableHead>Attribute</TableHead>
          <TableHead>Anhänge</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24">
              Keine Assets gefunden.
            </TableCell>
          </TableRow>
        ) : (
          assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell>{asset.type}</TableCell>
              <TableCell>{asset.lifecycle}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(asset.custom_attributes || {}).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {asset.attachment_count && asset.attachment_count > 0 ? (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal flex items-center gap-2"
                    onClick={() => onEdit(asset)}
                  >
                    <FileIcon className="w-4 h-4" />
                    {asset.attachment_count} {asset.attachment_count === 1 ? 'Datei' : 'Dateien'}
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onHistory(asset)}
                  title="Verlauf"
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(asset)}
                  title="Bearbeiten"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onDelete(asset.id)}
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}





