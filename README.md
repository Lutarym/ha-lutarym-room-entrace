# Room Status by Lutarym (Deutsche Version)

Eine **Lovelace Custom Card für Home Assistant** — eine Büro-Grundriss-Karte, die bis zu 4 Räume um einen zentralen Flur herum zeigt. Jeder Raum ist farbig nach Status gekennzeichnet (belegt / nicht besetzt / frei / reserviert / geschlossen), mit einem animierten Pfeil, der zum nächsten freien Raum zeigt, einer Personenfigur im Flur wenn irgendein Raum aktiv ist, und einem Popup zum Status-Wechsel.

**Neu:** Warning Banner zur Anzeige von Warnsignalen (z.B. STOP-Schild) wenn ein Raum belegt ist!

## Features

- ✓ **Deutsches Interface** (vollständig in deutscher Sprache)
- ✓ **Bis zu 4 Räume** um einen Flur herum
- ✓ **5 Status pro Raum**: frei, belegt, nicht besetzt, reserviert, geschlossen
- ✓ **Textfeld** mit Inhalt aus einer Entität (neu!)
- ✓ **Animierte Pfeile** zu freien Räumen (10 verschiedene Animationen)
- ✓ **Farbige Raumdarstellung** je nach Status
- ✓ **Tap-to-Change Popup** zum Statuswechsel
- ✓ **Warning Banner** mit Bild und Text (neu!)
- ✓ **Vollständig im Editor konfigurierbar**
- ✓ **Responsive Design** für Mobil und Desktop
- ✓ **Mit `input_select` oder `input_text` Helpers**

## Installation via HACS

1. HACS → Frontend → **⋮** → Custom repositories
2. Repository URL eintragen: `https://github.com/dein-username/lutarym-room-status-card-deutsch`
3. Kategorie: **Dashboard**
4. "Room Status by Lutarym (Deutsch)" installieren
5. Home Assistant neu laden (Browser-Cache leeren!)

## Manuelle Installation

1. `lutarym-room-status-card.js` in `config/www/` kopieren
2. `Stop.png` in `config/www/` kopieren
3. Ressource in Lovelace hinzufügen:

```yaml
resources:
  - url: /local/lutarym-room-status-card.js
    type: module
```

## Grundkonfiguration

### Minimale YAML-Konfiguration:

```yaml
type: custom:lutarym-room-status-card
rooms:
  - position: top-left
    label: Büro 1
    entity: input_select.office1_status

  - position: top-right
    label: Büro 2
    entity: input_select.office2_status
```

### Mit Warning Banner:

```yaml
type: custom:lutarym-room-status-card
rooms:
  - position: top-left
    label: Büro 1
    entity: input_select.office1_status
    person: Max Müller

  - position: top-right
    label: Büro 2
    entity: input_select.office2_status

warning_banner:
  enabled: true
  image_path: /local/Stop.png
  text: Bitte erst eintreten wenn der Raum frei ist
  show_when: belegt
```

## Konfigurationsreferenz

### Raum-Konfiguration

| Parameter | Typ | Beispiel | Beschreibung |
|-----------|-----|---------|-------------|
| `position` | string | `top-left` | Position: `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| `label` | string | `Büro 1` | Raumname (wird angezeigt) |
| `entity` | string | `input_select.office_status` | Helper-Entität für Status |
| `person` | string | `Max Müller` | Optional: Name der Person (angezeigt auf dem Raumplan) |
| `is_exit` | boolean | `true` | Optional: Markiert Exit/Notausgang |

### Warning Banner Konfiguration

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|-------------|
| `enabled` | boolean | `false` | Banner aktivieren |
| `image_path` | string | `/local/Stop.png` | Pfad zum Bild (PNG) |
| `text` | string | `Bitte erst eintreten...` | Warntext |
| `show_when` | string | `belegt` | `immer` für Daueranzeige, sonst der Status, bei dem eingeblendet wird |

### Textfeld (`info_box`)

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|-------------|
| `entity` | string | - | Entität, deren Zustand als Text erscheint |
| `font_size` | number | `18` | Schriftgröße in px |
| `height` | number | `80` | Höhe des Feldes in px |

Das Feld nutzt immer die volle Breite. Ist der Zustand der Entität leer,
`unknown` oder `unavailable`, wird das Feld ausgeblendet.

### Globale Konfiguration

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|-------------|
| `corridor_width` | number | `68` | Breite des Flurs in Prozent |
| `person_icon_size` | number | `34` | Größe des Personensymbols in px |
| `arrow_animation` | number | `1` | Pfeil-Animationstyp (1-10) |
| `font_size_label` | number | `1.2` | Schriftgröße Raumlabels |
| `font_size_person` | number | `0.88` | Schriftgröße Personenname |
| `font_size_status` | number | `1.05` | Schriftgröße Status-Text |
| `font_size_closed` | number | `1.2` | Schriftgröße "Geschlossen"-Text |
| `reference_width` | number | `800` | Referenzbreite für Skalierung |
| `status_labels` | object | - | Custom Labels für Status |
| `status_show_wayfinding` | object | - | Pfeil pro Status anzeigen |

## Helper einrichten

### Mit `input_select` (empfohlen):

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

### Mit `input_text`:

```yaml
input_text:
  office_status:
    name: "Büro Status"
    initial: frei
```

## Status-Werte (Deutsch)

- **frei** — Raum ist frei, Pfeil zeigt darauf
- **belegt** — Raum ist von Person besetzt
- **nicht besetzt** — Raum ist nicht besetzt
- **reserviert** — Raum ist reserviert
- **geschlossen** — Raum ist geschlossen (wird ausgegraut)

## Pfeil-Animationen

1. **Draw** — Wird gezeichnet
2. **Pulse** — Pulsiert
3. **Blink** — Blinkt
4. **Glow** — Leuchtet
5. **Bounce** — Springt
6. **Flow** — Fließt
7. **Wave** — Welleneffekt
8. **Chase** — Verfolgung
9. **Dots** — Punkte
10. **Runlight** — Lauflicht

## Editor konfigurieren

Die Card kann vollständig im Lovelace-Editor visuell konfiguriert werden:

1. **Dashboard bearbeiten** → Karte hinzufügen
2. `Room Status by Lutarym` wählen (Kartentyp: `custom:lutarym-room-status-card`)
3. Alle Parameter im rechten Panel einstellen
4. **Speichern** und live sehen

## Warning Banner Beispiele

### Nur warnen wenn belegt:
```yaml
warning_banner:
  enabled: true
  image_path: /local/Stop.png
  text: Bitte klopfen, Raum ist belegt!
  show_when: belegt
```

### Stopschild dauerhaft anzeigen:
```yaml
warning_banner:
  enabled: true
  image_path: /local/Stop.png
  text: Bitte erst eintreten wenn der Raum frei ist
  show_when: immer
```
Mit `immer` bleibt das Schild sichtbar, unabhängig vom Status der Räume.

### Warnung wenn nicht besetzt:
```yaml
warning_banner:
  enabled: true
  image_path: /local/Warning.png
  text: Raum ist derzeit nicht besetzt
  show_when: nicht besetzt
```

### Textfeld unter dem Banner:
```yaml
info_box:
  entity: input_text.raum_hinweis
  font_size: 22
  height: 100
```
Ist der Zustand der Entität leer, wird das Feld ausgeblendet.

## Bild-Anforderungen

- **Format:** PNG mit Transparenzhintergrund
- **Empfohlene Größe:** 200×200 Pixel
- **Wird skaliert auf:** 100×100 Pixel in der Anzeige

## Support und Fehler

- Fehler melden: GitHub Issues
- Fragen? README und Editor-Dokumentation prüfen

## Lizenz

Private Nutzung

## Changelog

### v2.0.0 (Deutsch)
- ✨ Warning Banner Feature hinzugefügt
- ✨ Deutsche Statusnamen: frei, belegt, nicht besetzt, reserviert, geschlossen
- ✨ Alle deutsches UI und Dokumentation
- ✨ Editor-Konfiguration für Warning Banner
- ✨ Responsive Design für mobil

---

**Viel Erfolg bei der Nutzung!** 🚀
