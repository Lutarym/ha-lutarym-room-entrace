# Room Status by Lutarym

Lovelace Custom Card for Home Assistant — an office floor-plan card
showing up to 4 rooms arranged around a central corridor, each colored
by status (occupied / appointment / free / reserved / closed), with an animated
arrow pointing toward whichever room is currently "free", a
walking-person icon in the corridor when any room is active, and a
popup (tap a room) to change its status. The card and its editor are
fully bilingual (German/English), following `hass.language`
automatically.

Each room's status is stored in **a single text or select helper
entity** in Home Assistant (`input_text` or `input_select`) — not
three separate toggles, and not `localStorage`. You pick the entity per
room directly in the visual editor.

## Installation via HACS

1. HACS → Frontend → **⋮** → Custom repositories
2. Enter this repository's URL, category **Dashboard**
3. Install "Room Status by Lutarym"
4. Reload Home Assistant (clear browser cache if needed)

## Manual installation

Copy `lutarym-room-status-card.js` to `config/www/`:

```yaml
resources:
  - url: /local/lutarym-room-status-card.js
    type: module
```

## Required helper entity

For each bookable room, create **one** helper in Home Assistant whose
state holds the status as text:

**Settings → Devices & Services → Helpers → + Add Helper → Text** (or
**Dropdown** for an `input_select`)

The entity's state must be exactly one of: `occupied`, `appointment`,
`free`, or `closed` (any other value, or an `input_select` option not
matching these, is treated as `closed`). If you use a dropdown
(`input_select`), define exactly these four options.

Select the entity per room in the visual editor — no naming convention
to remember. Tapping a room in the card and choosing a status calls
`input_select.select_option` or `input_text.set_value` on that room's
entity automatically, whichever domain matches.

## Usage

Add via **Edit Dashboard → Add Card → "Room Status by Lutarym"** —
opens the visual configuration form directly, including a dynamic room
list (add/remove up to 4 rooms, each with its own position, status
entity, and an "Emergency Exit" checkbox).

```yaml
type: custom:lutarym-room-status-card
corridor_width: 68                          # optional, px (default 68)
arrow_animation: 1                             # optional, 1-10 (Draw/Pulse/Blink/Glow/Bounce/Flow/Wave/Chase/Dots/Runlight)
font_size_label: 1.2                            # optional, em (default 1.2)
font_size_person: 0.88                          # optional, em (default 0.88)
font_size_status: 1.05                          # optional, em (default 1.05)
font_size_closed: 1.2                            # optional, em (default 1.2)
status_labels:                                # optional, override the default status text
  free: Free
  appointment: Appointment
  occupied: Occupied
  reserved: Reserved
  closed: Closed
rooms:                                        # REQUIRED, 1-4 rooms
  - label: Room 1
    person: Jane Doe
    position: bottom-left                    # top-left | top-right | bottom-left | bottom-right
    entity: input_select.room1_status
  - label: Room 2
    person: John Smith
    position: top-right
    entity: input_text.room2_status
  - position: top-left                       # Emergency Exit — label/person/entity are not needed
    is_exit: true
```

## Emergency Exit quadrant

Instead of a separate global setting, any one of your rooms can be
marked **"This is the Emergency Exit"** in the editor. That room's
quadrant then shows the exit styling instead of a bookable room —
label, person, and status entity aren't needed for it. Leave a room's
exit checkbox unchecked (the default) to use that quadrant as a normal
bookable room. Quadrants with no room configured at all are simply
left empty.

## License

Private / personal use.
