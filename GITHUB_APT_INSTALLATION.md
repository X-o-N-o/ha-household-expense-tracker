# GitHub APT Installation - Household Expense Tracker

## Ein-Befehl Installation direkt von GitHub

### Automatische Installation (Empfohlen)
```bash
curl -sSL https://your-username.github.io/household-expense-tracker/install.sh | bash
```

### Manuelle APT-Repository Einrichtung
```bash
echo 'deb [trusted=yes] https://your-username.github.io/household-expense-tracker stable main' | sudo tee /etc/apt/sources.list.d/household-expense-tracker.list
sudo apt-get update
sudo apt-get install household-expense-tracker
```

## Setup für Repository-Betreiber

### 1. GitHub Pages APT Repository erstellen
```bash
./github-pages-apt-setup.sh
```

### 2. GitHub Repository konfigurieren
1. Alle Dateien zu GitHub pushen
2. GitHub Pages aktivieren (Settings → Pages → Source: docs/)
3. GitHub Actions für automatische Updates aktivieren

### 3. Automatische Updates
- GitHub Workflow erstellt automatisch neue Pakete bei Releases
- APT Repository wird bei jedem Push aktualisiert
- Benutzer erhalten Updates über `apt-get upgrade`

## Vorteile der GitHub APT Installation

### Für Benutzer:
- **Ein Befehl**: Komplette Installation mit einem curl-Befehl
- **Automatische Updates**: Über APT-System verfügbar
- **Keine lokalen Builds**: Vorkompilierte Pakete
- **Vertrauenswürdig**: Direkt vom offiziellen Repository

### Für Entwickler:
- **Kostenlos**: GitHub Pages ohne zusätzliche Kosten
- **Automatisch**: CI/CD Pipeline für Paket-Updates
- **Global verfügbar**: CDN-Distribution über GitHub
- **Versionsverwaltung**: Releases werden automatisch verpackt

## Repository-Struktur

```
your-repo/
├── docs/                          # GitHub Pages APT Repository
│   ├── dists/stable/main/
│   ├── pool/main/
│   ├── index.html
│   └── install.sh
├── .github/workflows/
│   └── update-apt-repo.yml        # Automatische Paket-Updates
├── debian/                        # Debian Paket-Konfiguration
└── setup-scripts/                # Installation Tools
```

## Benutzererfahrung

Nach der Installation:
```bash
# Service-Status prüfen
sudo systemctl status household-expense-tracker

# Anwendung zugreifen
http://localhost:5000

# Updates installieren
sudo apt-get update && sudo apt-get upgrade

# Vollständig entfernen
sudo apt-get purge household-expense-tracker
```

## Deployment-Workflow

1. **Code-Änderungen** → Git Push
2. **GitHub Actions** → Automatischer Paket-Build
3. **GitHub Pages** → APT Repository Update
4. **Benutzer** → `apt-get update && apt-get upgrade`

Diese Lösung bietet die professionellste Installation direkt von GitHub mit vollständiger APT-Integration.