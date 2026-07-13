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
entities — one per room and status — **not** in `localStorage`. You
pick the exact entities per room directly in the visual editor (entity
pickers, filtered to the `input_boolean` domain) — no naming convention
to remember.

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

Name them however you like (e.g. `input_boolean.meeting_room_occupied`)
— then select them per room in the visual editor's entity pickers. The
editor shows this same reminder directly above the room list.

## Usage

Add via **Edit Dashboard → Add Card → "Room Status by Lutarym"** —
opens the visual configuration form directly, including a dynamic room
list (add/remove up to 4 rooms, each with its own position and three
entity pickers).

```yaml
type: custom:lutarym-room-status-card
corridor_width: 68                          # optional, px (default 68)
show_emergency_exit: true                     # optional, default true
emergency_exit_position: top-left              # optional, default top-left — top-left | top-right | bottom-left | bottom-right
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
  - label: Room 1
    person: Jane Doe
    position: bottom-left                    # top-left | top-right | bottom-left | bottom-right
    entity_occupied: input_boolean.room1_occupied
    entity_appointment: input_boolean.room1_appointment
    entity_free: input_boolean.room1_free
  - label: Room 2
    person: John Smith
    position: top-right
    entity_occupied: input_boolean.room2_occupied
    entity_appointment: input_boolean.room2_appointment
    entity_free: input_boolean.room2_free
  - label: Room 3
    person: Alex Miller
    position: bottom-right
    entity_occupied: input_boolean.room3_occupied
    entity_appointment: input_boolean.room3_appointment
    entity_free: input_boolean.room3_free
```

## Emergency Exit quadrant

`emergency_exit_position` picks which of the 4 corners shows the
"Emergency Exit" label — but only if no room is placed there. If you
either uncheck "Show Emergency Exit" or simply assign a room to that
same position, the room takes over that spot automatically and the
exit label disappears — no extra configuration needed to "free up" the
quadrant.

## License

Private / personal use.
