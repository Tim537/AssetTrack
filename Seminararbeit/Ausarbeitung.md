# AssetTrack – Webbasierte Anwendung zum IT-Asset-Management

**Seminar Internet-Technologien in der Praxis / Webframeworks**

---

## 1 Einführung

Webframeworks bilden heute einen zentralen Grundpfeiler der Anwendungsentwicklung. Insbesondere im Unternehmensumfeld wird erwartet, dass Anwendungen über den Browser oder mobile Endgeräte nutzbar sind. Im Rahmen des Seminars „Internet-Technologien in der Praxis – Webframeworks“ wurde eine beispielhafte Web-Applikation entwickelt. Das gewählte Thema ist das **Management von IT-Assets** (Hardware, Software, Lizenzen, Verträge und weitere IT-relevante Güter).

Unter **IT-Asset-Management (ITAM)** wird die systematische Verwaltung von IT-Assets über deren gesamten Lebenszyklus verstanden. Ziel ist es, Assets zu dokumentieren, bereitzustellen, zu warten und schließlich stillzulegen, um Gesamtbetriebskosten nachzuvollziehen und die Nutzung zu optimieren. ITAM schafft eine „Single Source of Truth“, die für Planung, Kostenkontrolle und Compliance unerlässlich ist [1]. **IT-Assets** umfassen Hardware, Softwaresysteme und Informationen mit Wert für ein Unternehmen – etwa Computer, Peripheriegeräte, Softwarelizenzen und Server. Da sie eine begrenzte Nutzungsdauer haben, wird der Lebenszyklus typischerweise in Phasen unterteilt: Anforderung, Beschaffung, Implementierung, Wartung und Stilllegung [1, 2].

Ziel dieser Arbeit ist die Vorstellung der entwickelten Anwendung **AssetTrack**: eine webbasierte Lösung zum Erfassen und Verwalten von IT-Assets in Organisationen. Es werden die Anforderungen (abgeleitet aus einer Marktanalyse), die Architektur, die technische Implementierung sowie die Einordnung in den Stand der Technik beschrieben. Den Abschluss bildet ein Fazit mit Ausblick auf mögliche Erweiterungen.

Die Arbeit gliedert sich wie folgt: Nach der Einführung wird der **Stand der Technik** dargestellt – bestehende webbasierte und SaaS-Lösungen im IT-Asset-Management sowie die daraus abgeleiteten Anforderungen für AssetTrack. Anschließend folgt die **Beschreibung der Architektur und Implementierung** (Backend, Frontend, Deployment). Das **Fazit und Ausblick** fasst die Ergebnisse zusammen und skizziert Erweiterungsmöglichkeiten.

---

## 2 Stand der Technik

Für die Entwicklung einer webbasierten IT-Asset-Management-Anwendung sind insbesondere Lösungen relevant, die in der Cloud bzw. webbasiert laufen und als Software as a Service (SaaS) angeboten werden. Im Folgenden werden typische Funktionen von ITAM-Tools eingeordnet, eine Auswahl bestehender Produkte vorgestellt und die für AssetTrack gesetzten Schwerpunkte begründet.

### 2.1 Einordnung und typische Funktionen

ITAM-Tools unterstützen Organisationen dabei zu erfassen, *was* an IT-Assets vorhanden ist, und ermöglichen fundierte Entscheidungen zu Beschaffung, Wartung und Stilllegung. Davon abzugrenzen ist das Service-Configuration-Management (SCM), das den *Kontext* und die Beziehungen zwischen Systemen beschreibt [3]. Der IT-Betrieb wiederum stellt IT-Services bereit und optimiert die Systemleistung; ITAM fokussiert sich auf Prozesse für das Management komplexer Assetbestände [2].

Typische Funktionen am Markt umfassen: **Benutzerverwaltung und Zugriff** (Login, SSO, rollenbasierte Rechte), **Asset Tracking** (Inventarisierung, Suche, Filter), **Custom Attributes** (erweiterbare Attribute pro Asset), **History Tracking** (Änderungsverlauf), **Attachments** (Dateianhänge), **Lifecycle-Tracking** (Phasen von der Beschaffung bis zur Ausmusterung), **Contract-/License-Management** sowie teils **Multi-Tenancy**, **Auto-Discovery** und **Visualisierung von Asset-Beziehungen**.

### 2.2 Marktanalyse bestehender Produkte

Zur Orientierung wurden zwölf webbasierte bzw. SaaS-fähige IT-Asset-Management-Produkte verglichen: Asset Panda, Asset Tiger, BMC Helix, Device42, Freshservice, InvGate, Ivanti Neurons, Lansweeper, ManageEngine Asset Explorer (MEAE), Setyl, Snipe-IT und SolarWinds.

**Benutzer und Zugriff:** Alle betrachteten Produkte bieten einen Benutzer-Login. Einige ergänzen SSO, Collaborators (nur Lese-Zugriff), Custom User Permissions oder Account-Management. Für eine seminarbezogene Anwendung genügen Registrierung und Login mit rollenähnlicher Zuordnung zu Organisationen.

**Plattform-Features:** *Asset Tracking* ist durchgängig vorhanden. *Custom Attributes* bieten unter anderem Asset Panda, Lansweeper, MEAE, Setyl und Snipe-IT. *History Tracking* ist vergleichsweise seltener explizit (z. B. Asset Panda, Snipe-IT). *Attachments* finden sich bei mehreren Anbietern (u. a. Asset Panda, Asset Tiger, Ivanti Neurons). *Lifecycle-Tracking* bieten u. a. BMC Helix, Freshservice, InvGate, Ivanti Neurons, Lansweeper, MEAE, Setyl und Snipe-IT. *Contract-/License-Management* ist bei vielen vertreten (Asset Tiger, BMC Helix, Device42, Freshservice, Ivanti Neurons, MEAE, Setyl, Snipe-IT, SolarWinds). *Track/Visualize Asset Relations* wird beispielsweise von Device42 und Freshservice angeboten. Multi-Tenancy ist in mehreren Lösungen vorhanden, wurde für AssetTrack jedoch bewusst nicht umgesetzt, um den Umfang auf organisationsbezogene Mehrbenutzer-Nutzung zu beschränken.

Zusätzlich bieten manche Anbieter Automations, Custom Reporting, Dashboards, Barcode-Generierung, Auto-Discovery oder IT-Security-Compliance. Mobile Apps und KI-Features (z. B. Sprachübersetzung, AI Agents) richten sich stärker an den Betrieb und wurden für die Anforderungsableitung nicht vertieft.

### 2.3 Ableitung der Anforderungen für AssetTrack

Aus der Marktanalyse und dem Seminarkontext wurden folgende Schwerpunkte für AssetTrack abgeleitet:

- **Login und Registrierung:** Sichere Anmeldung (E-Mail/Passwort) und Registrierung mit JWT-basierter Authentifizierung.
- **Organisationen:** Benutzer können Organisationen erstellen oder per Beitrittscode beitreten; Organisationsverwaltung inkl. Mitgliederliste und Entfernen von Mitgliedern durch den Gründer.
- **Asset Tracking:** Erfassung, Anzeige, Bearbeitung und Löschung von Assets mit Filterung nach Lifecycle und Typ; Custom Attributes als flexible Zusatzfelder (JSON).
- **History Tracking:** Bei Erstellung und jeder Änderung eines Assets wird ein Log erzeugt; Anzeige der Historie pro Asset.
- **Attachments:** Pro Asset können Dateianhänge hochgeladen und heruntergeladen werden.
- **Lifecycle-Tracking:** Jedes Asset hat ein Lifecycle-Feld (z. B. Specification, Acquisition, Development, Release, Deployment, Operation, Retirement) und einen Typ (z. B. Physical IT Equipment, Software, Licenses).

Contract-/License-Management, Visualisierung von Asset-Beziehungen und Multi-Tenancy wurden als Erweiterungen für einen späteren Ausblick eingeordnet. Die beschriebenen Anforderungen bilden die Grundlage für die Architektur und Implementierung in den folgenden Abschnitten.

---

## 3 Beschreibung der Architektur und Implementierung

AssetTrack besteht aus einem **Frontend** (Next.js/React) und einem **Backend** (Flask), die getrennt laufen und über eine REST-API kommunizieren. AssetTrack ist als Docker-Stack installier- und startbar.

### 3.1 Technologie- und Architekturübersicht

**Frontend:** Es wurde **Next.js** (auf Basis von React) mit **TypeScript** eingesetzt. Für das Styling kommen **Tailwind CSS** und **Radix UI** (Komponenten für Dialoge, Formulare, Buttons etc.) zum Einsatz. Next.js erfüllt die Seminarvorgabe „React“; Tailwind und Radix ersetzen Bootstrap und ermöglichen eine konsistente, zugängliche Oberfläche.

**Backend:** Das Backend wurde mit **Flask** (Python) umgesetzt. Für die Persistenz wird **SQLAlchemy** mit **SQLite** genutzt; die Authentifizierung erfolgt per **JWT** (JSON Web Token). **Flask-CORS** erlaubt Anfragen vom konfigurierbaren Frontend-Origin.

**Deployment:** Beide Teile laufen in getrennten **Docker-Containern**. Ein gemeinsamer Start erfolgt über `docker-compose up --build`. Das Frontend ist unter Port 3000, die API unter Port 5000 erreichbar. Die SQLite-Datenbank des Backends wird über ein Volume (`instance`) persistent gespeichert.

Die Architektur ist zweistufig: Der Browser spricht mit dem Next.js-Server (bzw. bei Entwicklung mit dem Next.js Dev-Server), der seinerseits die Flask-API aufruft. Die API antwortet mit JSON; Datei-Uploads und -Downloads werden über dedizierte Endpunkte abgewickelt.

### 3.2 Backend

**Struktur:** Die Flask-App ist in **Blueprints** gegliedert. Der Auth-Blueprint ist unter dem Präfix `/api` registriert und bietet `/api/register`, `/api/login` und `/api/me`. Der Organization-Blueprint liegt unter `/api/organization` (z. B. `/api/organization/create`, `/api/organization/join`, `/api/organization/<org_id>`). Der Asset-Blueprint ist unter `/api` eingehängt und stellt Routen wie `/api/organization/<org_id>/assets` und `/api/assets/<asset_id>/...` bereit. JWT wird im Header oder per Query-Parameter übergeben; geschützte Routen prüfen die Identität und die Zugehörigkeit des Nutzers zu einer Organisation.

**Datenmodell:** Zentrale Entitäten sind:

- **User:** E-Mail, Name, Passwort-Hash; ein User kann mehreren Organisationen über **OrganizationMember** angehören (Mitgliedschaft mit `is_admin`).
- **Organization:** Name und ein eindeutiger sechsstelliger **join_code** zum Beitritt.
- **Asset:** name, lifecycle, type, download_url, custom_attributes (JSON-Text), organization_id; Zeitstempel created_at, updated_at. Jedes Asset gehört genau einer Organisation.
- **AssetAttachment:** Zuordnung zu einem Asset, Dateiname, Binärdaten (LargeBinary), uploaded_at. Attachments werden in der Datenbank gespeichert.
- **AssetLog:** userId, assetId, action, requestJSON, timestamp – für die Historie bei Erstellung, Änderung und Löschung von Assets.
- **AuditLog:** Allgemeines Log für andere Aktionen (user_id, action, resource_type, resource_id, details, timestamp).

Zugriffslogik: Ein Nutzer sieht nur Assets der Organisationen, in denen er Mitglied ist. Vor jedem Lese-/Schreibzugriff auf eine Organisation oder ein Asset wird die Berechtigung geprüft (check_org_access bzw. check_asset_access).

**Wichtige fachliche Features:** Registrierung erstellt einen User und liefert ein JWT; Login validiert E-Mail/Passwort und gibt ein Token aus. Organisationen werden mit `/api/organization/create` angelegt (Name, automatischer join_code); Beitritt erfolgt über `/api/organization/join` mit join_code. Assets werden pro Organisation mit GET (optional Filter `lifecycle`, `type`), POST (Anlage), GET by ID, PATCH (Update) und DELETE verwaltet. Bei POST/PATCH/DELETE wird jeweils ein AssetLog-Eintrag erzeugt. Attachments: Upload über einen Endpunkt pro Asset (Datei wird in AssetAttachment gespeichert), Download über Endpunkt mit Attachment-ID oder über Asset-ID und Dateiname. Die History eines Assets wird über `/api/assets/<asset_id>/history` als Liste von AssetLog-Einträgen geliefert.

### 3.3 Frontend

**Struktur:** Das Frontend nutzt den **Next.js App Router**. Relevante Routen: Startseite (`/`), `/login`, `/register`, `/assets` (Asset-Übersicht und -bearbeitung), `/organization` (Organisationsübersicht, Mitglieder, ggf. Erstellen/Beitreten). Die API-Basis-URL wird über die Umgebungsvariable `NEXT_PUBLIC_API_URL` konfiguriert (z. B. `http://localhost:5000/api` für lokale Entwicklung).

**Funktionen:** Auf der Startseite erfolgt die Navigation zu Login oder Registrierung. Nach Login/Registrierung kann der Nutzer eine Organisation erstellen oder per Code beitreten. Die Seite `/assets` zeigt eine Tabelle aller Assets der aktuellen Organisation mit Filteroptionen (Lifecycle, Typ). Über Buttons können neue Assets angelegt oder bestehende in einem Dialog bearbeitet werden; Custom Attributes werden im Editor berücksichtigt. Pro Asset sind die Tabs „Details“, „History“ und „Attachments“ verfügbar: Die History listet die AssetLog-Einträge; bei Attachments können Dateien hochgeladen und heruntergeladen werden. Die Organisationsseite listet Mitglieder; der Organisationsgründer kann Mitglieder entfernen.

**UI:** Die Oberfläche baut auf Tailwind-Klassen und Radix-Komponenten (Dialog, Label, Button, ScrollArea, Select etc.) auf. Formulare sind einheitlich aufgebaut; Fehlermeldungen und Erfolgsmeldungen werden angezeigt (z. B. per Toast).

### 3.4 Deployment und Installation

AssetTrack wird mit **Docker Compose** gestartet: `docker-compose up --build`. Die `docker-compose.yml` definiert die Dienste `backend` (Build aus `asset-track-backend`, Port 5000, Volume für `instance`) und `frontend` (Build aus `asset-track-frontend`, Port 3000, depends_on: backend). Für eine Produktion kann zusätzlich eine Konfiguration mit Reverse-Proxy (z. B. Caddy) und TLS verwendet werden; die Lauffähigkeit mit dem genannten Befehl erfüllt die Seminarvorgabe. Eine Installationsanleitung (z. B. in README oder separater Datei) beschreibt die Schritte und erforderlichen Umgebungsvariablen (z. B. JWT_SECRET_KEY, CORS_ORIGINS, NEXT_PUBLIC_API_URL) für den produktiven Einsatz.

---

## 4 Fazit und Ausblick

In dieser Arbeit wurde die webbasierte Anwendung **AssetTrack** vorgestellt, die zentrale Aspekte des IT-Asset-Managements abdeckt. Aus einer Marktanalyse bestehender SaaS- und webbasierter ITAM-Lösungen wurden Anforderungen abgeleitet: Login und Registrierung, organisationsbasierte Mehrbenutzer-Nutzung, Asset Tracking mit Lifecycle und Typ, Custom Attributes, History Tracking und Attachments. Die Umsetzung erfolgte mit Next.js (React), TypeScript, Tailwind und Radix im Frontend sowie Flask, SQLAlchemy, JWT und SQLite im Backend. AssetTrack ist in Docker-Containern installierbar und mit `docker-compose up --build` startbar.

Bei der Entwicklung standen typische Herausforderungen im Vordergrund: sichere Authentifizierung (JWT), CORS-Konfiguration für Frontend-Backend-Kommunikation, Zugriffskontrolle auf Organisationsebene, einheitliches Logging von Asset-Änderungen (AssetLog) sowie Speicherung und Auslieferung von Dateianhängen. Die gewählten Technologien (Flask Blueprints, SQLAlchemy-Modelle, Next.js App Router) haben sich für den Umfang der Anwendung bewährt.

**Ausblick:** Mögliche Erweiterungen umfassen die Verwaltung von Verträgen und Lizenzen (Contract/License Management), die Visualisierung von Beziehungen zwischen Assets sowie Ansätze zum Risiko-Management. Multi-Tenancy könnte bei Bedarf ergänzt werden. Technisch sind ein Wechsel zu einer leistungsstärkeren Datenbank (z. B. PostgreSQL) für größere Bestände, API-Versionierung und erweiterte Filter- und Exportfunktionen denkbar. AssetTrack bildet damit eine solide Basis für ein IT-Asset-Management im Seminarumfang und kann gezielt um weitere Funktionen ergänzt werden.

---

## Literaturverzeichnis

[1] Atlassian: IT-Asset-Management. https://www.atlassian.com/de/itsm/it-asset-management (abgerufen im Rahmen der Seminarvorbereitung).

[2] HPE: Was ist IT-Asset-Management? https://www.hpe.com/de/de/what-is/it-asset-management.html (abgerufen im Rahmen der Seminarvorbereitung).

[3] Atlassian: Asset and Configuration Management Handbook 2024. https://www.atlassian.com (Handbuch ITAM/SCM; abgerufen im Rahmen der Seminarvorbereitung).

[4] LSI Bayern: IT-Asset-Management (Dokumentation). https://www.lsi.bayern.de/mam/aktuelles/it_asset_management_v1_0.pdf (abgerufen im Rahmen der Seminarvorbereitung).

*Hinweis: Die in Abschnitt 2.2 genannten Produkte (Asset Panda, Asset Tiger, BMC Helix, Device42, Freshservice, InvGate, Ivanti Neurons, Lansweeper, ManageEngine Asset Explorer, Setyl, Snipe-IT, SolarWinds) wurden über deren offizielle Webauftritte und Dokumentationen verglichen; Einzelnachweise können bei Bedarf ergänzt werden.*
