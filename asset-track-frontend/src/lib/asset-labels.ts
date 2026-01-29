export const ASSET_LIFECYCLES = [
  "Specification",
  "Acquisition",
  "Development",
  "Release",
  "Deployment",
  "Operation",
  "Retirement",
] as const;

export const ASSET_TYPES = [
  "virtual IT Equipment",
  "Non-Executable Software",
  "Executable Software",
  "SourceCode",
  "Digital Information Content Assets",
  "ITAM Systems and Tools",
  "Metadata for IT Asset Management",
  "Physical Media",
  "Physical IT Equipment",
  "IT Asset Licenses",
  "IT Asset Contracts",
  "IT Asset Services",
  "Non-IT Assets",
] as const;

export const ASSET_LIFECYCLE_FILTER_VALUES = ["ALL", ...ASSET_LIFECYCLES] as const;
export const ASSET_TYPE_FILTER_VALUES = ["ALL", ...ASSET_TYPES] as const;

export const ASSET_LIFECYCLE_LABELS: Record<string, string> = {
  ALL: "Alle",
  Specification: "Spezifikation",
  Acquisition: "Beschaffung",
  Development: "Entwicklung",
  Release: "Freigabe",
  Deployment: "Bereitstellung",
  Operation: "Betrieb",
  Retirement: "Außerbetriebnahme",
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  ALL: "Alle",
  "virtual IT Equipment": "Virtuelle IT-Ausrüstung",
  "Non-Executable Software": "Nicht-ausführbare Software",
  "Executable Software": "Ausführbare Software",
  SourceCode: "Quellcode",
  "Digital Information Content Assets": "Digitale Informationsinhalte",
  "ITAM Systems and Tools": "ITAM-Systeme und Werkzeuge",
  "Metadata for IT Asset Management": "Metadaten für IT-Asset-Management",
  "Physical Media": "Physische Medien",
  "Physical IT Equipment": "Physische IT-Ausrüstung",
  "IT Asset Licenses": "IT-Asset-Lizenzen",
  "IT Asset Contracts": "IT-Asset-Verträge",
  "IT Asset Services": "IT-Asset-Dienste",
  "Non-IT Assets": "Nicht-IT-Assets",
};

export function formatLifecycle(value: string | null | undefined): string {
  if (!value) return "";
  return ASSET_LIFECYCLE_LABELS[value] ?? value;
}

export function formatType(value: string | null | undefined): string {
  if (!value) return "";
  return ASSET_TYPE_LABELS[value] ?? value;
}
