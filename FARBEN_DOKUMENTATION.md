# Farb-Konfiguration für HA-Verlauf

## Neues Feature: status_colors pro Raum

Die Card setzt jetzt automatisch das `color` Attribut an der Helper-Entität, damit HA den Status im Verlauf mit der richtigen Farbe anzeigt.

### Verwendung

Für jeden Raum können optional `status_colors` definiert werden:

```yaml
type: custom:lutarym-room-status-card-deutsch
rooms:
  - position: top-left
    label: Room 1
    entity: input_select.room1_status
    status_colors:
      frei: '#00C853'
      belegt: '#F50000'
      termin: '#FFD600'
      reserviert: '#2196F3'
      geschlossen: '#546E7A'
```

### Standard-Farben (wenn nicht definiert):
```
frei:         #00C853  (grün)
belegt:       #F50000  (rot)
termin:       #FFD600  (gelb)
reserviert:   #2196F3  (blau)
geschlossen:  #546E7A  (grau)
```

### Wie es funktioniert:

1. Wenn der Nutzer einen Status über die Popup-Buttons wechselt
2. Schreibt die Card den Status in die Helper-Entität
3. Setzt gleichzeitig das `color` Attribut mit der konfigurierten Farbe
4. HA zeigt im Verlauf die richtige Farbe an

### Beispiel YAML mit benutzerdefinierten Farben:

```yaml
type: custom:lutarym-room-status-card-deutsch
rooms:
  - position: top-left
    label: Büro
    entity: input_select.office_status
    person: John Doe
    status_colors:
      frei: '#4CAF50'        # Custom grün
      belegt: '#FF6B6B'      # Custom rot
      termin: '#FFC107'      # Custom orange
      reserviert: '#2196F3'  # Standard blau
      geschlossen: '#757575' # Custom dunkelgrau

  - position: top-right
    label: Besprechungsraum
    entity: input_select.meeting_status
    # Hier keine status_colors = Standard-Farben werden verwendet
```

### Wichtig:

- Nur die Farben, die man ändern möchte, müssen definiert werden
- Nicht definierte Farben verwenden automatisch die Standard-Werte
- Die Farbe wird beim Status-Wechsel automatisch als Attribut gespeichert
