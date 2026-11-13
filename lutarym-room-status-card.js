/**
 * lutarym-room-status-card.js
 * Lovelace custom card: office room status floor plan
 *
 * Shows up to 4 rooms arranged around a central corridor (top-left,
 * top-right, bottom-left, bottom-right), each colored by status
 * (frei / nicht besetzt / belegt / reserviert / geschlossen), with an
 * animated arrow pointing toward rooms whose status has wayfinding enabled,
 * a person icon in the corridor when any room is active, and a popup (tap a
 * room) to change its status. Each room's status is stored in one text or
 * select helper (`input_text` or `input_select`) picked per room in the
 * visual editor.
 *
 * Below the floor plan there are three optional blocks: a warning banner
 * (image and text), text box 1 (text only) and text box 2 (image and text).
 * The two text boxes take their text from an entity and hide when it is empty.
 *
 * INSTALLATION
 *   1. Copy the file to /config/www/lutarym-room-status-card.js
 *   2. Settings > Dashboards > Resources > Add resource:
 *        URL:  /local/lutarym-room-status-card.js
 *        Type: JavaScript Module
 *   3. Clear your browser cache (Ctrl+F5)
 *   4. Create one text or dropdown helper per room. Its state must be
 *      "frei", "nicht besetzt", "belegt", "reserviert" or "geschlossen"
 *      (case does not matter); a dropdown helper needs all five as options.
 *      Then pick it per room in the visual editor.
 *
 * CONFIGURATION (all optional except rooms)
 *   type: custom:lutarym-room-status-card
 *   corridor_width: 68            # px
 *   room_height: 250              # px, fixed height of the floor plan
 *   card_height:                  # px, empty = automatic
 *   arrow_animation: 1            # 1-10
 *   font_size_label: 1.2          # em
 *   font_size_person: 0.88        # em
 *   font_size_status: 1.05        # em
 *   font_size_closed: 1.2         # em
 *   person_icon_size: 34          # px
 *   status_show_wayfinding:       # default: arrows only for "frei"
 *     frei: true
 *     reserviert: true
 *   warning_banner:
 *     enabled: true
 *     image_path: /local/Stop.png
 *     image_size: 100             # px
 *     font_size: 16               # px
 *     text_align: left            # left | center | right | justify
 *     text: Bitte erst eintreten wenn der Raum frei ist
 *     show_when: belegt           # immer | status that all rooms must have
 *                                 # (closed rooms are skipped)
 *   info_box:                     # text box 1
 *     entity: input_text.hinweis
 *     font_size: 18               # px
 *     height: 80                  # px
 *     font_family: theme          # see FONTS below
 *     font_weight: normal         # normal | semibold | bold
 *     italic: true
 *     underline: true
 *   info_box_2:                   # text box 2, image left, text right
 *     entity: input_text.hinweis_2
 *     image_path: /local/Info.png # empty = text only
 *     image_size: 100
 *     font_size: 16
 *     text_align: left
 *     font_family: theme
 *     font_weight: semibold       # normal | semibold | bold
 *     italic: true
 *     underline: true
 *   rooms:                        # REQUIRED, 1-4 rooms
 *     - label: Raum 1
 *       person: Max Mustermann
 *       position: bottom-left     # top-left | top-right | bottom-left | bottom-right
 *       entity: input_select.raum1_status
 *     - position: top-left        # emergency exit, needs no label or entity
 *       is_exit: true
 */

const VERSION = '2.0.0';

// ── Simple i18n helper (falls back to English) ─────────────────────────

const I18N = {
  en: {
    emergencyExit: 'Emergency Exit',
    statusFree: 'Free',
    statusAppointment: 'Not occupied',
    sectionWarningBanner: 'Warning banner',
    editorBannerEnabled: 'Show warning banner',
    editorImagePath: 'Image path',
    editorImageSize: 'Image size (px)',
    editorWarningFontSize: 'Text size (px)',
    editorWarningText: 'Warning text',
    editorTextAlign: 'Text alignment',
    alignLeft: 'Left',
    alignCenter: 'Centered',
    alignRight: 'Right',
    alignJustify: 'Justified',
    editorShowWhen: 'Show banner when',
    showWhenAlways: 'Always show',
    editorShowWhenHint: 'The banner only appears once all rooms have this status. Closed rooms are skipped, except when "Closed" is selected.',
    sectionInfoBox: 'Text box 1',
    sectionInfoBox2: 'Text box 2 (image and text)',
    editorInfoBox2Hint: 'Image left, text right, same as the warning banner. Leave the image path empty for text only. The block is hidden when the entity state is empty.',
    editorInfoBoxEntity: 'Text box entity',
    editorInfoBoxFontSize: 'Font size (px)',
    editorInfoBoxHeight: 'Height (px)',
    editorInfoBoxHint: 'The text box shows this entity\u2019s state. When the state is empty, the box is hidden.',
    noImage: 'no image',
    editorFontFamily: 'Font',
    editorFontWeight: 'Font weight',
    weightNormal: 'Normal',
    weightSemibold: 'Semibold',
    weightBold: 'Bold',
    editorItalic: 'Italic',
    editorUnderline: 'Underlined',
    fontTheme: 'Default (theme)',
    fontSans: 'Sans serif (system)',
    fontSerif: 'Serif (system)',
    fontMono: 'Monospace (system)',
    editorFontHint: 'The font must be installed on the display device, otherwise a similar one is used.',
    alignJustifyHint: 'Justified only affects text with several lines. The last line stays left-aligned.',
    setFailed: 'Could not set "{raum}" to "{status}": {grund}',
    roomInvalid: 'Every entry under "rooms" must be a room, e.g. with position and entity.',
    roomHidden: 'This room is not shown because its position is used twice or is invalid.',
    statusOccupied: 'Occupied',
    statusReserved: 'Reserved',
    statusClosed: 'Closed',
    roomsMissing: '"rooms" (array) is required.',
    editorCorridorWidth: 'Corridor width (px)',
    editorPersonIconSize: 'Person icon size (px)',
    editorRoomHeight: 'Floor plan height (px)',
    editorCardHeight: 'Card height (px)',
    automatic: 'automatic',
    editorCardHeightHint: 'Leave empty to let the card determine its height. Enter a value to set the height Home Assistant reserves for this card. If the card was resized by dragging in the sections layout, that size takes precedence.',
    editorArrowAnimation: 'Arrow animation',
    anim1: '1 – Draw', anim2: '2 – Pulse', anim3: '3 – Blink', anim4: '4 – Glow', anim5: '5 – Bounce',
    anim6: '6 – Flow', anim7: '7 – Wave', anim8: '8 – Chase', anim9: '9 – Dots', anim10: '10 – Runlight',
    sectionFontSizes: 'Font Sizes (em)',
    editorFontLabel: 'Room label',
    editorFontPerson: 'Person name',
    editorFontStatus: 'Status text',
    editorFontClosed: 'Closed text',
    sectionLabels: 'Status Labels & Wayfinding',
    editorShowWayfinding: 'Show wayfinding arrows',
    editorLabelFree: 'Label: Free',
    editorLabelAppointment: 'Label: Not occupied',
    editorLabelOccupied: 'Label: Occupied',
    editorLabelReserved: 'Label: Reserved',
    editorLabelClosed: 'Label: Closed',
    sectionRooms: 'Rooms ({count}/4)',
    roomsHint: 'Up to 4 rooms, one per corner of the floor plan. Mark one as the Emergency Exit instead of a bookable room if needed.',
    helpersHint: 'For each room, create one text or select helper in Home Assistant that holds the status as text: Settings → Devices & Services → Helpers → + Add Helper → Text (or Dropdown). Its state must be "frei", "nicht besetzt", "belegt", "reserviert" or "geschlossen" (case does not matter); a dropdown helper needs all five as options. Then select it below.',
    roomHeaderLabel: 'Room {n}',
    removeLabel: 'Remove',
    addRoomLabel: '+ Add room',
    editorRoomLabel: 'Label',
    editorRoomPerson: 'Person (optional)',
    editorRoomPosition: 'Position',
    editorRoomEntity: 'Status entity (text or select helper)',
    editorRoomIsExit: 'This is the Emergency Exit (not a bookable room)',
    posTopLeft: 'Top left', posTopRight: 'Top right', posBottomLeft: 'Bottom left', posBottomRight: 'Bottom right',
    posChoose: 'Please choose',
    cardName: 'Room Status by Lutarym',
    cardDescription: 'Office floor-plan card showing room status (frei/nicht besetzt/belegt/reserviert/geschlossen) with animated wayfinding arrows and a tap-to-change popup.',
  },
  de: {
    emergencyExit: 'Notausgang',
    statusFree: 'Frei',
    statusAppointment: 'Nicht besetzt',
    sectionWarningBanner: 'Warnhinweis',
    editorBannerEnabled: 'Warnhinweis anzeigen',
    editorImagePath: 'Bildpfad',
    editorImageSize: 'Bildgr\u00f6\u00dfe (px)',
    editorWarningFontSize: 'Schriftgr\u00f6\u00dfe (px)',
    editorWarningText: 'Warntext',
    editorTextAlign: 'Textausrichtung',
    alignLeft: 'Linksb\u00fcndig',
    alignCenter: 'Zentriert',
    alignRight: 'Rechtsb\u00fcndig',
    alignJustify: 'Blockb\u00fcndig',
    editorShowWhen: 'Banner anzeigen bei',
    showWhenAlways: 'Dauerhaft anzeigen',
    editorShowWhenHint: 'Das Banner erscheint erst, wenn alle Räume diesen Status haben. Geschlossene Räume werden dabei übersprungen, außer bei „Geschlossen“.',
    sectionInfoBox: 'Textfeld 1',
    sectionInfoBox2: 'Textfeld 2 (Bild und Text)',
    editorInfoBox2Hint: 'Bild links, Text rechts, wie beim Warnhinweis. Bildpfad leer lassen für reinen Text. Ist der Zustand der Entität leer, wird der Block ausgeblendet.',
    editorInfoBoxEntity: 'Entit\u00e4t f\u00fcr Textfeld',
    editorInfoBoxFontSize: 'Schriftgr\u00f6\u00dfe (px)',
    editorInfoBoxHeight: 'H\u00f6he (px)',
    editorInfoBoxHint: 'Das Textfeld zeigt den Zustand dieser Entit\u00e4t. Ist der Zustand leer, wird das Feld ausgeblendet.',
    noImage: 'kein Bild',
    editorFontFamily: 'Schriftart',
    editorFontWeight: 'Schriftst\u00e4rke',
    weightNormal: 'Normal',
    weightSemibold: 'Halbfett',
    weightBold: 'Fett',
    editorItalic: 'Kursiv',
    editorUnderline: 'Unterstrichen',
    fontTheme: 'Standard (Theme)',
    fontSans: 'Serifenlos (System)',
    fontSerif: 'Mit Serifen (System)',
    fontMono: 'Festbreite (System)',
    editorFontHint: 'Die Schrift muss auf dem Anzeigeger\u00e4t vorhanden sein, sonst wird eine \u00e4hnliche verwendet.',
    alignJustifyHint: 'Blockb\u00fcndig wirkt nur bei mehrzeiligem Text. Die letzte Zeile bleibt linksb\u00fcndig.',
    setFailed: 'Status f\u00fcr \u201e{raum}\u201c konnte nicht auf \u201e{status}\u201c gesetzt werden: {grund}',
    roomInvalid: 'Jeder Eintrag unter "rooms" muss ein Raum sein, z. B. mit position und entity.',
    roomHidden: 'Dieser Raum wird nicht angezeigt, weil seine Position doppelt vergeben oder ung\u00fcltig ist.',
    statusOccupied: 'Belegt',
    statusReserved: 'Reserviert',
    statusClosed: 'Geschlossen',
    roomsMissing: 'Pflichtfeld "rooms" (Array) fehlt.',
    editorCorridorWidth: 'Flurbreite (px)',
    editorPersonIconSize: 'Größe Personensymbol (px)',
    editorRoomHeight: 'Höhe Raumplan (px)',
    editorCardHeight: 'Kartenhöhe (px)',
    automatic: 'automatisch',
    editorCardHeightHint: 'Leer lassen, damit die Karte ihre Höhe selbst ermittelt. Ein Wert legt fest, wie viel Platz Home Assistant für diese Karte reserviert. Wurde die Karte im Abschnitte-Layout per Ziehen in der Größe geändert, hat diese Größe Vorrang.',
    editorArrowAnimation: 'Pfeil-Animation',
    anim1: '1 – Zeichnen', anim2: '2 – Pulsieren', anim3: '3 – Blinken', anim4: '4 – Glühen', anim5: '5 – Springen',
    anim6: '6 – Fließen', anim7: '7 – Welle', anim8: '8 – Chase', anim9: '9 – Punkte', anim10: '10 – Lauflicht',
    sectionFontSizes: 'Schriftgrößen (em)',
    editorFontLabel: 'Raumbeschriftung',
    editorFontPerson: 'Personenname',
    editorFontStatus: 'Statustext',
    editorFontClosed: 'Geschlossen-Text',
    sectionLabels: 'Status-Beschriftungen & Leitsystem',
    editorShowWayfinding: 'Leitsystem-Pfeile anzeigen',
    editorLabelFree: 'Beschriftung: Frei',
    editorLabelAppointment: 'Beschriftung: Nicht besetzt',
    editorLabelOccupied: 'Beschriftung: Belegt',
    editorLabelReserved: 'Beschriftung: Reserviert',
    editorLabelClosed: 'Beschriftung: Geschlossen',
    sectionRooms: 'Räume ({count}/4)',
    roomsHint: 'Bis zu 4 Räume, je einer pro Ecke des Grundrisses. Einen davon kannst du statt als buchbaren Raum als Notausgang markieren.',
    helpersHint: 'Für jeden Raum wird ein Text- oder Auswahl-Helfer in Home Assistant benötigt, der den Status als Text enthält: Einstellungen → Geräte & Dienste → Helfer → + Helfer hinzufügen → Text (oder Dropdown). Der Zustand muss "frei", "nicht besetzt", "belegt", "reserviert" oder "geschlossen" lauten, Groß- und Kleinschreibung spielt keine Rolle. Ein Dropdown-Helfer braucht alle fünf als Optionen. Anschließend unten auswählen.',
    roomHeaderLabel: 'Raum {n}',
    removeLabel: 'Entfernen',
    addRoomLabel: '+ Raum hinzufügen',
    editorRoomLabel: 'Beschriftung',
    editorRoomPerson: 'Person (optional)',
    editorRoomPosition: 'Position',
    editorRoomEntity: 'Status-Entity (Text- oder Auswahl-Helfer)',
    editorRoomIsExit: 'Dies ist der Notausgang (kein buchbarer Raum)',
    posTopLeft: 'Oben links', posTopRight: 'Oben rechts', posBottomLeft: 'Unten links', posBottomRight: 'Unten rechts',
    posChoose: 'Bitte w\u00e4hlen',
    cardName: 'Room Status by Lutarym',
    cardDescription: 'Grundriss-Karte mit Raumstatus (Belegt/Nicht besetzt/Frei/Reserviert/Geschlossen), animierten Wegweiser-Pfeilen und Popup zum Statuswechsel per Tap.',
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

// The single list of status values, in popup order. Every other place in the
// code derives from it, so a renamed status cannot be missed somewhere.
const STATUSES = ['frei', 'nicht besetzt', 'belegt', 'reserviert', 'geschlossen'];

// Status colors are language-independent; labels come from I18N/status_labels.
// `text` is the text color on top of the status color.
const STATUS_COLORS = {
  frei:            { bg: '#00C853', dark: '#009624', text: '#fff' },
  'nicht besetzt': { bg: '#FFD600', dark: '#F9A800', text: '#1A1A1A' },
  belegt:          { bg: '#F50000', dark: '#B00000', text: '#fff' },
  reserviert:      { bg: '#2196F3', dark: '#0D47A1', text: '#fff' },
  geschlossen:     { bg: '#546E7A', dark: '#37474F', text: '#fff' },
};

// I18N key of each status's default label.
const STATUS_LABEL_KEYS = {
  frei: 'statusFree',
  'nicht besetzt': 'statusAppointment',
  belegt: 'statusOccupied',
  reserviert: 'statusReserved',
  geschlossen: 'statusClosed',
};

const ALIGN_VALUES = ['left', 'center', 'right', 'justify'];

const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const DEFAULT_WARNING_TEXT = 'Bitte erst eintreten wenn der Raum frei ist';

// Fonts selectable for the text boxes. "theme" keeps the dashboard font.
// Every stack ends in a generic family, so a font that is missing on the
// display device falls back to a similar one instead of the browser default.
// Entries with `i18n` get a translated label, the others show their name.
const FONTS = [
  { key: 'theme',     i18n: 'fontTheme', stack: '' },
  { key: 'roboto',    label: 'Roboto',          stack: 'Roboto, Noto, sans-serif' },
  { key: 'arial',     label: 'Arial',           stack: 'Arial, Helvetica, sans-serif' },
  { key: 'verdana',   label: 'Verdana',         stack: 'Verdana, Geneva, sans-serif' },
  { key: 'tahoma',    label: 'Tahoma',          stack: 'Tahoma, Verdana, sans-serif' },
  { key: 'trebuchet', label: 'Trebuchet MS',    stack: '"Trebuchet MS", Helvetica, sans-serif' },
  { key: 'georgia',   label: 'Georgia',         stack: 'Georgia, "Times New Roman", serif' },
  { key: 'times',     label: 'Times New Roman', stack: '"Times New Roman", Times, serif' },
  { key: 'courier',   label: 'Courier New',     stack: '"Courier New", Courier, monospace' },
  { key: 'sans',      i18n: 'fontSans',  stack: 'sans-serif' },
  { key: 'serif',     i18n: 'fontSerif', stack: 'serif' },
  { key: 'mono',      i18n: 'fontMono',  stack: 'monospace' },
];
const FONT_STACKS = Object.fromEntries(FONTS.map(f => [f.key, f.stack]));
const FONT_WEIGHTS = { normal: 400, semibold: 600, bold: 700 };

// Own-property lookup, so a config value like "constructor" cannot pick up
// something from Object.prototype.
function own(map, key) {
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
}

// Positive number from the configuration, otherwise the fallback. Catches
// typos such as "1,2" (decimal comma), 0, negative values or text, which
// would otherwise end up as invalid CSS.
function positiv(wert, fallback) {
  const n = Number(wert);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// Comparable form of a status value: trimmed, inner whitespace collapsed,
// lower case. Helper options like "Belegt" or "nicht  besetzt " match too.
function normStatus(v) {
  return String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Writes each distinct warning to the console only once per page load.
// setConfig runs on every edit in the editor preview, and states are read on
// every update, so unguarded warnings would flood the console.
const GEWARNT = new Set();
function warneEinmal(text) {
  if (GEWARNT.has(text)) return;
  GEWARNT.add(text);
  console.warn(`[lutarym-room-status-card] ${text}`);
}

// English keys and values of the original card, mapped to the German ones.
const ALT_EN = {
  free: 'frei', occupied: 'belegt', appointment: 'nicht besetzt',
  reserved: 'reserviert', closed: 'geschlossen',
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Status values may contain spaces ("nicht besetzt"), DOM ids may not.
function slug(s) {
  return String(s ?? '').replace(/\s+/g, '-');
}

class LutarymRoomStatusCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built     = false;   // DOM built once already?
    this._hass      = null;
    this._config    = null;
    this._popupId   = null;
    this._byPos     = {};      // position -> the room actually rendered there
    this._observers = [];      // active ResizeObservers
  }

  connectedCallback() {
    if (this._built) this._observeSize();
  }

  disconnectedCallback() {
    this._unobserve();
  }

  setConfig(config) {
    if (!Array.isArray(config?.rooms) || !config.rooms.length)
      throw new Error(t(this._hass, 'roomsMissing'));
    // An empty YAML list entry ("- " with nothing after it) arrives as null.
    // Without this check it would fail later with a cryptic error.
    if (config.rooms.some(r => !r || typeof r !== 'object' || Array.isArray(r)))
      throw new Error(t(this._hass, 'roomInvalid'));
    this._warneAlteSchluessel(config);
    this._config = config;
    this._built = false;
    this._measuredHeight = null; // previous measurement no longer applies
    // Rebuild right away when hass is already available. Waiting for the next
    // hass assignment would leave the card showing its previous state until
    // some entity happens to change.
    if (this._hass) this._build();
  }

  // Settings copied from the English original card use English keys, which
  // this card no longer reads. Name them in the console instead of ignoring
  // them silently.
  _warneAlteSchluessel(config) {
    const alte = [];
    for (const feld of ['status_labels', 'status_show_wayfinding']) {
      const obj = config[feld];
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(k => {
          if (own(ALT_EN, k)) alte.push(`${feld}.${k} → ${feld}.${ALT_EN[k]}`);
        });
      }
    }
    const sw = config.warning_banner?.show_when;
    if (typeof sw === 'string' && own(ALT_EN, sw)) alte.push(`warning_banner.show_when: ${sw} → ${ALT_EN[sw]}`);
    if (alte.length) {
      warneEinmal(`Englische Einstellungen aus der Originalkarte werden ignoriert. Bitte umbenennen: ${alte.join(', ')}`);
    }
  }

  set hass(hass) {
    const alt = this._hass;
    this._hass = hass;
    if (!this._built) { this._build(); return; }
    // Labels are built into the DOM, so another UI language needs a rebuild.
    if (alt && alt.language !== hass.language) { this._build(); return; }
    if (this._relevantChanged(alt, hass)) this._update();
  }

  // Home Assistant sets hass on every state change of any entity. Only the
  // entities this card shows matter. An entity's state object is replaced
  // exactly when that entity changes, so comparing objects is enough; Home
  // Assistant's own cards check for changes the same way.
  _relevantChanged(alt, neu) {
    if (!alt) return true;
    return this._watchedEntities().some(id => alt.states[id] !== neu.states[id]);
  }

  _watchedEntities() {
    const c = this._config || {};
    const ids = (c.rooms || []).filter(r => !r.is_exit && r.entity).map(r => r.entity);
    if (c.info_box?.entity)   ids.push(c.info_box.entity);
    if (c.info_box_2?.entity) ids.push(c.info_box_2.entity);
    return ids;
  }

  // Rooms that are actually rendered (one per position).
  _rooms() {
    return Object.values(this._byPos);
  }

  // Height the card reports to Home Assistant in the masonry layout, in units
  // of 50px. Banner and text boxes add real height below the floor plan, so
  // they are part of it.
  getCardSize() {
    return Math.ceil(this._contentHeight() / 50);
  }

  // Height of the whole card in pixels, in order of priority:
  //   1. card_height from the configuration, if the user set one
  //   2. the measured height, once the card has rendered at least once
  //   3. an estimate from the configured values
  _contentHeight() {
    const c = this._config || {};
    const manuell = positiv(c.card_height, null);
    if (manuell) return manuell;

    if (this._measuredHeight > 0) return this._measuredHeight;

    // Floor plan, plus 2px for ha-card's default border (1px top and bottom).
    let px = positiv(c.room_height, 250) + 2;

    const wb = c.warning_banner;
    if (wb?.enabled) {
      // The banner is as tall as whichever is taller: the image, or the text
      // assuming it wraps onto two lines (line-height 1.4), plus padding.
      px += Math.max(positiv(wb.image_size, 100),
                     Math.ceil(positiv(wb.font_size, 16) * 2.8)) + 32;
    }

    // box-sizing is border-box, so the configured height already includes
    // the padding. +1 for the divider above the box.
    if (c.info_box?.entity) px += positiv(c.info_box.height, 80) + 1;

    const ib2 = c.info_box_2;
    if (ib2?.entity) {
      // Same layout as the banner. +1 for the divider above it.
      const img = ib2.image_path ? positiv(ib2.image_size, 100) : 0;
      px += Math.max(img, Math.ceil(positiv(ib2.font_size, 16) * 2.8)) + 32 + 1;
    }
    return px;
  }

  // Sections layout (HA 2024.11+) asks for grid rows instead of card size.
  // n rows provide n*rowHeight + (n-1)*gap pixels, not n*rowHeight. Ignoring
  // the gaps requests one row too many, and that surplus row is visible as
  // empty space below the card.
  getGridOptions() {
    const px  = this._contentHeight();
    const rh  = this._rasterPx('--row-height', 56) || 56; // 0 would divide badly
    const gap = this._rasterPx('--row-gap', 8);

    const rows = Math.max(1, Math.ceil((px + gap) / (rh + gap)));
    // min_rows must be the number of rows the card actually needs. Reporting
    // less lets Lovelace assign too little space, and ha-card's overflow:hidden
    // then cuts off the banner and the text box.
    return { columns: 12, rows, min_rows: rows };
  }

  // A section grid variable in pixels. Reading the variable as text would
  // turn a theme value like "3.5rem" into 3.5 pixels, so the invisible probe
  // gets the variable as its height and the browser converts the unit.
  _rasterPx(variable, fallback) {
    try {
      const probe = this.shadowRoot?.getElementById('raster-probe');
      if (!probe || !this.isConnected) return fallback;
      probe.style.height = `var(${variable}, ${fallback}px)`;
      const px = parseFloat(getComputedStyle(probe).height);
      return Number.isFinite(px) && px >= 0 ? px : fallback;
    } catch (e) {
      return fallback;
    }
  }

  static getConfigElement() {
    return document.createElement('lutarym-room-status-card-editor');
  }

  // Example shown when the card is added from the card picker. Home Assistant
  // passes hass, so the labels follow the UI language.
  static getStubConfig(hass) {
    const raum = n => t(hass, 'roomHeaderLabel', { n });
    return {
      corridor_width: 68,
      arrow_animation: 1,
      rooms: [
        { label: raum(1), position: 'bottom-left',  entity: 'input_select.raum1_status' },
        { label: raum(2), position: 'top-right',    entity: 'input_select.raum2_status' },
        { label: raum(3), position: 'bottom-right', entity: 'input_select.raum3_status' },
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
        @keyframes ap { 0%,100%{opacity:0.6;filter:drop-shadow(0 0 2px var(--ac,#00C853))} 50%{opacity:1;filter:drop-shadow(0 0 10px var(--ac,#00C853)) drop-shadow(0 0 20px var(--ac,#00C853))} }
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

    // One room per position. If two rooms share a position, the later one is
    // rendered, and every lookup (tap, popup, status change) uses this same
    // map, so the room you tap is always the room that gets changed. Rooms
    // with an unknown position are never rendered, so they are left out.
    this._byPos = Object.fromEntries(rooms
      .filter(r => POSITIONS.includes(r.position))
      .map(r => [r.position, r]));
    const byPos = this._byPos;
    const versteckt = rooms.filter(r => byPos[r.position] !== r);
    if (versteckt.length) {
      warneEinmal(`Nicht angezeigt wegen doppelter oder ungültiger Position: ${
        versteckt.map(r => r.label || r.entity || String(r.position)).join(', ')}`);
    }

    // Numbers go straight into CSS, so invalid values fall back to defaults.
    const fsl = positiv(cfg.font_size_label,  1.2);
    const fsp = positiv(cfg.font_size_person, 0.88);
    const fss = positiv(cfg.font_size_status, 1.05);
    const fsc = positiv(cfg.font_size_closed, 1.2);
    const cw  = positiv(cfg.corridor_width,   68);

    // A manually configured card height is applied as a real height, not only
    // reported to Lovelace. Without this the card keeps its content height and
    // the entered value only shifts the reserved space in coarse grid steps.
    const ch = positiv(cfg.card_height, null);
    const hostHeight = ch ? `height:${ch}px;` : '';
    // Fixed height of the floor plan. It must not depend on whether banner or
    // text box are visible, otherwise the rooms would resize on every status
    // change that shows or hides them.
    const rh = positiv(cfg.room_height, 250);

    // Labels from config (with i18n defaults)
    this._labels = Object.fromEntries(STATUSES.map(s =>
      [s, cfg.status_labels?.[s] ?? t(hass, STATUS_LABEL_KEYS[s])]));

    const AREA_MAP = { 'top-left': 'tl', 'top-right': 'tr', 'bottom-left': 'bl', 'bottom-right': 'br' };
    const positionsHtml = Object.keys(AREA_MAP).map(pos => {
      const area = AREA_MAP[pos];
      const room = byPos[pos];
      if (room && room.is_exit) return this._exitHtml(area);
      if (room) return this._roomHtml(room, area);
      return `<div style="grid-area:${area};background:#212121"></div>`;
    }).join('');

    // Popup buttons, one per status. Labels are user text, hence esc().
    const popupButtons = STATUSES.map(s => {
      const c = STATUS_COLORS[s];
      return `<button class="popup-btn${s === 'geschlossen' ? ' wide' : ''}" id="btn-${slug(s)}"
                style="--c:${c.bg};--ct:${c.text}">${esc(this._labels[s])}</button>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; width:100%; ${hostHeight} }
        ha-card { padding:0; overflow:hidden; min-height:100%; position:relative;
                  box-sizing:border-box; ${ch ? 'height:100%;' : ''} }
        .wrap { display:flex; flex-direction:column; }
        .grid {
          display:grid;
          grid-template-areas:"tl corridor tr" "bl corridor br";
          grid-template-columns:1fr calc(${cw}px * var(--scale,1)) 1fr;
          grid-template-rows:1fr 1fr;
          gap:3px;
          background:#212121;
          flex:0 0 ${rh}px;
          height:${rh}px;
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
        .room.ohne-entitaet { cursor:default; }
        .room.ohne-entitaet:hover { filter:none; }
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
        .popup-btn.wide { grid-column:1 / -1; }
        #raster-probe {
          position:absolute; top:0; left:0; width:0; height:0;
          visibility:hidden; pointer-events:none;
        }
        .warning-banner {
          flex: 0 0 auto;
          box-sizing: border-box;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 16px 20px;
          background: transparent;
        }
        .warning-image {
          flex: 0 0 auto;
          object-fit: contain;
        }
        .warning-text {
          flex: 1 1 auto;
          min-width: 0;
          font-weight: 600;
          color: var(--primary-text-color, #212121);
          text-align: left;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }
        @media (max-width: 600px) {
          .warning-banner {
            flex-direction: column;
          }
        }
        .trenner {
          flex: 0 0 auto;
          height: 1px;
          margin: 0 16px;
          background: var(--divider-color, rgba(127,127,127,.35));
        }
        .info-box {
          flex: 0 0 auto;
          box-sizing: border-box;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 12px 16px;
          color: var(--primary-text-color, #212121);
          line-height: 1.4;
          overflow-wrap: anywhere;
          overflow-y: auto;
        }
      </style>
      <ha-card>
        <div class="wrap">
          <div class="grid">
            ${positionsHtml}
            ${this._corridorHtml()}
          </div>
          <div class="warning-banner" id="warning-banner" style="display: none;">
            <img id="warning-image" class="warning-image" alt="">
            <div id="warning-text" class="warning-text"></div>
          </div>
          <div class="trenner" id="trenner-1" style="display: none;"></div>
          <div id="info-box" class="info-box" style="display: none;"></div>
          <div class="trenner" id="trenner-2" style="display: none;"></div>
          <div class="warning-banner" id="info-banner-2" style="display: none;">
            <img id="info-image-2" class="warning-image" alt="">
            <div id="info-text-2" class="warning-text"></div>
          </div>
        </div>
      </ha-card>
      <!-- Outside ha-card on purpose: a theme can give ha-card a backdrop
           filter, which would confine this fixed overlay to the card. -->
      <div class="popup-overlay" id="popup">
        <div class="popup-box">
          <div class="popup-title" id="popup-title"></div>
          <div class="popup-buttons">${popupButtons}</div>
        </div>
      </div>
      <!-- Invisible probe that resolves the section grid's row height and gap
           to pixels, whatever unit the theme uses. -->
      <div id="raster-probe" aria-hidden="true"></div>
    `;

    this._attachListeners();
    this._update();
    this._observeSize();
  }

  // Scales the floor plan with the card width and keeps the measured height
  // current. Old observers are disconnected first: _build runs on every config
  // change (in the editor preview on every edit), and without this each run
  // would leave two more observers behind.
  _observeSize() {
    this._unobserve();
    if (typeof ResizeObserver !== 'function') return;
    const grid = this.shadowRoot.querySelector('.grid');
    if (!grid) return;
    const refWidth = positiv(this._config.reference_width, 800);

    const roHost = new ResizeObserver(entries => {
      for (const entry of entries) {
        grid.style.setProperty('--scale', Math.max(0.3, entry.contentRect.width / refWidth));
      }
      this._measureHeight();
    });
    roHost.observe(this);
    this._observers.push(roHost);

    // Also watch the content itself: banner and text boxes appear and disappear
    // with the room status, which changes the height without changing width.
    const wrap = this.shadowRoot.querySelector('.wrap');
    if (wrap) {
      const roWrap = new ResizeObserver(() => this._measureHeight());
      roWrap.observe(wrap);
      this._observers.push(roWrap);
    }
  }

  _unobserve() {
    this._observers.forEach(ro => ro.disconnect());
    this._observers = [];
  }

  // Measures what the card actually occupies. getCardSize and getGridOptions
  // use this value the next time Home Assistant asks for the size.
  // The individual parts are summed instead of measuring the container: a
  // container can be stretched by the space Lovelace assigns, which would feed
  // that space straight back as the new height and never shrink again.
  _measureHeight() {
    try {
      // A manually configured height wins. Measuring would only fight it.
      if (positiv(this._config?.card_height, null)) return;

      const sr = this.shadowRoot;
      if (!sr) return;
      const hoehe = el => (el && el.style.display !== 'none')
        ? el.getBoundingClientRect().height : 0;

      const teile =
        hoehe(sr.querySelector('.grid')) +
        hoehe(sr.getElementById('warning-banner')) +
        hoehe(sr.getElementById('trenner-1')) +
        hoehe(sr.getElementById('info-box')) +
        hoehe(sr.getElementById('trenner-2')) +
        hoehe(sr.getElementById('info-banner-2'));
      if (!teile) return;

      // ha-card draws a border (1px top and bottom by default). It belongs to
      // the card's height but to none of the parts. Rounding up keeps
      // fractional pixels from going missing.
      let rand = 0;
      const card = sr.querySelector('ha-card');
      if (card) {
        const cs = getComputedStyle(card);
        rand = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
      }
      this._measuredHeight = Math.ceil(teile + rand);
    } catch (e) { /* ignore */ }
  }

  // ── Update only colors/text (no rebuild) ─────────────────────────────────

  _update() {
    if (!this._built) return;
    for (const room of this._rooms()) {
      if (room.is_exit) continue;
      const el = this.shadowRoot.querySelector(`[data-room-position="${room.position}"]`);
      if (!el) continue;
      const s = this._roomStatus(room);
      const { bg, dark, text } = STATUS_COLORS[s];
      const closed = s === 'geschlossen';
      const label = closed ? '' : (this._labels[s] ?? '');
      el.style.background = `linear-gradient(160deg,${bg},${dark})`;
      el.style.color       = text;
      el.querySelector('.room-top').style.visibility    = closed ? 'hidden' : 'visible';
      el.querySelector('.room-footer').style.visibility = closed ? 'hidden' : 'visible';
      el.querySelector('.room-status').textContent = label;
      const closedEl = el.querySelector('.room-closed');
      closedEl.textContent  = closed ? this._labels.geschlossen : '';
      closedEl.style.display = closed ? 'flex' : 'none';
    }
    if (this._popupId) this._refreshPopupBtns();

    // Person icon: visible when at least 1 (non-exit) room is active
    const anyActive  = this._rooms().some(r => !r.is_exit && this._roomStatus(r) !== 'geschlossen');
    const personEl = this.shadowRoot.getElementById('corridor-person');
    if (personEl) personEl.style.display = anyActive ? 'block' : 'none';

    // Arrows: visible when the room's status has wayfinding enabled;
    // color follows that status's color.
    const AREA_TO_POSITION = { bl: 'bottom-left', br: 'bottom-right', tr: 'top-right', tl: 'top-left' };
    Object.keys(AREA_TO_POSITION).forEach(area => {
      const arrow = this.shadowRoot.getElementById(`arrow-${area}`);
      if (!arrow) return;
      const room = this._byPos[AREA_TO_POSITION[area]];
      const status = room && !room.is_exit ? this._roomStatus(room) : null;
      const show = !!status && this._statusShowsWayfinding(status);
      arrow.style.display = show ? 'block' : 'none';
      if (show) arrow.style.setProperty('--ac', STATUS_COLORS[status].bg);
    });

    // Update warning banner
    this._updateWarningBanner();
    this._updateInfoBox();
  }

  // The two free-text boxes below the warning banner. Their content comes from
  // an entity; when that entity is missing, unavailable or holds an empty or
  // whitespace-only state, the box is hidden entirely.
  // A divider is only shown when something is actually visible above it, so it
  // never floats on its own.
  _updateInfoBox() {
    const sr = this.shadowRoot;
    if (!sr) return;

    const bannerSichtbar =
      sr.getElementById('warning-banner')?.style.display !== 'none';

    const eins = this._applyInfoBox(sr.getElementById('info-box'), this._config.info_box);
    this._setzeTrenner(sr.getElementById('trenner-1'), bannerSichtbar && eins);

    // Second block: same layout as the warning banner, image left, text right.
    // The text comes from an entity, so an empty state hides the whole block.
    const cfg2 = this._config.info_box_2 || {};
    const text2 = this._entityText(cfg2.entity);

    const zwei = this._renderBanner(
      sr.getElementById('info-banner-2'),
      sr.getElementById('info-image-2'),
      sr.getElementById('info-text-2'),
      { sichtbar: !!text2, text: text2, image_path: cfg2.image_path,
        image_size: cfg2.image_size, font_size: cfg2.font_size,
        text_align: cfg2.text_align, schrift: cfg2 },
    );
    this._setzeTrenner(sr.getElementById('trenner-2'), (bannerSichtbar || eins) && zwei);
  }

  // State of an entity as display text; empty when the entity is missing,
  // unknown, unavailable or holds only whitespace.
  _entityText(entityId) {
    const state = entityId ? this._hass?.states[entityId]?.state : undefined;
    return (state == null || state === 'unknown' || state === 'unavailable')
      ? '' : String(state).trim();
  }

  // Shared rendering for an image-left / text-right block. Returns whether the
  // block ended up visible. `o.schrift` carries the font options of a text
  // box; the warning banner passes none and keeps its CSS defaults.
  _renderBanner(block, imgEl, txtEl, o) {
    if (!block || !imgEl || !txtEl) return false;

    if (!o.sichtbar) {
      block.style.display = 'none';
      return false;
    }

    // Guard against 0, negative values, text and unknown alignments, which
    // would otherwise make image or text disappear or produce invalid CSS.
    const size  = positiv(o.image_size, 100);
    const fs    = positiv(o.font_size, 16);
    const align = ALIGN_VALUES.includes(o.text_align) ? o.text_align : 'left';

    if (o.image_path) {
      // Hide the image if it cannot be loaded, so it does not occupy space and
      // the text stays visible.
      imgEl.onerror = () => { imgEl.style.display = 'none'; };
      imgEl.onload  = () => { imgEl.style.display = ''; };
      imgEl.alt = o.text;
      imgEl.style.width  = `${size}px`;
      imgEl.style.height = `${size}px`;
      if (imgEl.getAttribute('src') !== o.image_path) {
        imgEl.style.display = '';
        imgEl.src = o.image_path;
      }
    } else {
      imgEl.style.display = 'none';
    }

    txtEl.textContent     = o.text;
    txtEl.style.fontSize  = `${fs}px`;
    txtEl.style.textAlign = align;
    if (o.schrift) this._applyFont(txtEl, o.schrift);
    block.style.display   = 'flex';
    return true;
  }

  // Fills text box 1, returns whether it ended up visible.
  _applyInfoBox(box, cfg) {
    if (!box) return false;

    const text = this._entityText(cfg?.entity);
    if (!text) {
      box.style.display = 'none';
      box.textContent = '';
      return false;
    }

    box.textContent    = text;
    box.style.fontSize = `${positiv(cfg.font_size, 18)}px`;
    box.style.height   = `${positiv(cfg.height, 80)}px`;
    this._applyFont(box, cfg);
    box.style.display  = 'flex';
    return true;
  }

  // Font family, weight, italic and underline of a text box. Unset or unknown
  // values clear the inline style, so the element keeps its CSS default:
  // normal weight for text box 1, semibold for text box 2.
  _applyFont(el, f) {
    el.style.fontFamily     = own(FONT_STACKS, f.font_family) || '';
    const weight            = own(FONT_WEIGHTS, f.font_weight);
    el.style.fontWeight     = weight ? String(weight) : '';
    el.style.fontStyle      = f.italic === true ? 'italic' : '';
    el.style.textDecoration = f.underline === true ? 'underline' : '';
  }

  _setzeTrenner(el, sichtbar) {
    if (el) el.style.display = sichtbar ? 'block' : 'none';
  }

  _updateWarningBanner() {
    const sr  = this.shadowRoot;
    const cfg = this._config.warning_banner || {};
    const showWhen = cfg.show_when || 'belegt';

    // "immer" shows the banner permanently. Any other value shows it only when
    // every room carries that status. Closed rooms are skipped, so they neither
    // block nor trigger the banner; with "geschlossen" selected this means all
    // rooms are closed. At least one room must carry the status, otherwise a
    // card whose rooms are all closed would show the banner.
    const status = this._rooms().filter(r => !r.is_exit).map(r => this._roomStatus(r));
    const sichtbar = !!cfg.enabled && (showWhen === 'immer' ||
      (status.includes(showWhen) &&
       status.every(s => s === showWhen || s === 'geschlossen')));

    this._renderBanner(
      sr.getElementById('warning-banner'),
      sr.getElementById('warning-image'),
      sr.getElementById('warning-text'),
      { sichtbar, text: cfg.text || DEFAULT_WARNING_TEXT,
        image_path: cfg.image_path || '/local/Stop.png',
        image_size: cfg.image_size, font_size: cfg.font_size,
        text_align: cfg.text_align },
    );
  }

  // Whether the wayfinding animation (arrows) should show for a given
  // status. Configurable per status via status_show_wayfinding; defaults
  // to "frei" only, matching the original behavior.
  _statusShowsWayfinding(status) {
    const cfg = this._config.status_show_wayfinding;
    if (cfg && Object.prototype.hasOwnProperty.call(cfg, status)) return !!cfg[status];
    return status === 'frei';
  }

  // ── One-time listeners ────────────────────────────────────────────────────

  _attachListeners() {
    // Rooms
    this.shadowRoot.querySelectorAll('[data-room-position]').forEach(el => {
      el.addEventListener('click', () => this._openPopup(el.dataset.roomPosition));
    });

    // Popup buttons. Tapping the status the room already has only closes the
    // popup, so a second tap cannot change anything by accident. A room with
    // an unknown state has no current status, so every button writes.
    STATUSES.forEach(action => {
      const btn = this.shadowRoot.getElementById(`btn-${slug(action)}`);
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const room = this._byPos[this._popupId];
        this._closePopup();
        if (!this._hass || !room?.entity) return;
        if (this._statusOf(room) === action) return;
        this._setRoomStatus(room, action);
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
    const room = this._byPos[position];
    // Without an entity there is nothing to change, so no popup.
    if (!room?.entity) return;
    this._popupId = position;
    this.shadowRoot.getElementById('popup-title').textContent =
      [room.label, room.person].filter(Boolean).join(' – ');
    this._refreshPopupBtns();
    this.shadowRoot.getElementById('popup').classList.add('open');
  }

  _refreshPopupBtns() {
    const s = this._roomStatus(this._byPos[this._popupId]);
    STATUSES.forEach(a => {
      this.shadowRoot.getElementById(`btn-${slug(a)}`)
        .classList.toggle('active', a === s);
    });
  }

  _closePopup() {
    this._popupId = null;
    this.shadowRoot.getElementById('popup')?.classList.remove('open');
  }

  // ── Entity lookups ─────────────────────────────────────────────────────

  // Known status of a room, or null when the room has no entity, the entity
  // does not exist or holds a value that is not a status. Case and extra
  // spaces are ignored. A missing entity or an unknown value is reported once
  // in the browser console, so a broken helper does not go unnoticed.
  _statusOf(room) {
    if (!room?.entity || !this._hass) return null;
    const stateObj = this._hass.states[room.entity];
    if (!stateObj) {
      warneEinmal(`${room.entity} wurde nicht gefunden. Der Raum wird als geschlossen angezeigt.`);
      return null;
    }
    const n = normStatus(stateObj.state);
    if (STATUSES.includes(n)) return n;
    warneEinmal(`${room.entity} hat den unbekannten Zustand "${stateObj.state}". Der Raum wird als geschlossen angezeigt.`);
    return null;
  }

  // Status used for display: anything unknown counts as "geschlossen".
  _roomStatus(room) {
    return this._statusOf(room) ?? 'geschlossen';
  }

  // Writes the new status into the room's status entity: input_select via
  // select_option, everything else via input_text.set_value (the editor only
  // offers input_select and input_text). For a dropdown helper the option is
  // sent in the helper's own spelling, so options like "Belegt" work.
  _setRoomStatus(room, value) {
    if (!room?.entity || !this._hass) return;
    let aufruf;
    try {
      if (room.entity.split('.')[0] === 'input_select') {
        const optionen = this._hass.states[room.entity]?.attributes?.options;
        const option = (Array.isArray(optionen) ? optionen : [])
          .find(o => normStatus(o) === value) ?? value;
        aufruf = this._hass.callService('input_select', 'select_option', { entity_id: room.entity, option });
      } else {
        aufruf = this._hass.callService('input_text', 'set_value', { entity_id: room.entity, value });
      }
    } catch (err) {
      this._meldeFehler(room, value, err);
      return;
    }
    Promise.resolve(aufruf).catch(err => this._meldeFehler(room, value, err));
  }

  // A failed status change, typically a dropdown helper that lacks the
  // option, is shown as a Home Assistant notification and logged.
  _meldeFehler(room, value, err) {
    const grund = err?.message ?? String(err);
    console.warn(`[lutarym-room-status-card] ${room.entity} konnte nicht auf "${value}" gesetzt werden:`, grund);
    this.dispatchEvent(new CustomEvent('hass-notification', {
      detail: { message: t(this._hass, 'setFailed', {
        raum: room.label || room.entity, status: this._labels?.[value] ?? value, grund }) },
      bubbles: true,
      composed: true,
    }));
  }

  // ── HTML building blocks ──────────────────────────────────────────────────

  _exitHtml(area) {
    return `<div class="exit-quadrant" style="grid-area:${area}">
              <span class="exit-label">${esc(t(this._hass, 'emergencyExit'))}</span></div>`;
  }

  _roomHtml(room, area) {
    const { bg, dark } = STATUS_COLORS['geschlossen']; // initial; _update() sets the actual color
    return `
      <div class="room${room.entity ? '' : ' ohne-entitaet'}" data-room-position="${esc(room.position)}"
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

  _corridorHtml() {
    const b = Number(this._config.corridor_person_bottom);
    const bottom = Number.isFinite(b) && b >= 0 ? b : 2;
    const personSize = positiv(this._config.person_icon_size, 34);
    return `
      <div class="corridor" style="position:relative">
        <svg id="corridor-person" viewBox="0 0 20 20"
             style="display:none;position:absolute;left:50%;bottom:calc(${bottom}px * var(--scale,1));width:calc(${personSize}px * var(--scale,1));height:calc(${personSize}px * var(--scale,1));transform:translateX(-50%)">
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
                  stroke="var(--ac,#00C853)" stroke-width="8" fill="none"
                  stroke-linecap="butt" stroke-linejoin="miter" pathLength="100" class="arrow-path"/>
            <polygon points="0,165 16,157 16,173" fill="var(--ac,#00C853)" class="arrow-head"/>
          </g>

          <!-- Arrow to bottom-right room: straight up, 90° right -->
          <g id="arrow-br" style="display:none" filter="url(#ashadow)">
            <path d="M30,183 L30,165 L46,165"
                  stroke="var(--ac,#00C853)" stroke-width="8" fill="none"
                  stroke-linecap="butt" stroke-linejoin="miter" pathLength="100" class="arrow-path"/>
            <polygon points="60,165 44,157 44,173" fill="var(--ac,#00C853)" class="arrow-head"/>
          </g>

          <!-- Arrow to top-right room: straight up, 90° right at top -->
          <g id="arrow-tr" style="display:none" filter="url(#ashadow)">
            <path d="M30,183 L30,55 L46,55"
                  stroke="var(--ac,#00C853)" stroke-width="8" fill="none"
                  stroke-linecap="butt" stroke-linejoin="miter" pathLength="100" class="arrow-path"/>
            <polygon points="60,55 44,47 44,63" fill="var(--ac,#00C853)" class="arrow-head"/>
          </g>

          <!-- Arrow to top-left room: straight up, 90° left at top -->
          <g id="arrow-tl" style="display:none" filter="url(#ashadow)">
            <path d="M30,183 L30,55 L14,55"
                  stroke="var(--ac,#00C853)" stroke-width="8" fill="none"
                  stroke-linecap="butt" stroke-linejoin="miter" pathLength="100" class="arrow-path"/>
            <polygon points="0,55 16,47 16,63" fill="var(--ac,#00C853)" class="arrow-head"/>
          </g>

        </svg>
      </div>`;
  }
}

// ── Visual config editor ────────────────────────────────────────────────

class LutarymRoomStatusCardEditor extends HTMLElement {
  setConfig(config) {
    // Home Assistant hands every config this editor sends back to setConfig.
    // Rebuilding the form at that point would destroy the field the user just
    // moved to, so focus and typed input would be lost. Only a config that
    // really differs, for example from the YAML editor, rebuilds the form.
    if (this._config && JSON.stringify(config) === JSON.stringify(this._config)) return;
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

  // All editor changes build a new config object instead of changing the
  // current one: Home Assistant deep-freezes every config this editor sends
  // out, and writing into a frozen object would throw.

  _onChange(field, value, isNumber) {
    const leer = value === '' || value == null;
    const wert = isNumber && !leer ? Number(value) : value;
    const next = { ...this._config };
    if (field.includes('.')) {
      // Nested field, e.g. "warning_banner.image_path". An object that ends up
      // empty is removed, so no "info_box: {}" is left behind in the YAML.
      const [parent, child] = field.split('.');
      const branch = { ...(next[parent] || {}) };
      if (leer) delete branch[child]; else branch[child] = wert;
      if (Object.keys(branch).length) next[parent] = branch; else delete next[parent];
    } else if (leer) {
      delete next[field];
    } else {
      next[field] = wert;
    }
    this._config = next;
    this._fireChanged();
  }

  _onStatusLabelChange(key, value) {
    const labels = { ...(this._config.status_labels || {}) };
    if (value === '' || value == null) delete labels[key];
    else labels[key] = value;
    const next = { ...this._config };
    if (Object.keys(labels).length) next.status_labels = labels;
    else delete next.status_labels;
    this._config = next;
    this._fireChanged();
  }

  _onWayfindingToggle(key, checked) {
    this._config = {
      ...this._config,
      status_show_wayfinding: { ...(this._config.status_show_wayfinding || {}), [key]: checked },
    };
    this._fireChanged();
  }

  _onRoomChange(index, field, value) {
    this._config = {
      ...this._config,
      rooms: this._config.rooms.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    };
    this._fireChanged();
  }

  _addRoom() {
    if (this._config.rooms.length >= 4) return;
    const used = new Set(this._config.rooms.map(r => r.position));
    const position = POSITIONS.find(p => !used.has(p)) || 'top-left';
    this._config = {
      ...this._config,
      rooms: [...this._config.rooms, { label: '', person: '', position }],
    };
    this._render();
    this._fireChanged();
  }

  _removeRoom(index) {
    // The card needs at least one room, otherwise it only shows an error.
    if (this._config.rooms.length <= 1) return;
    this._config = { ...this._config, rooms: this._config.rooms.filter((_, i) => i !== index) };
    this._render();
    this._fireChanged();
  }

  // Choosing a position another room already has swaps the two rooms, so no
  // position can end up used twice. A room without a valid position hands
  // the other room a free one instead.
  _onRoomPosition(index, neu) {
    const rooms = this._config.rooms.map(r => ({ ...r }));
    const alt = rooms[index].position;
    const andere = rooms.findIndex((r, i) => i !== index && r.position === neu);
    rooms[index].position = neu;
    if (andere >= 0) {
      rooms[andere].position = POSITIONS.includes(alt)
        ? alt
        : POSITIONS.find(p => !rooms.some(r => r.position === p)) ?? rooms[andere].position;
    }
    this._config = { ...this._config, rooms };
    this._render(); // the other room's position select changed too
    // The form was rebuilt; keep the focus on this room's position select.
    this.querySelectorAll('.room-card')[index]?.querySelector('select')?.focus();
    this._fireChanged();
  }

  // Alignment select with the hint for "justify", which only shows while
  // justify is selected. The hint is toggled directly instead of rebuilding
  // the form, so focus stays where it is.
  _alignRows(prefix, value) {
    const hass = this._hass;
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = t(hass, 'alignJustifyHint');
    hint.hidden = value !== 'justify';
    const row = this._selectRow(t(hass, 'editorTextAlign'), null, value, [
      { value: 'left',    label: t(hass, 'alignLeft') },
      { value: 'center',  label: t(hass, 'alignCenter') },
      { value: 'right',   label: t(hass, 'alignRight') },
      { value: 'justify', label: t(hass, 'alignJustify') },
    ], v => {
      hint.hidden = v !== 'justify';
      this._onChange(`${prefix}.text_align`, v === 'left' ? '' : v);
    });
    return [row, hint];
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

  _stringRow(label, field, value, placeholder) {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML = `<label>${label}</label>`;
    const input = document.createElement('input');
    input.type = 'text';
    if (value != null) input.value = value;
    if (placeholder != null) input.placeholder = String(placeholder);
    input.addEventListener('change', ev => this._onChange(field, ev.target.value));
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

  // Entity picker for a room's status entity: a text or select helper whose
  // state holds the status directly ("frei", "belegt", ...). Writes into the
  // specific room object via _onRoomChange.
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

  // Checkbox with its text inside the same <label>, so clicking the text
  // toggles the box as well.
  _flagRow(label, checked, onChange) {
    const wrap = document.createElement('label');
    wrap.className = 'row checkbox-row';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!checked;
    input.addEventListener('change', ev => onChange(ev.target.checked));
    wrap.appendChild(input);
    wrap.appendChild(document.createTextNode(label));
    return wrap;
  }

  // Font controls of a text box: font, weight, italic, underline. Choosing
  // the default removes the key, so the YAML only holds real changes.
  _fontControls(prefix, box, defaultWeight) {
    const hass = this._hass;
    const family = own(FONT_STACKS, box.font_family) !== undefined ? box.font_family : 'theme';
    const weight = own(FONT_WEIGHTS, box.font_weight) !== undefined ? box.font_weight : defaultWeight;

    const familyRow = this._selectRow(t(hass, 'editorFontFamily'), null, family,
      FONTS.map(f => ({ value: f.key, label: f.i18n ? t(hass, f.i18n) : f.label })),
      v => this._onChange(`${prefix}.font_family`, v === 'theme' ? '' : v));

    const weightRow = this._selectRow(t(hass, 'editorFontWeight'), null, weight, [
      { value: 'normal',   label: t(hass, 'weightNormal') },
      { value: 'semibold', label: t(hass, 'weightSemibold') },
      { value: 'bold',     label: t(hass, 'weightBold') },
    ], v => this._onChange(`${prefix}.font_weight`, v === defaultWeight ? '' : v));

    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = t(hass, 'editorFontHint');

    return [
      this._sideBySide(familyRow, weightRow),
      this._sideBySide(
        this._flagRow(t(hass, 'editorItalic'), box.italic === true,
          c => this._onChange(`${prefix}.italic`, c ? true : '')),
        this._flagRow(t(hass, 'editorUnderline'), box.underline === true,
          c => this._onChange(`${prefix}.underline`, c ? true : '')),
      ),
      hint,
    ];
  }

  _statusLabelRow(label, key, value, placeholder) {
    const wrap = document.createElement('div');
    wrap.className = 'row status-label-row';
    wrap.innerHTML = `<label>${label}</label>`;

    const controls = document.createElement('div');
    controls.className = 'status-label-controls';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value ?? '';
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener('change', ev => this._onStatusLabelChange(key, ev.target.value));
    controls.appendChild(input);

    const arrowWrap = document.createElement('label');
    arrowWrap.className = 'arrow-toggle';
    const arrowCheckbox = document.createElement('input');
    arrowCheckbox.type = 'checkbox';
    arrowCheckbox.checked = this._config.status_show_wayfinding?.[key] ?? (key === 'frei');
    arrowCheckbox.addEventListener('change', ev => this._onWayfindingToggle(key, ev.target.checked));
    arrowWrap.appendChild(arrowCheckbox);
    arrowWrap.appendChild(document.createTextNode(t(this._hass, 'editorShowWayfinding')));
    controls.appendChild(arrowWrap);

    wrap.appendChild(controls);
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
        .checkbox-row {
          flex-direction: row; align-items: center; gap: 8px;
          font-size: 13px; color: var(--primary-text-color); cursor: pointer;
        }
        .checkbox-row input[type="checkbox"] { margin: 0; cursor: pointer; }
        .status-label-controls { display: flex; align-items: center; gap: 10px; }
        .status-label-controls input[type="text"] { flex: 1; min-width: 0; }
        .arrow-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; cursor: pointer; }
        .arrow-toggle input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; margin: 0; }
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
        .remove-btn:disabled { opacity: .4; cursor: default; text-decoration: none; }
        .room-warning {
          font-size: 12px; line-height: 1.4; color: var(--error-color, #c62828);
          background: rgba(198,40,40,.08); border: 1px solid rgba(198,40,40,.3);
          border-radius: 6px; padding: 6px 8px;
        }
        .hint[hidden] { display: none; }
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
      this._numberRow(t(hass, 'editorRoomHeight'), 'room_height', cfg.room_height ?? 250, 250),
    ));
    form.appendChild(this._numberRow(
      t(hass, 'editorCardHeight'), 'card_height', cfg.card_height, t(hass, 'automatic')));
    const chHint = document.createElement('div');
    chHint.className = 'hint';
    chHint.textContent = t(hass, 'editorCardHeightHint');
    form.appendChild(chHint);
    form.appendChild(this._numberRow(t(hass, 'editorPersonIconSize'), 'person_icon_size', cfg.person_icon_size ?? 34, 34));
    form.appendChild(this._selectRow(t(hass, 'editorArrowAnimation'), 'arrow_animation', cfg.arrow_animation ?? 1, [
      { value: '1', label: t(hass, 'anim1') }, { value: '2', label: t(hass, 'anim2') },
      { value: '3', label: t(hass, 'anim3') }, { value: '4', label: t(hass, 'anim4') },
      { value: '5', label: t(hass, 'anim5') }, { value: '6', label: t(hass, 'anim6') },
      { value: '7', label: t(hass, 'anim7') }, { value: '8', label: t(hass, 'anim8') },
      { value: '9', label: t(hass, 'anim9') }, { value: '10', label: t(hass, 'anim10') },
    ], v => this._onChange('arrow_animation', v, true)));

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
    form.appendChild(this._statusLabelRow(t(hass, 'editorLabelFree'), 'frei', sl.frei, t(hass, 'statusFree')));
    form.appendChild(this._statusLabelRow(t(hass, 'editorLabelAppointment'), 'nicht besetzt', sl['nicht besetzt'], t(hass, 'statusAppointment')));
    form.appendChild(this._statusLabelRow(t(hass, 'editorLabelOccupied'), 'belegt', sl.belegt, t(hass, 'statusOccupied')));
    form.appendChild(this._statusLabelRow(t(hass, 'editorLabelReserved'), 'reserviert', sl.reserviert, t(hass, 'statusReserved')));
    form.appendChild(this._statusLabelRow(t(hass, 'editorLabelClosed'), 'geschlossen', sl.geschlossen, t(hass, 'statusClosed')));

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
      removeBtn.disabled = cfg.rooms.length <= 1;
      removeBtn.addEventListener('click', () => this._removeRoom(i));
      header.appendChild(removeBtn);
      roomCard.appendChild(header);

      // A room without a valid position (only possible via YAML) shows
      // "Bitte wählen" instead of pretending to sit at "Oben links".
      const posGueltig = POSITIONS.includes(room.position);
      roomCard.appendChild(this._selectRow(
        t(hass, 'editorRoomPosition'), null, posGueltig ? room.position : '',
        posGueltig ? positionOptions : [{ value: '', label: t(hass, 'posChoose') }, ...positionOptions],
        v => { if (v) this._onRoomPosition(i, v); },
      ));

      // The card renders one room per position, the last one wins. Say so
      // instead of letting a room vanish from the card without a trace.
      const verdeckt = !posGueltig ||
        cfg.rooms.some((r, j) => j > i && r.position === room.position);
      if (verdeckt) {
        const warn = document.createElement('div');
        warn.className = 'room-warning';
        warn.textContent = t(hass, 'roomHidden');
        roomCard.appendChild(warn);
      }

      roomCard.appendChild(this._flagRow(t(hass, 'editorRoomIsExit'), !!room.is_exit, checked => {
        this._onRoomChange(i, 'is_exit', checked);
        this._render(); // structural change: show/hide the fields below
      }));

      // Label/person/entity are irrelevant for the Emergency Exit quadrant
      if (!room.is_exit) {
        const labelRow = document.createElement('div');
        labelRow.className = 'row';
        labelRow.innerHTML = `<label>${t(hass, 'editorRoomLabel')}</label>`;
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = room.label ?? '';
        labelInput.placeholder = t(hass, 'roomHeaderLabel', { n: i + 1 });
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

    // Warning Banner section
    const warningLabel = document.createElement('div');
    warningLabel.className = 'section-label';
    warningLabel.textContent = t(hass, 'sectionWarningBanner');
    form.appendChild(warningLabel);

    const wb = cfg.warning_banner || {};
    form.appendChild(this._flagRow(t(hass, 'editorBannerEnabled'), !!wb.enabled, checked => {
      this._config = {
        ...this._config,
        warning_banner: { ...(this._config.warning_banner || {}), enabled: checked },
      };
      this._fireChanged();
      this._render(); // structural change: show/hide the fields below
    }));

    if (wb.enabled) {
      form.appendChild(this._stringRow(t(hass, 'editorImagePath'), 'warning_banner.image_path', wb.image_path || '/local/Stop.png', '/local/Stop.png'));
      form.appendChild(this._sideBySide(
        this._numberRow(t(hass, 'editorImageSize'), 'warning_banner.image_size', wb.image_size ?? 100, 100),
        this._numberRow(t(hass, 'editorWarningFontSize'), 'warning_banner.font_size', wb.font_size ?? 16, 16),
      ));
      form.appendChild(this._stringRow(t(hass, 'editorWarningText'), 'warning_banner.text', wb.text || DEFAULT_WARNING_TEXT, DEFAULT_WARNING_TEXT));
      this._alignRows('warning_banner', ALIGN_VALUES.includes(wb.text_align) ? wb.text_align : 'left')
        .forEach(el => form.appendChild(el));
      form.appendChild(this._selectRow(
        t(hass, 'editorShowWhen'), 'warning_banner.show_when', wb.show_when || 'belegt',
        [
          { value: 'immer',         label: t(hass, 'showWhenAlways') },
          { value: 'belegt',        label: t(hass, 'statusOccupied') },
          { value: 'nicht besetzt', label: t(hass, 'statusAppointment') },
          { value: 'frei',          label: t(hass, 'statusFree') },
          { value: 'reserviert',    label: t(hass, 'statusReserved') },
          { value: 'geschlossen',   label: t(hass, 'statusClosed') },
        ],
      ));
      const showWhenHint = document.createElement('div');
      showWhenHint.className = 'hint';
      showWhenHint.textContent = t(hass, 'editorShowWhenHint');
      form.appendChild(showWhenHint);
    }

    // Textfeld 1 (info box)
    const ib = cfg.info_box || {};
    const infoLabel = document.createElement('div');
    infoLabel.className = 'section-label';
    infoLabel.textContent = t(hass, 'sectionInfoBox');
    form.appendChild(infoLabel);

    form.appendChild(this._infoBoxEntityRow(t(hass, 'editorInfoBoxEntity'), 'info_box.entity', ib.entity));
    form.appendChild(this._sideBySide(
      this._numberRow(t(hass, 'editorInfoBoxFontSize'), 'info_box.font_size', ib.font_size ?? 18, 18),
      this._numberRow(t(hass, 'editorInfoBoxHeight'), 'info_box.height', ib.height ?? 80, 80),
    ));
    this._fontControls('info_box', ib, 'normal').forEach(el => form.appendChild(el));

    const infoHint = document.createElement('div');
    infoHint.className = 'hint';
    infoHint.textContent = t(hass, 'editorInfoBoxHint');
    form.appendChild(infoHint);

    // Textfeld 2 (second info box)
    const ib2 = cfg.info_box_2 || {};
    const infoLabel2 = document.createElement('div');
    infoLabel2.className = 'section-label';
    infoLabel2.textContent = t(hass, 'sectionInfoBox2');
    form.appendChild(infoLabel2);

    form.appendChild(this._infoBoxEntityRow(t(hass, 'editorInfoBoxEntity'), 'info_box_2.entity', ib2.entity));
    form.appendChild(this._stringRow(t(hass, 'editorImagePath'), 'info_box_2.image_path', ib2.image_path, t(hass, 'noImage')));
    form.appendChild(this._sideBySide(
      this._numberRow(t(hass, 'editorImageSize'), 'info_box_2.image_size', ib2.image_size ?? 100, 100),
      this._numberRow(t(hass, 'editorInfoBoxFontSize'), 'info_box_2.font_size', ib2.font_size ?? 16, 16),
    ));
    this._fontControls('info_box_2', ib2, 'semibold').forEach(el => form.appendChild(el));
    this._alignRows('info_box_2', ALIGN_VALUES.includes(ib2.text_align) ? ib2.text_align : 'left')
      .forEach(el => form.appendChild(el));
    const info2Hint = document.createElement('div');
    info2Hint.className = 'hint';
    info2Hint.textContent = t(hass, 'editorInfoBox2Hint');
    form.appendChild(info2Hint);
  }

  // Entity picker for a text box. Any domain is allowed, since the text may
  // come from an input_text, a template sensor, or anything else.
  _infoBoxEntityRow(label, field, value) {
    const wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML = `<label>${label}</label>`;
    const selector = document.createElement('ha-selector');
    selector.hass = this._hass;
    selector.selector = { entity: {} };
    selector.value = value ?? '';
    selector.addEventListener('value-changed', ev => {
      ev.stopPropagation();
      this._onChange(field, ev.detail.value || '');
    });
    wrap.appendChild(selector);
    return wrap;
  }
}

// ── Registration ────────────────────────────────────────────────────────
// Guarded, because the same file can end up loaded twice (for example once
// via HACS and once as a manual resource). An unguarded second define()
// throws "already defined" and stops the script.

if (!customElements.get('lutarym-room-status-card')) {
  customElements.define('lutarym-room-status-card', LutarymRoomStatusCard);
  console.info(
    `%c ROOM-STATUS-CARD %c v${VERSION} `,
    'background:#1565C0;color:#fff;padding:2px 8px;border-radius:3px 0 0 3px;font-weight:bold',
    'background:#00C853;color:#fff;padding:2px 8px;border-radius:0 3px 3px 0;font-weight:bold'
  );
}
if (!customElements.get('lutarym-room-status-card-editor')) {
  customElements.define('lutarym-room-status-card-editor', LutarymRoomStatusCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'lutarym-room-status-card')) {
  window.customCards.push({
    type: 'lutarym-room-status-card',
    name: t(null, 'cardName'),
    description: t(null, 'cardDescription'),
  });
}
