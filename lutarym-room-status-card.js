/**
 * lutarym-room-status-card.js
 * Lovelace Custom Card — office room status floor plan
 *
 * Shows up to 4 rooms arranged around a central corridor (top-left,
 * top-right, bottom-left, bottom-right), each colored by status
 * (occupied / appointment / free / reserved / closed), with an animated arrow
 * pointing toward whichever room is currently "free", a walking-person
 * icon in the corridor when any room is active, and a popup (tap a room)
 * to change its status. Each room's status is stored in a single text or
 * select helper entity (`input_text` or `input_select`) picked per room
 * in the visual editor — not in localStorage.
 *
 * INSTALLATION
 *   1. Copy the file to /config/www/lutarym-room-status-card.js
 *   2. Settings > Dashboards > Resources > Add resource:
 *        URL:  /local/lutarym-room-status-card.js
 *        Type: JavaScript Module
 *   3. Clear your browser cache (Ctrl+F5)
 *   4. Create one text/select helper per room: Settings > Devices &
 *      Services > Helpers > + Add Helper > Text (or Dropdown). Its state
 *      must be exactly "occupied", "appointment", "free", "reserved", or "closed".
 *      Then select it per room in the visual editor.
 *
 * CONFIGURATION
 *   type: custom:lutarym-room-status-card
 *   corridor_width: 68                          # optional, px (default 68)
 *   arrow_animation: 1                             # optional, 1-10 (see below)
 *   font_size_label: 1.2                            # optional, em (default 1.2)
 *   font_size_person: 0.88                          # optional, em (default 0.88)
 *   font_size_status: 1.05                          # optional, em (default 1.05)
 *   font_size_closed: 1.2                            # optional, em (default 1.2)
 *   rooms:                                        # REQUIRED, 1-4 rooms
 *     - label: Room 1
 *       person: Jane Doe
 *       position: bottom-left                    # top-left | top-right | bottom-left | bottom-right
 *       entity: input_select.room1_status
 *     - label: Room 2
 *       person: John Smith
 *       position: top-right
 *       entity: input_text.room2_status
 *     - position: top-left                       # Emergency Exit — label/person/entity not needed
 *       is_exit: true
 */

const VERSION = '1.0.0';

// ── Simple i18n helper (falls back to English) ─────────────────────────

const I18N = {
  en: {
    emergencyExit: 'Emergency Exit',
    statusFree: 'Free',
    statusAppointment: 'Appointment',
    statusOccupied: 'Occupied',
    statusReserved: 'Reserved',
    statusClosed: 'Closed',
    roomsMissing: '"rooms" (array) is required.',
    editorCorridorWidth: 'Corridor width (px)',
    editorArrowAnimation: 'Arrow animation',
    anim1: '1 – Draw', anim2: '2 – Pulse', anim3: '3 – Blink', anim4: '4 – Glow', anim5: '5 – Bounce',
    anim6: '6 – Flow', anim7: '7 – Wave', anim8: '8 – Chase', anim9: '9 – Dots', anim10: '10 – Runlight',
    sectionFontSizes: 'Font Sizes (em)',
    editorFontLabel: 'Room label',
    editorFontPerson: 'Person name',
    editorFontStatus: 'Status text',
    editorFontClosed: 'Closed text',
    sectionLabels: 'Status Labels (optional overrides)',
    editorLabelFree: 'Label: Free',
    editorLabelAppointment: 'Label: Appointment',
    editorLabelOccupied: 'Label: Occupied',
    editorLabelReserved: 'Label: Reserved',
    editorLabelClosed: 'Label: Closed',
    sectionRooms: 'Rooms ({count}/4)',
    roomsHint: 'Up to 4 rooms, one per corner of the floor plan. Mark one as the Emergency Exit instead of a bookable room if needed.',
    helpersHint: 'For each room, create one text or select helper in Home Assistant that holds the status as text: Settings → Devices & Services → Helpers → + Add Helper → Text (or Dropdown). Its state must be exactly "occupied", "appointment", "free", "reserved", or "closed". Then select it below.',
    roomHeaderLabel: 'Room {n}',
    removeLabel: 'Remove',
    addRoomLabel: '+ Add room',
    editorRoomLabel: 'Label',
    editorRoomPerson: 'Person (optional)',
    editorRoomPosition: 'Position',
    editorRoomEntity: 'Status entity (text or select helper)',
    editorRoomIsExit: 'This is the Emergency Exit (not a bookable room)',
    posTopLeft: 'Top left', posTopRight: 'Top right', posBottomLeft: 'Bottom left', posBottomRight: 'Bottom right',
    cardName: 'Room Status by Lutarym',
    cardDescription: 'Office floor-plan card showing room status (occupied/appointment/free/reserved/closed) with animated wayfinding arrows and a tap-to-change popup.',
  },
  de: {
    emergencyExit: 'Notausgang',
    statusFree: 'Frei',
    statusAppointment: 'Termin',
    statusOccupied: 'Belegt',
    statusReserved: 'Reserviert',
    statusClosed: 'Geschlossen',
    roomsMissing: 'Pflichtfeld "rooms" (Array) fehlt.',
    editorCorridorWidth: 'Flurbreite (px)',
    editorArrowAnimation: 'Pfeil-Animation',
    anim1: '1 – Zeichnen', anim2: '2 – Pulsieren', anim3: '3 – Blinken', anim4: '4 – Glühen', anim5: '5 – Springen',
    anim6: '6 – Fließen', anim7: '7 – Welle', anim8: '8 – Chase', anim9: '9 – Punkte', anim10: '10 – Lauflicht',
    sectionFontSizes: 'Schriftgrößen (em)',
    editorFontLabel: 'Raumbeschriftung',
    editorFontPerson: 'Personenname',
    editorFontStatus: 'Statustext',
    editorFontClosed: 'Geschlossen-Text',
    sectionLabels: 'Status-Beschriftungen (optionale Überschreibung)',
    editorLabelFree: 'Beschriftung: Frei',
    editorLabelAppointment: 'Beschriftung: Termin',
    editorLabelOccupied: 'Beschriftung: Belegt',
    editorLabelReserved: 'Beschriftung: Reserviert',
    editorLabelClosed: 'Beschriftung: Geschlossen',
    sectionRooms: 'Räume ({count}/4)',
    roomsHint: 'Bis zu 4 Räume, je einer pro Ecke des Grundrisses. Einen davon kannst du statt als buchbaren Raum als Notausgang markieren.',
    helpersHint: 'Für jeden Raum wird ein Text- oder Auswahl-Helfer in Home Assistant benötigt, der den Status als Text enthält: Einstellungen → Geräte & Dienste → Helfer → + Helfer hinzufügen → Text (oder Dropdown). Der Zustand muss genau "occupied", "appointment", "free", "reserved" oder "closed" lauten. Anschließend unten auswählen.',
    roomHeaderLabel: 'Raum {n}',
    removeLabel: 'Entfernen',
    addRoomLabel: '+ Raum hinzufügen',
    editorRoomLabel: 'Beschriftung',
    editorRoomPerson: 'Person (optional)',
    editorRoomPosition: 'Position',
    editorRoomEntity: 'Status-Entity (Text- oder Auswahl-Helfer)',
    editorRoomIsExit: 'Dies ist der Notausgang (kein buchbarer Raum)',
    posTopLeft: 'Oben links', posTopRight: 'Oben rechts', posBottomLeft: 'Unten links', posBottomRight: 'Unten rechts',
    cardName: 'Room Status by Lutarym',
    cardDescription: 'Grundriss-Karte mit Raumstatus (Belegt/Termin/Frei/Geschlossen), animierten Wegweiser-Pfeilen und Popup zum Statuswechsel per Tap.',
  },
};

function lutarymLang(hass) {
  const raw = (hass && hass.language) || (typeof navigator !== 'undefined' ? navigator.language : 'en') || 'en';
  return raw.toLowerCase().startsWith('de') ? 'de' : 'en';
}

function t(hass, key, vars) {
  const dict = I18N[lutarymLang(hass)] || I18N.en;
  let str = dict[key] ?? I18N.en[key] ?? key;
  if (vars) Object.keys(vars).forEach(k => { str = str.split(`{${k}}`).join(vars[k]); });
  return str;
}

// Status colors are language-independent; labels come from I18N/status_labels.
const STATUS_COLORS = {
  occupied:    { bg: '#F50000', dark: '#B00000' },
  appointment: { bg: '#FFD600', dark: '#F9A800' },
  free:        { bg: '#00C853', dark: '#009624' },
  reserved:    { bg: '#2196F3', dark: '#0D47A1' },
  closed:      { bg: '#546E7A', dark: '#37474F' },
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

class LutarymRoomStatusCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built     = false;   // DOM built once already?
    this._hass      = null;
    this._config    = null;
    this._popupId   = null;
  }

  setConfig(config) {
    if (!Array.isArray(config?.rooms) || !config.rooms.length)
      throw new Error(t(this._hass, 'roomsMissing'));
    this._config = config;
    this._built = false; // rebuild on next hass assignment, e.g. after editing in the visual editor
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    else              this._update();
  }

  getCardSize() { return 5; }

  static getConfigElement() {
    return document.createElement('lutarym-room-status-card-editor');
  }

  static getStubConfig() {
    return {
      corridor_width: 68,
      arrow_animation: 1,
      rooms: [
        { label: 'Room 1', person: 'Jane Doe',   position: 'bottom-left',  entity: 'input_select.room1_status' },
        { label: 'Room 2', person: 'John Smith', position: 'top-right',    entity: 'input_select.room2_status' },
        { label: 'Room 3', person: 'Alex Miller', position: 'bottom-right', entity: 'input_select.room3_status' },
      ],
    };
  }

  // ── Arrow animations ─────────────────────────────────────────────────────

  _arrowAnimationCss() {
    const animMap = {1:'draw',2:'pulse',3:'blink',4:'glow',5:'bounce',6:'flow',7:'wave',8:'chase',9:'dots',10:'runlight'};
    const cfg  = this._config.arrow_animation ?? 1;
    const name = animMap[cfg] ?? animMap[1];
    const delay1 = '0.5s', delay2 = '1s', delay3 = '1.5s';

    const animations = {

      // 1. Arrow draws itself from base to tip
      draw: `
        @keyframes ap { 0%{stroke-dashoffset:100;opacity:0} 10%{opacity:1} 75%{stroke-dashoffset:0;opacity:1} 90%,100%{stroke-dashoffset:0;opacity:0} }
        @keyframes ah { 0%,65%{opacity:0} 80%,88%{opacity:1} 100%{opacity:0} }
        .arrow-path { stroke-dasharray:100; stroke-dashoffset:100; animation:ap 2s ease-in-out infinite; }
        .arrow-head { animation:ah 2s ease-in-out infinite; }`,

      // 2. Gentle pulse
      pulse: `
        @keyframes ap { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes ah { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .arrow-path { animation:ap 1.5s ease-in-out infinite; }
        .arrow-head { animation:ah 1.5s ease-in-out infinite; }`,

      // 3. Sharp blink
      blink: `
        @keyframes ap { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes ah { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .arrow-path { animation:ap 0.8s step-end infinite; }
        .arrow-head { animation:ah 0.8s step-end infinite; }`,

      // 4. Glow
      glow: `
        @keyframes ap { 0%,100%{opacity:0.6;filter:drop-shadow(0 0 2px #00C853)} 50%{opacity:1;filter:drop-shadow(0 0 10px #00C853) drop-shadow(0 0 20px #00C853)} }
        @keyframes ah { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .arrow-path { animation:ap 1.8s ease-in-out infinite; }
        .arrow-head { animation:ah 1.8s ease-in-out infinite; }`,

      // 5. Arrowhead bounces
      bounce: `
        @keyframes ap { 0%,100%{opacity:1} }
        @keyframes ah { 0%,100%{transform:scale(1)} 40%{transform:scale(1.6)} 60%{transform:scale(0.8)} }
        .arrow-path { animation:ap 1s infinite; }
        .arrow-head { transform-box:fill-box; transform-origin:center; animation:ah 1s ease-in-out infinite; }`,

      // 6. Flowing dashes in arrow direction
      flow: `
        @keyframes ap { 0%{stroke-dashoffset:20} 100%{stroke-dashoffset:0} }
        @keyframes ah { 0%,100%{opacity:1} }
        .arrow-path { stroke-dasharray:8 5; animation:ap 0.5s linear infinite; }
        .arrow-head { animation:ah 1s infinite; }`,

      // 7. Wave: arrows light up one after another
      wave: `
        @keyframes ap { 0%,100%{opacity:0.15} 30%,70%{opacity:1} }
        @keyframes ah { 0%,100%{opacity:0.15} 30%,70%{opacity:1} }
        .arrow-path { animation:ap 1.8s ease-in-out infinite; }
        .arrow-head { animation:ah 1.8s ease-in-out infinite; }`,

      // 8. Fast draw (chase)
      chase: `
        @keyframes ap { 0%{stroke-dashoffset:100;opacity:1} 70%{stroke-dashoffset:0;opacity:1} 71%,100%{opacity:0} }
        @keyframes ah { 0%,60%{opacity:0} 70%,85%{opacity:1} 100%{opacity:0} }
        .arrow-path { stroke-dasharray:100; stroke-dashoffset:100; animation:ap 0.9s linear infinite; }
        .arrow-head { animation:ah 0.9s linear infinite; }`,

      // 9. Traveling dots along the path
      dots: `
        @keyframes ap { 0%{stroke-dashoffset:30} 100%{stroke-dashoffset:0} }
        @keyframes ah { 0%,100%{opacity:1} }
        .arrow-path { stroke-linecap:round; animation:ap 0.8s linear infinite; }
        .arrow-head { animation:ah 1s infinite; }
        #arrow-bl .arrow-path, #arrow-br .arrow-path { stroke-dasharray:1 14; }
        #arrow-tr .arrow-path, #arrow-tl .arrow-path { stroke-dasharray:1 4; }`,

      // 10. Runlight (a short bright segment travels along the arrow)
      runlight: `
        @keyframes ap { 0%{stroke-dashoffset:130} 100%{stroke-dashoffset:0} }
        @keyframes ah { 0%,100%{opacity:1} }
        .arrow-path { stroke-dasharray:15 115; stroke-linecap:round; animation:ap 1.1s linear infinite; }
        .arrow-head { animation:ah 1.1s infinite; }`,
    };

    const css = animations[name] ?? animations.draw;
    return `
      ${css}
      #arrow-br .arrow-path, #arrow-br .arrow-head { animation-delay:${delay1}; }
      #arrow-tr .arrow-path, #arrow-tr .arrow-head { animation-delay:${delay2}; }
      #arrow-tl .arrow-path, #arrow-tl .arrow-head { animation-delay:${delay3}; }
    `;
  }

  // ── One-time DOM build ────────────────────────────────────────────────────

  _build() {
    if (!this._config || !this._hass) return;
    this._built = true;
    const hass = this._hass;

    const cfg   = this._config;
    const rooms = cfg.rooms;
    const byPos = Object.fromEntries(rooms.map(r => [r.position, r]));

    const fsl = cfg.font_size_label  ?? 1.2;
    const fsp = cfg.font_size_person ?? 0.88;
    const fss = cfg.font_size_status ?? 1.05;
    const fsc = cfg.font_size_closed ?? 1.2;
    const cw  = cfg.corridor_width   ?? 68;

    // Labels from config (with i18n defaults)
    this._labels = {
      free:        cfg.status_labels?.free        ?? t(hass, 'statusFree'),
      appointment: cfg.status_labels?.appointment  ?? t(hass, 'statusAppointment'),
      occupied:    cfg.status_labels?.occupied     ?? t(hass, 'statusOccupied'),
      reserved:    cfg.status_labels?.reserved     ?? t(hass, 'statusReserved'),
      closed:      cfg.status_labels?.closed       ?? t(hass, 'statusClosed'),
    };

    const AREA_MAP = { 'top-left': 'tl', 'top-right': 'tr', 'bottom-left': 'bl', 'bottom-right': 'br' };
    const positionsHtml = Object.keys(AREA_MAP).map(pos => {
      const area = AREA_MAP[pos];
      const room = byPos[pos];
      if (room && room.is_exit) return this._exitHtml(area);
      if (room) return this._roomHtml(room, area);
      return `<div style="grid-area:${area};background:#212121"></div>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; width:100%; height:100%; }
        ha-card { padding:0; overflow:hidden; height:100%; position:relative; }
        .grid {
          display:grid;
          grid-template-areas:"tl corridor tr" "bl corridor br";
          grid-template-columns:1fr calc(${cw}px * var(--scale,1)) 1fr;
          grid-template-rows:1fr 1fr;
          gap:3px;
          background:#212121;
          height:100%;
          align-items:stretch;
        }
        .room {
          display:flex; flex-direction:column;
          padding:12px 14px;
          overflow:hidden; min-height:0; box-sizing:border-box;
          cursor:pointer; transition:filter 0.15s;
          position:relative;
        }
        .room:hover { filter:brightness(1.1); }
        .room-top { display:flex; flex-direction:column; align-items:center; text-align:center; }
        .room-label  { font-size:calc(${fsl}em * var(--scale,1)); font-weight:800; line-height:1.2; text-shadow:0 2px 6px rgba(0,0,0,0.4); }
        .room-person { font-size:calc(${fsp}em * var(--scale,1)); font-weight:500; opacity:.9; margin-top:6px; text-shadow:0 1px 4px rgba(0,0,0,0.35); }
        .room-divider { width:60%; height:1px; background:rgba(255,255,255,0.4); margin:8px auto 0; }
        .room-footer { margin-top:auto; text-align:center; }
        .room-closed { display:none; position:absolute; inset:0; align-items:center; justify-content:center; font-size:calc(${fsc}em * var(--scale,1)); font-weight:800; color:rgba(255,255,255,0.6); letter-spacing:.05em; text-transform:uppercase; pointer-events:none; text-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .room-status { font-size:calc(${fss}em * var(--scale,1)); font-weight:700; letter-spacing:.04em; text-transform:uppercase; text-shadow:0 1px 4px rgba(0,0,0,0.35); }
        .exit-quadrant {
          display:flex; align-items:center; justify-content:center;
          background:linear-gradient(160deg,#546E7A,#263238);
        }
        .exit-label {
          color:#fff; font-size:calc(${fsl}em * var(--scale,1)); font-weight:800;
          text-transform:uppercase; letter-spacing:.05em;
          background:#D50000; padding:6px 14px; border-radius:6px;
          text-shadow:0 1px 4px rgba(0,0,0,0.5);
        }
        .corridor { grid-area:corridor; background:#CFD8DC; overflow:hidden; }

        /* Popup */
        .popup-overlay {
          display:none; position:fixed; inset:0;
          background:rgba(0,0,0,.55); backdrop-filter:blur(3px);
          align-items:center; justify-content:center; z-index:9999;
        }
        .popup-overlay.open { display:flex; }
        .popup-box {
          background:#1e1e1e; border-radius:14px;
          padding:22px 26px; min-width:260px;
          box-shadow:0 8px 40px rgba(0,0,0,.7);
        }
        .popup-title {
          color:#fff; font-size:1.05em; font-weight:700;
          text-align:center; margin-bottom:18px;
        }
        .popup-buttons { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .popup-btn {
          padding:10px 4px;
          border:2px solid var(--c); border-radius:8px;
          background:transparent; color:#fff;
          font-size:.95em; font-weight:700; cursor:pointer;
          transition:background .2s, color .2s;
        }
        .popup-btn.active { background:var(--c); color:var(--ct,#fff); }
        .popup-btn:not(.active):hover { background:rgba(255,255,255,.12); }
      </style>
      <ha-card>
        <div class="grid">
          ${positionsHtml}
          ${this._corridorHtml(rooms)}
        </div>
        <div class="popup-overlay" id="popup">
          <div class="popup-box">
            <div class="popup-title" id="popup-title"></div>
            <div class="popup-buttons">
              <button class="popup-btn" id="btn-free"
                style="--c:#00C853">${this._labels.free}</button>
              <button class="popup-btn" id="btn-appointment"
                style="--c:#FFD600;--ct:#1A1A1A">${this._labels.appointment}</button>
              <button class="popup-btn" id="btn-occupied"
                style="--c:#F50000">${this._labels.occupied}</button>
              <button class="popup-btn" id="btn-reserved"
                style="--c:#2196F3">${this._labels.reserved}</button>
            </div>
          </div>
        </div>
      </ha-card>`;

    this._attachListeners();
    this._update();
    this._observeSize();
  }

  _observeSize() {
    const refWidth = this._config.reference_width ?? 800;
    const grid = this.shadowRoot.querySelector('.grid');
    if (!grid) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const scale = Math.max(0.3, w / refWidth);
        grid.style.setProperty('--scale', scale);
      }
    });
    ro.observe(this);
  }

  // ── Update only colors/text (no rebuild) ─────────────────────────────────

  _update() {
    if (!this._built) return;
    for (const room of this._config.rooms) {
      const el = this.shadowRoot.querySelector(`[data-room-position="${room.position}"]`);
      if (!el) continue;
      const s = this._roomStatus(room);
      const { bg, dark } = STATUS_COLORS[s];
      const closed = s === 'closed';
      const label = closed ? '' : (this._labels[s] ?? '');
      el.style.background = `linear-gradient(160deg,${bg},${dark})`;
      el.style.color       = s === 'appointment' ? '#1A1A1A' : '#fff';
      el.querySelector('.room-top').style.visibility    = closed ? 'hidden' : 'visible';
      el.querySelector('.room-footer').style.visibility = closed ? 'hidden' : 'visible';
      el.querySelector('.room-status').textContent = label;
      const closedEl = el.querySelector('.room-closed');
      closedEl.textContent  = closed ? this._labels.closed : '';
      closedEl.style.display = closed ? 'flex' : 'none';
    }
    if (this._popupId) this._refreshPopupBtns();

    // Person icon: visible when at least 1 (non-exit) room is active
    const anyActive  = this._config.rooms.some(r => !r.is_exit && this._roomStatus(r) !== 'closed');
    const personEl = this.shadowRoot.getElementById('corridor-person');
    if (personEl) personEl.style.display = anyActive ? 'block' : 'none';

    // Arrows: only visible when a (non-exit) room is "free"
    const byPos = Object.fromEntries(this._config.rooms.map(r => [r.position, r]));
    const AREA_TO_POSITION = { bl: 'bottom-left', br: 'bottom-right', tr: 'top-right', tl: 'top-left' };
    Object.keys(AREA_TO_POSITION).forEach(area => {
      const arrow = this.shadowRoot.getElementById(`arrow-${area}`);
      if (!arrow) return;
      const room = byPos[AREA_TO_POSITION[area]];
      const show = room && !room.is_exit && this._roomStatus(room) === 'free';
      arrow.style.display = show ? 'block' : 'none';
    });
  }

  // ── One-time listeners ────────────────────────────────────────────────────

  _attachListeners() {
    // Rooms
    this.shadowRoot.querySelectorAll('[data-room-position]').forEach(el => {
      el.addEventListener('click', () => this._openPopup(el.dataset.roomPosition));
    });

    // Popup buttons
    ['free','appointment','occupied','reserved'].forEach(action => {
      const btn = this.shadowRoot.getElementById(`btn-${action}`);
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!this._hass || !this._popupId) return;
        const room = this._config.rooms.find(r => r.position === this._popupId);
        if (!room) return;
        const turnOn = this._roomStatus(room) !== action;
        this._closePopup();
        this._setRoomStatus(room, turnOn ? action : 'closed');
      });
    });

    // Close overlay on click outside the popup box
    const overlay = this.shadowRoot.getElementById('popup');
    overlay.addEventListener('click', e => {
      if (!e.target.closest('.popup-box')) this._closePopup();
    });
  }

  // ── Popup ────────────────────────────────────────────────────────────────

  _openPopup(position) {
    const room = this._config.rooms.find(r => r.position === position);
    if (!room) return;
    this._popupId = position;
    this.shadowRoot.getElementById('popup-title').textContent =
      room.person ? `${room.label} – ${room.person}` : room.label;
    this._refreshPopupBtns();
    this.shadowRoot.getElementById('popup').classList.add('open');
  }

  _refreshPopupBtns() {
    const room = this._config.rooms.find(r => r.position === this._popupId);
    const s = this._roomStatus(room);
    ['free','appointment','occupied','reserved'].forEach(a => {
      this.shadowRoot.getElementById(`btn-${a}`)
        .classList.toggle('active', a === s);
    });
  }

  _closePopup() {
    this._popupId = null;
    this.shadowRoot.getElementById('popup')?.classList.remove('open');
  }

  // ── Entity lookups ─────────────────────────────────────────────────────

  _roomStatus(room) {
    if (!room || !room.entity || !this._hass) return 'closed';
    const state = this._hass.states[room.entity]?.state;
    const VALID = ['occupied', 'appointment', 'free', 'reserved'];
    return VALID.includes(state) ? state : 'closed';
  }

  // Writes the new status into the room's single status entity — supports
  // input_select (select_option) and input_text (set_value); any other
  // domain falls back to input_text.set_value as a best effort.
  _setRoomStatus(room, value) {
    if (!room?.entity || !this._hass) return;
    const domain = room.entity.split('.')[0];
    if (domain === 'input_select') {
      this._hass.callService('input_select', 'select_option', { entity_id: room.entity, option: value });
    } else {
      this._hass.callService('input_text', 'set_value', { entity_id: room.entity, value });
    }
  }

  // ── HTML building blocks ──────────────────────────────────────────────────

  _exitHtml(area) {
    return `<div class="exit-quadrant" style="grid-area:${area}">
              <span class="exit-label">${esc(t(this._hass, 'emergencyExit'))}</span></div>`;
  }

  _roomHtml(room, area) {
    const { bg, dark } = STATUS_COLORS['closed']; // initial; _update() sets the actual color
    return `
      <div class="room" data-room-position="${esc(room.position)}"
           style="grid-area:${area}; background:linear-gradient(160deg,${bg},${dark})">
        <div class="room-top">
          <div class="room-label">${esc(room.label)}</div>
          <div class="room-divider"></div>
          <div class="room-person">${esc(room.person)}</div>
        </div>
        <div class="room-closed"></div>
        <div class="room-footer">
          <div class="room-status"></div>
        </div>
      </div>`;
  }

  _corridorHtml(rooms) {
    const byPos = Object.fromEntries(rooms.map(r => [r.position, r]));
    const bottom = this._config.corridor_person_bottom ?? 2;
    return `
      <div class="corridor" style="position:relative">
        <svg id="corridor-person" viewBox="0 0 20 20"
             style="display:none;position:absolute;left:50%;bottom:calc(${bottom}px * var(--scale,1));width:calc(34px * var(--scale,1));height:calc(34px * var(--scale,1));transform:translateX(-50%)">
          <path d="M10,4A4,4 0 0,1 14,8A4,4 0 0,1 10,12A4,4 0 0,1 6,8A4,4 0 0,1 10,4M10,13C13.87,13 17,14.57 17,16.5V18H3V16.5C3,14.57 6.13,13 10,13Z" fill="#455A64"/>
        </svg>
        <svg viewBox="0 0 60 220" xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="none"
             style="width:100%;height:100%;display:block;overflow:visible">
          <rect width="60" height="220" fill="#CFD8DC"/>

          <defs>
            <filter id="ashadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
            </filter>
          </defs>
          <style>${this._arrowAnimationCss()}</style>

          <!-- Arrow to bottom-left room: straight up, 90° left -->
          <g id="arrow-bl" style="display:none" filter="url(#ashadow)">
            <path d="M30,183 L30,165 L14,165"
                  stroke="#00C853" stroke-width="8" fill="none"
                  stroke-linecap="butt" stroke-linejoin="miter" pathLength="100" class="arrow-path"/>
            <polygon points="0,165 16,157 16,173" fill="#00C853" class="arrow-head"/>
          </g>

          <!-- Arrow to bottom-right room: straight up, 90° right -->
          <g id="arrow-br" style="display:none" filter="url(#ashadow)">
            <path d="M30,183 L30,165 L46,165"
                  stroke="#00C853" stroke-width="8" fill="none"
                  stroke-linecap="butt" stroke-linejoin="miter" pathLength="100" class="arrow-path"/>
            <polygon points="60,165 44,157 44,173" fill="#00C853" class="arrow-head"/>
          </g>

          <!-- Arrow to top-right room: straight up, 90° right at top -->
          <g id="arrow-tr" style="display:none" filter="url(#ashadow)">
            <path d="M30,183 L30,55 L46,55"
                  stroke="#00C853" stroke-width="8" fill="none"
                  stroke-linecap="butt" stroke-linejoin="miter" pathLength="100" class="arrow-path"/>
            <polygon points="60,55 44,47 44,63" fill="#00C853" class="arrow-head"/>
          </g>

          <!-- Arrow to top-left room: straight up, 90° left at top -->
          <g id="arrow-tl" style="display:none" filter="url(#ashadow)">
            <path d="M30,183 L30,55 L14,55"
                  stroke="#00C853" stroke-width="8" fill="none"
                  stroke-linecap="butt" stroke-linejoin="miter" pathLength="100" class="arrow-path"/>
            <polygon points="0,55 16,47 16,63" fill="#00C853" class="arrow-head"/>
          </g>

        </svg>
      </div>`;
  }
}

customElements.define('lutarym-room-status-card', LutarymRoomStatusCard);

// ── Visual config editor ────────────────────────────────────────────────

class LutarymRoomStatusCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config, rooms: (config.rooms || []).map(r => ({ ...r })) };
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._render();
    } else {
      this.querySelectorAll('ha-selector').forEach(sel => { sel.hass = hass; });
    }
  }

  _fireChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  _onChange(field, value, isNumber) {
    if (value === '' || value == null) {
      delete this._config[field];
    } else {
      this._config[field] = isNumber ? Number(value) : value;
    }
    this._fireChanged();
  }

  _onStatusLabelChange(key, value) {
    const labels = { ...(this._config.status_labels || {}) };
    if (value === '' || value == null) delete labels[key];
    else labels[key] = value;
    if (Object.keys(labels).length) this._config.status_labels = labels;
    else delete this._config.status_labels;
    this._fireChanged();
  }

  _onRoomChange(index, field, value) {
    this._config.rooms[index][field] = value;
    this._fireChanged();
  }

  _addRoom() {
    if (this._config.rooms.length >= 4) return;
    const usedPositions = new Set(this._config.rooms.map(r => r.position));
    const allPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const nextPosition = allPositions.find(p => !usedPositions.has(p)) || 'top-left';
    this._config.rooms.push({ id: '', label: '', person: '', position: nextPosition });
    this._render();
    this._fireChanged();
  }

  _removeRoom(index) {
    this._config.rooms.splice(index, 1);
    this._render();
    this._fireChanged();
  }

  _textRow(label, field, value, placeholder, hintText) {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML = `<label>${label}</label>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value ?? '';
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener('change', ev => this._onChange(field, ev.target.value));
    wrap.appendChild(input);
    if (hintText) {
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = hintText;
      wrap.appendChild(hint);
    }
    return wrap;
  }

  _numberRow(label, field, value, placeholder, step) {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML = `<label>${label}</label>`;
    const input = document.createElement('input');
    input.type = 'number';
    input.step = step ?? 'any';
    if (value != null) input.value = value;
    if (placeholder != null) input.placeholder = String(placeholder);
    input.addEventListener('change', ev => this._onChange(field, ev.target.value, true));
    wrap.appendChild(input);
    return wrap;
  }

  _selectRow(label, field, value, options, onChangeFn) {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML = `<label>${label}</label>`;
    const select = document.createElement('select');
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (String(opt.value) === String(value)) o.selected = true;
      select.appendChild(o);
    });
    select.addEventListener('change', ev => (onChangeFn ? onChangeFn(ev.target.value) : this._onChange(field, ev.target.value)));
    wrap.appendChild(select);
    return wrap;
  }

  // Entity picker for a single room's status entity (occupied/appointment/
  // free), filtered to the input_boolean domain since that's what the
  // card expects. Writes into the specific room object via _onRoomChange.
  // Entity picker for a room's single status entity — a text or select
  // helper whose state directly holds the status ("occupied" /
  // "appointment" / "free" / "closed"). Writes into the specific room
  // object via _onRoomChange.
  _roomEntityRow(label, roomIndex, field, value) {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML = `<label>${label}</label>`;
    const selector = document.createElement('ha-selector');
    selector.hass = this._hass;
    selector.selector = { entity: { domain: ['input_text', 'input_select'] } };
    selector.value = value ?? '';
    selector.addEventListener('value-changed', ev => {
      ev.stopPropagation();
      this._onRoomChange(roomIndex, field, ev.detail.value || '');
    });
    wrap.appendChild(selector);
    return wrap;
  }

  _checkboxRow(label, field, value, defaultTrue) {
    const wrap = document.createElement('div');
    wrap.className = 'row checkbox-row';
    const l = document.createElement('label');
    l.textContent = label;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value != null ? !!value : !!defaultTrue;
    input.addEventListener('change', ev => this._onChange(field, ev.target.checked));
    wrap.appendChild(input);
    wrap.appendChild(l);
    return wrap;
  }

  _statusLabelRow(label, key, value, placeholder) {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML = `<label>${label}</label>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value ?? '';
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener('change', ev => this._onStatusLabelChange(key, ev.target.value));
    wrap.appendChild(input);
    return wrap;
  }

  _sideBySide(...rows) {
    const wrap = document.createElement('div');
    wrap.className = 'row-pair';
    rows.forEach(row => wrap.appendChild(row));
    return wrap;
  }

  _render() {
    if (!this._config) return;
    const cfg = this._config;
    const hass = this._hass;

    this.innerHTML = `
      <style>
        .form { display: flex; flex-direction: column; gap: 14px; padding: 4px 0; }
        .row { display: flex; flex-direction: column; gap: 4px; }
        .row label { font-size: 13px; font-weight: 500; color: var(--primary-text-color); }
        .row input[type="text"], .row input[type="number"], .row select {
          padding: 8px 10px; border: 1px solid var(--divider-color, #ccc);
          border-radius: 6px; background: var(--card-background-color, #fff);
          color: var(--primary-text-color); font-size: 14px; box-sizing: border-box;
        }
        .checkbox-row { flex-direction: row; align-items: center; gap: 8px; }
        .checkbox-row label { font-weight: 400; }
        .row-pair { display: flex; gap: 16px; }
        .row-pair > .row { flex: 1; min-width: 0; }
        .section-label {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--secondary-text-color);
          border-top: 1px solid var(--divider-color, #e0e0e0);
          padding-top: 12px; margin-top: 4px;
        }
        .hint { font-size: 11px; color: var(--secondary-text-color); }
        .helpers-hint {
          font-size: 12px;
          line-height: 1.5;
          color: var(--primary-text-color);
          background: rgba(3,169,244,.08);
          border: 1px solid rgba(3,169,244,.25);
          border-radius: 8px;
          padding: 10px 12px;
        }
        .room-card {
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px; padding: 10px; display: flex;
          flex-direction: column; gap: 8px;
        }
        .room-header { display: flex; justify-content: space-between; align-items: center; }
        .room-header span { font-size: 12px; color: var(--secondary-text-color); font-weight: 600; }
        .remove-btn {
          font-size: 11px; color: var(--error-color, #c62828);
          background: none; border: none; cursor: pointer; padding: 2px 6px;
        }
        .remove-btn:hover { text-decoration: underline; }
        .add-btn {
          padding: 8px 12px; border: 1px dashed var(--divider-color, #ccc);
          border-radius: 6px; background: none; color: var(--primary-color, #03a9f4);
          font-size: 13px; cursor: pointer;
        }
        .add-btn:hover { background: rgba(3,169,244,.08); }
        .add-btn:disabled { opacity: .4; cursor: default; }
        .rooms-list { display: flex; flex-direction: column; gap: 10px; }
      </style>
      <div class="form"></div>
    `;
    const form = this.querySelector('.form');

    form.appendChild(this._sideBySide(
      this._numberRow(t(hass, 'editorCorridorWidth'), 'corridor_width', cfg.corridor_width ?? 68, 68),
      this._selectRow(t(hass, 'editorArrowAnimation'), 'arrow_animation', cfg.arrow_animation ?? 1, [
        { value: '1', label: t(hass, 'anim1') }, { value: '2', label: t(hass, 'anim2') },
        { value: '3', label: t(hass, 'anim3') }, { value: '4', label: t(hass, 'anim4') },
        { value: '5', label: t(hass, 'anim5') }, { value: '6', label: t(hass, 'anim6') },
        { value: '7', label: t(hass, 'anim7') }, { value: '8', label: t(hass, 'anim8') },
        { value: '9', label: t(hass, 'anim9') }, { value: '10', label: t(hass, 'anim10') },
      ], v => this._onChange('arrow_animation', v, true)),
    ));

    const fontLabel = document.createElement('div');
    fontLabel.className = 'section-label';
    fontLabel.textContent = t(hass, 'sectionFontSizes');
    form.appendChild(fontLabel);
    form.appendChild(this._sideBySide(
      this._numberRow(t(hass, 'editorFontLabel'), 'font_size_label', cfg.font_size_label ?? 1.2, 1.2, '0.05'),
      this._numberRow(t(hass, 'editorFontPerson'), 'font_size_person', cfg.font_size_person ?? 0.88, 0.88, '0.05'),
    ));
    form.appendChild(this._sideBySide(
      this._numberRow(t(hass, 'editorFontStatus'), 'font_size_status', cfg.font_size_status ?? 1.05, 1.05, '0.05'),
      this._numberRow(t(hass, 'editorFontClosed'), 'font_size_closed', cfg.font_size_closed ?? 1.2, 1.2, '0.05'),
    ));

    const labelsLabel = document.createElement('div');
    labelsLabel.className = 'section-label';
    labelsLabel.textContent = t(hass, 'sectionLabels');
    form.appendChild(labelsLabel);
    const sl = cfg.status_labels || {};
    form.appendChild(this._sideBySide(
      this._statusLabelRow(t(hass, 'editorLabelFree'), 'free', sl.free, t(hass, 'statusFree')),
      this._statusLabelRow(t(hass, 'editorLabelAppointment'), 'appointment', sl.appointment, t(hass, 'statusAppointment')),
    ));
    form.appendChild(this._sideBySide(
      this._statusLabelRow(t(hass, 'editorLabelOccupied'), 'occupied', sl.occupied, t(hass, 'statusOccupied')),
      this._statusLabelRow(t(hass, 'editorLabelReserved'), 'reserved', sl.reserved, t(hass, 'statusReserved')),
    ));
    form.appendChild(this._statusLabelRow(t(hass, 'editorLabelClosed'), 'closed', sl.closed, t(hass, 'statusClosed')));

    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'section-label';
    sectionLabel.textContent = t(hass, 'sectionRooms', { count: cfg.rooms.length });
    form.appendChild(sectionLabel);

    const roomsHint = document.createElement('div');
    roomsHint.className = 'hint';
    roomsHint.textContent = t(hass, 'roomsHint');
    form.appendChild(roomsHint);

    const helpersHint = document.createElement('div');
    helpersHint.className = 'helpers-hint';
    helpersHint.textContent = t(hass, 'helpersHint');
    form.appendChild(helpersHint);

    const roomsList = document.createElement('div');
    roomsList.className = 'rooms-list';

    const positionOptions = [
      { value: 'top-left', label: t(hass, 'posTopLeft') },
      { value: 'top-right', label: t(hass, 'posTopRight') },
      { value: 'bottom-left', label: t(hass, 'posBottomLeft') },
      { value: 'bottom-right', label: t(hass, 'posBottomRight') },
    ];

    cfg.rooms.forEach((room, i) => {
      const roomCard = document.createElement('div');
      roomCard.className = 'room-card';

      const header = document.createElement('div');
      header.className = 'room-header';
      const headerLabel = document.createElement('span');
      headerLabel.textContent = t(hass, 'roomHeaderLabel', { n: i + 1 });
      header.appendChild(headerLabel);
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = t(hass, 'removeLabel');
      removeBtn.addEventListener('click', () => this._removeRoom(i));
      header.appendChild(removeBtn);
      roomCard.appendChild(header);

      roomCard.appendChild(this._selectRow(
        t(hass, 'editorRoomPosition'), null, room.position ?? 'top-left', positionOptions,
        v => this._onRoomChange(i, 'position', v),
      ));

      const exitCheckboxRow = document.createElement('div');
      exitCheckboxRow.className = 'row checkbox-row';
      const exitLabel = document.createElement('label');
      exitLabel.textContent = t(hass, 'editorRoomIsExit');
      const exitCheckbox = document.createElement('input');
      exitCheckbox.type = 'checkbox';
      exitCheckbox.checked = !!room.is_exit;
      exitCheckbox.addEventListener('change', ev => {
        this._onRoomChange(i, 'is_exit', ev.target.checked);
        this._render(); // structural change: show/hide the fields below
      });
      exitCheckboxRow.appendChild(exitCheckbox);
      exitCheckboxRow.appendChild(exitLabel);
      roomCard.appendChild(exitCheckboxRow);

      // Label/person/entity are irrelevant for the Emergency Exit quadrant
      if (!room.is_exit) {
        const labelRow = document.createElement('div');
        labelRow.className = 'row';
        labelRow.innerHTML = `<label>${t(hass, 'editorRoomLabel')}</label>`;
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = room.label ?? '';
        labelInput.placeholder = 'Room 1';
        labelInput.addEventListener('change', ev => this._onRoomChange(i, 'label', ev.target.value));
        labelRow.appendChild(labelInput);
        roomCard.appendChild(labelRow);

        const personRow = document.createElement('div');
        personRow.className = 'row';
        personRow.innerHTML = `<label>${t(hass, 'editorRoomPerson')}</label>`;
        const personInput = document.createElement('input');
        personInput.type = 'text';
        personInput.value = room.person ?? '';
        personInput.addEventListener('change', ev => this._onRoomChange(i, 'person', ev.target.value));
        personRow.appendChild(personInput);
        roomCard.appendChild(personRow);

        roomCard.appendChild(this._roomEntityRow(t(hass, 'editorRoomEntity'), i, 'entity', room.entity));
      }

      roomsList.appendChild(roomCard);
    });

    form.appendChild(roomsList);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-btn';
    addBtn.textContent = t(hass, 'addRoomLabel');
    addBtn.disabled = cfg.rooms.length >= 4;
    addBtn.addEventListener('click', () => this._addRoom());
    form.appendChild(addBtn);
  }
}

customElements.define('lutarym-room-status-card-editor', LutarymRoomStatusCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'lutarym-room-status-card',
  name: 'Room Status by Lutarym',
  description: 'Office floor-plan card showing room status (occupied/appointment/free/reserved/closed) with animated wayfinding arrows and a tap-to-change popup.',
});

console.info(
  `%c ROOM-STATUS-CARD %c v${VERSION} `,
  'background:#1565C0;color:#fff;padding:2px 8px;border-radius:3px 0 0 3px;font-weight:bold',
  'background:#00C853;color:#fff;padding:2px 8px;border-radius:0 3px 3px 0;font-weight:bold'
);
