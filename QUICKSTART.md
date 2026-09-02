# Schnellstart-Anleitung

Folge diesen Schritten um die Card schnell zum Laufen zu bringen:

## 1️⃣ Installation

### Option A: HACS (empfohlen)
```
HACS → Frontend → ⋮ → Custom repositories
URL: https://github.com/dein-username/lutarym-room-status-card-deutsch
Kategorie: Dashboard
→ Installieren
```

### Option B: Manuell
```
1. lutarym-room-status-card-deutsch.js → config/www/
2. Stop.png → config/www/
3. Home Assistant neu laden
```

## 2️⃣ Helper erstellen

In Home Assistant: **Einstellungen → Geräte & Services → Helfer**

Erstelle einen `input_select`:

```yaml
input_select:
  office_status:
    name: "Büro Status"
    options:
      - frei
      - belegt
      - nicht besetzt
      - reserviert
      - geschlossen
    initial: frei
```

## 3️⃣ Card im Dashboard hinzufügen

1. Dashboard **bearbeiten**
2. **Karte hinzufügen** → `lutarym-room-status-card-deutsch`
3. Im Editor rechts:
   - Position: `top-left`
   - Label: `Büro`
   - Entity: `input_select.office_status`
4. **Speichern**

## 4️⃣ Warning Banner (optional)

Wenn du ein STOP-Schild anzeigen möchtest:

Im YAML-Editor:
```yaml
type: custom:lutarym-room-status-card-deutsch
rooms:
  - position: top-left
    label: Büro
    entity: input_select.office_status

warning_banner:
  enabled: true
  image_path: /local/Stop.png
  text: Bitte erst eintreten wenn der Raum frei ist
  show_when: belegt
```

## 5️⃣ Testen

- Klicke auf den Raum → Popup öffnet sich
- Wähle einen Status aus
- Schaue, wie sich die Farben ändern
- Bei "belegt" sollte das Warning Banner sichtbar sein

## 🎨 Personalisieren

Im Editor kannst du ändern:
- Raumnamen
- Animationstyp (1-10)
- Schriftgrößen
- Farben per Status
- Text und Bild des Warnings

## 🐛 Fehlersuche

**Karte wird nicht angezeigt?**
- Browser-Cache leeren
- Home Assistant neuladen
- Konsole prüfen (F12)

**Helper-Wert wird nicht übernommen?**
- Sicherstellen dass die Entity existiert
- Wert manuell setzen und prüfen

**Stop-Bild wird nicht angezeigt?**
- Datei `Stop.png` liegt in `config/www/`
- Pfad: `/local/Stop.png`

## 📖 Weitere Hilfe

Siehe [README.md](README.md) für alle Konfigurationsoptionen.

---

**Viel Spaß mit der Card!** 🚀
