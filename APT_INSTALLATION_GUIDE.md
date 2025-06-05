# APT Installation Guide - Household Expense Tracker

## Installation über APT (Empfohlen)

### Option 1: Lokale .deb Installation

1. **Paket erstellen:**
```bash
./build-deb-package.sh
```

2. **Paket installieren:**
```bash
sudo dpkg -i ../household-expense-tracker_2.0.0-1_all.deb
sudo apt-get install -f  # Abhängigkeiten automatisch installieren
```

### Option 2: APT Repository (für Distributoren)

1. **Repository erstellen:**
```bash
# .deb Datei auf Server hochladen
dpkg-scanpackages . /dev/null | gzip -9c > Packages.gz
```

2. **Repository hinzufügen:**
```bash
echo 'deb [trusted=yes] http://ihr-server.com/repo ./' | sudo tee /etc/apt/sources.list.d/household-expense-tracker.list
sudo apt-get update
```

3. **Installation:**
```bash
sudo apt-get install household-expense-tracker
```

## Was passiert bei der Installation

### Automatische Schritte:
- PostgreSQL Installation und Konfiguration
- Systembenutzer erstellen (`expense-tracker`)
- Sichere Datenbankzugangsdaten generieren
- Datenbankschema initialisieren
- Systemd Service einrichten
- Automatischer Start des Services

### Installationspfad:
- Anwendung: `/opt/household-expense-tracker/`
- Service: `household-expense-tracker.service`
- Konfiguration: `/opt/household-expense-tracker/.env`
- Logs: `journalctl -u household-expense-tracker`

## Nach der Installation

### Zugriff:
```
http://localhost:5000
http://ihre-ip:5000
```

### Service-Verwaltung:
```bash
# Status prüfen
sudo systemctl status household-expense-tracker

# Service neustarten
sudo systemctl restart household-expense-tracker

# Logs anzeigen
journalctl -u household-expense-tracker -f

# Service stoppen
sudo systemctl stop household-expense-tracker
```

### Deinstallation:
```bash
# Anwendung entfernen (Datenbank bleibt erhalten)
sudo apt-get remove household-expense-tracker

# Vollständig entfernen (inkl. Konfiguration)
sudo apt-get purge household-expense-tracker
```

## Systemanforderungen

- **OS:** Debian/Ubuntu oder kompatible Distribution
- **RAM:** 512 MB minimum, 1 GB empfohlen
- **Speicher:** 200 MB für Anwendung + PostgreSQL
- **Abhängigkeiten:** Automatisch installiert
  - Node.js ≥ 18.0
  - PostgreSQL ≥ 12.0
  - PostgreSQL Contrib

## Vorteile der APT-Installation

- **Ein Befehl:** `sudo apt-get install household-expense-tracker`
- **Automatische Updates:** Über APT-System
- **Saubere Deinstallation:** Vollständige Entfernung möglich
- **Service-Integration:** Systemd-Verwaltung
- **Sicherheit:** Systembenutzer und Berechtigungen
- **Abhängigkeiten:** Automatische Verwaltung