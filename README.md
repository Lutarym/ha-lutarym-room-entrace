# Room Status by Lutarym

Lovelace Custom Card for Home Assistant — an office floor-plan card
showing up to 4 rooms arranged around a central corridor, each colored
by status (occupied / appointment / free / closed), with an animated
arrow pointing toward whichever room is currently "free", a
walking-person icon in the corridor when any room is active, and a
popup (tap a room) to change its status. The card and its editor are
fully bilingual (German/English), following `hass.language`
automatically.

Status is stored in Home Assistant via `input_boolean` helper
entities — one per room and status — **not** in `localStorage`.

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

## Required helper entities

For each room, create three toggle (`input_boolean`) helpers in Home
Assistant — **no helper needed for "closed"**, that's simply the state
when none of the other three are on.

**Settings → Devices & Services → Helpers → + Add Helper → Toggle**

For a room with `id: room1`, create:

- `input_boolean.room1_occupied`
- `input_boolean.room1_appointment`
- `input_boolean.room1_free`

If you set `entity_prefix: "office_"`, the IDs become
`input_boolean.office_room1_occupied` etc. — useful to avoid collisions
if you run several of these cards on one dashboard. The visual editor
shows this same reminder directly above the room list, with your
current prefix already filled in.

## Usage

Add via **Edit Dashboard → Add Card → "Room Status by Lutarym"** —
opens the visual configuration form directly, including a dynamic room
list (add/remove up to 4 rooms, each with its own position).

```yaml
type: custom:lutarym-room-status-card
corridor_width: 68                          # optional, px (default 68)
entity_prefix: ''                            # optional, namespaces input_boolean IDs
show_emergency_exit: true                     # optional, shown top-left if no room is placed there
arrow_animation: 1                             # optional, 1-10 (Draw/Pulse/Blink/Glow/Bounce/Flow/Wave/Chase/Dots/Runlight)
font_size_label: 1.2                            # optional, em (default 1.2)
font_size_person: 0.88                          # optional, em (default 0.88)
font_size_status: 1.05                          # optional, em (default 1.05)
status_labels:                                # optional, override the default status text
  free: Free
  appointment: Appointment
  occupied: Occupied
  closed: Closed
rooms:                                        # REQUIRED, 1-4 rooms
  - id: room1
    label: Room 1
    person: Jane Doe
    position: bottom-left                    # top-left | top-right | bottom-left | bottom-right
  - id: room2
    label: Room 2
    person: John Smith
    position: top-right
  - id: room3
    label: Room 3
    person: Alex Miller
    position: bottom-right
```

## License

Private / personal use.
