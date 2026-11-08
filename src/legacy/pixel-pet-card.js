/*
 * Pixel Pet Card
 *
 * A deliberately independent pixel-art pet card. No rig, IK, candidate solver,
 * inherited Stick Pet state is used here. The small world layer is limited to
 * grid-aligned props and POI visits. A pose is just a 24x24 array; animation
 * chooses approved frames and moves the sprite in whole pixel cells.
 */

class PixelPetCard extends HTMLElement {
  static get defaults() {
    return {
      title: "Pixel Pet",
      height: 260,
      pose: "auto", // "auto" patrols; named idle poses use supplied frame matrices.
      auto_enabled: true,
      routine: "patrol", // "patrol" | "walk_to_sit" | "sit_to_loaf" | "loaf_to_walk"
      cell_size: 9,
      padding: 18,
      // A relaxed patrol is still deliberately brisk: four walk drawings now
      // complete in roughly two thirds of a second rather than one second.
      walk_cycle_ms: 670,
      motion_variation: 0.06,
      motion_profiles: {},
      rest_ms: 1200,
      idle_frame_ms: 250,
      sit_breath_steps: 4,
      sit_tail_steps: 3,
      stand_pause_breath_steps: 4,
      stand_pause_tail_steps: 3,
      loaf_low_head_steps: 12,
      loaf_alert_steps: 1,
      color: "var(--primary-text-color)",
      floor_color: "var(--primary-text-color)",
      floor_opacity: 0.18,
      show_floor: true,
      show_grid: false,
      // Useful when inspecting world props or surface art without the cat
      // obscuring individual sprite cells.
      show_cat: true,
      show_paw_debug: false,
      world_id: "default",
      cat_id: "cat-1",
      props: [
        { id: "food-bowl-1", type: "food_bowl", side: "left" },
        // The first room-scale prop.  It is deliberately one half of a sofa,
        // aligned with the right edge; a later pass can mirror it into a full
        // sofa without changing the world coordinate convention.
        { id: "sofa-half-1", type: "sofa_half", side: "right" },
        // The clock is a native pixel face whose hands use the Home Assistant
        // home time zone; it needs no sensor or helper entity.
        { id: "clock-1", type: "clock", x_ratio: 0.30, bottom_offset_cells: 22 },
        // A deliberately independent container prop. The box-hop clips place
        // the cat relative to its rim; no box-coloured cells live in cat art.
      ],
      food_visit_ms: 8000,
      show_poi_debug: false,
      show_path_debug: false,
      show_surface_debug: false,
      show_activity_log: false,
      // Focus is the everyday presentation: the card follows the cat with a
      // small, grid-preserving crop. World remains available for debugging.
      view_mode: "cat_focus", // "cat_focus" | "world"
      // The in-card controls are useful while developing, but optional for a
      // finished dashboard. The view switch remains available either way.
      show_controls: false,
      poi_pool_size: 2,
      // A world may contain stacked landings (for example, chair beneath
      // table). Each item needs a stable identity, rather than being inferred
      // from an x position.
      elevated_surfaces: [],
      // A named, frozen elevation beat for visual audit. This deliberately
      // bypasses navigation and timing; it is intended for Card Lab captures.
      debug_elevation_frame: "", // "ascend-1" … "ascend-5" | "descend-1" … "descend-4"
      debug_elevated_surface: undefined,
      elevated_surface_height: undefined,
      // Card Lab-only route probe. It starts one robot run without requiring
      // a synthetic click, so moving-deck choreography can be captured.
      debug_robot_vacuum: false,
      // Legacy alias retained for existing YAML. `show_controls` takes
      // precedence when both are supplied.
      show_pose_test_controls: false,

      // Optional data backdrop experiment. Text is still rendered as bitmap
      // arrays; the double-resolution field gives it half-size cat pixels.
      entity: "",
      entities: [],
      entity_display_ms: 3600,
      entity_slide_ms: 1000,
      show_entity_backdrop: false,
      backdrop_value: "",
      backdrop_label: "",
      backdrop_value_format: "auto", // "auto" | "whole" | "significant_2" | "raw"
      backdrop_unit_style: "auto", // "auto" | "hidden" | "compact" | "full"
      backdrop_resolution: "double", // "same" | "double"
      backdrop_color: "#e1a640",
      backdrop_opacity: 0.68,
      backdrop_label_color: "var(--secondary-text-color)",
      show_backdrop_grid: false,
    };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "height", selector: { number: { min: 140, max: 600, step: 10, mode: "box" } } },
        { name: "auto_enabled", selector: { boolean: {} } },
        {
          name: "pose",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "auto", label: "Auto patrol" },
                { value: "stand", label: "Stand" },
                { value: "stand_pause", label: "Standing pause" },
                { value: "look_up", label: "Look up" },
                { value: "sit", label: "Sit idle" },
                { value: "loaf", label: "Loaf idle" },
              ],
            },
          },
        },
        {
          name: "routine",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "patrol", label: "Patrol" },
                { value: "walk_to_sit", label: "Walk to sit" },
                { value: "sit_to_loaf", label: "Sit to loaf" },
                { value: "loaf_to_walk", label: "Loaf to walk" },
              ],
            },
          },
        },
        { name: "show_grid", selector: { boolean: {} } },
        { name: "show_cat", selector: { boolean: {} } },
        { name: "show_paw_debug", selector: { boolean: {} } },
        { name: "show_poi_debug", selector: { boolean: {} } },
        { name: "show_path_debug", selector: { boolean: {} } },
        { name: "show_activity_log", selector: { boolean: {} } },
        { name: "entity", selector: { entity: {} } },
        { name: "show_entity_backdrop", selector: { boolean: {} } },
        {
          name: "backdrop_value_format",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "auto", label: "Auto: short, readable value" },
                { value: "whole", label: "Whole number" },
                { value: "significant_2", label: "Two significant figures" },
                { value: "raw", label: "Raw entity state" },
              ],
            },
          },
        },
        {
          name: "backdrop_unit_style",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "auto", label: "Auto: hide temperature unit" },
                { value: "hidden", label: "Hide unit" },
                { value: "compact", label: "Compact unit" },
                { value: "full", label: "Full-size unit" },
              ],
            },
          },
        },
        {
          name: "backdrop_resolution",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "double", label: "Double-resolution text" },
                { value: "same", label: "Same-resolution text" },
              ],
            },
          },
        },
        { name: "show_backdrop_grid", selector: { boolean: {} } },
      ],
      computeLabel: (schema) => ({
        title: "Title",
        height: "Card height",
        auto_enabled: "Enable Auto behaviour",
        pose: "Pose",
        routine: "Routine",
        show_grid: "Show pixel grid",
        show_cat: "Show cat",
        show_paw_debug: "Highlight walk paws",
        show_poi_debug: "Show prop POI markers",
        show_path_debug: "Show POI paths",
        show_activity_log: "Show world activity log",
        entity: "Entity",
        show_entity_backdrop: "Show entity backdrop",
        backdrop_value_format: "Value format",
        backdrop_unit_style: "Unit display",
        backdrop_resolution: "Text resolution",
        show_backdrop_grid: "Show backdrop grid",
      })[schema.name] || schema.name,
    };
  }

  static getStubConfig() {
    return PixelPetCard.defaults;
  }

  static getConfigElement() {
    return document.createElement("pixel-pet-card-editor");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.config = PixelPetCard.defaults;
    this.clock = { paused: false, pausedAt: 0, pauseOffset: 0 };
    this._clockTimer = null;
    this._clockSignature = "";
    this._clockParts = null;
    this._clockTimeZone = null;
    this.debug = {
      showCat: true,
      showFrameName: false,
      showElevatedSurface: false,
      elevatedHeightCells: 12,
      showPawDebug: false,
      showPoiDebug: false,
      showPathDebug: false,
      showSurfaceDebug: false,
      showActivityLog: false,
    };
    this.startedAt = this.getWorldNow();
    this.frameRequest = null;
    this.poseTest = null;
    // The in-card controls are intentionally grouped so the test harness can
    // keep growing without permanently occupying the card with every action.
    this.controlMenu = "poses";
    this.autoState = null;
    this.autoEnabled = true;
    this.manualState = null;
    this.motion = { sequence: 0, traitKey: null, traits: null };
    this.world = {
      reservations: new Map(),
      visit: null,
      surfaceTravel: null,
      patrolOrigin: null,
      elevated: null,
      boxEntry: null,
      // Stage-one moving prop controller.  It deliberately owns only the
      // vacuum's route and visual direction for now; later stages can promote
      // it into a carrying surface without rewriting its travel lifecycle.
      robotVacuum: null,
      // A board attempt owns the cat while it approaches, waits for the
      // moving deck, hops aboard and rides.  It remains deliberately separate
      // from the robot controller: a future rider can use any moving surface.
      robotBoarding: null,
      // A glass visit is deliberately separate from food: water has a
      // persistent level and the cat can only reach its surface, not drain
      // the whole prop in one sitting.
      glassVisit: null,
      propStates: new Map(),
      pois: new Map(),
      // Prop invitations are one-shot opportunities.  Their cooldown lives
      // separately from the transient POI so a consumed box/toy is not
      // recreated on the very next Auto decision.
      propPoiCooldowns: new Map(),
      poiSequence: 0,
      // Runtime inventory overlays the YAML-defined props. This keeps the
      // on-card sandbox reversible without mutating the user's dashboard
      // configuration.
      runtimeProps: new Map(),
      removedPropIds: new Set(),
      // Configuration describes the room; this set is a reversible, local
      // visibility layer for the compact Props controls. It never mutates
      // dashboard YAML, and lets a core fixture be switched off and back on.
      disabledPropTypes: new Set(),
      propSequence: 0,
      poiPlacementArmed: false,
      activityLog: [],
      logStartedAt: this.startedAt,
      lastObservedState: null,
    };
    this.resizeObserver = new ResizeObserver(() => this.update());
  }

  setConfig(config) {
    const provided = config || {};
    const hasControls = Object.prototype.hasOwnProperty.call(provided, "show_controls");
    const hasLegacyControls = Object.prototype.hasOwnProperty.call(provided, "show_pose_test_controls");
    this.config = {
      ...PixelPetCard.defaults,
      ...provided,
      show_controls: hasControls
        ? this.bool(provided.show_controls)
        : hasLegacyControls
          ? this.bool(provided.show_pose_test_controls)
          : PixelPetCard.defaults.show_controls,
    };
    this.viewModeOverride = null;
    this.debug.showCat = this.config.show_cat !== false;
    this.debug.showPawDebug = this.bool(this.config.show_paw_debug);
    this.debug.showPoiDebug = this.bool(this.config.show_poi_debug);
    this.debug.showPathDebug = this.bool(this.config.show_path_debug);
    this.debug.showSurfaceDebug = this.bool(this.config.show_surface_debug);
    this.debug.showActivityLog = this.bool(this.config.show_activity_log);
    this.autoEnabled = this.bool(this.config.auto_enabled);
    this.manualState = null;
    this.world.activityLog = [];
    this.world.lastObservedState = null;
    this.world.surfaceTravel = null;
    this.world.boxEntry = null;
    this.world.glassVisit = null;
    this.world.robotVacuum = null;
    this.world.robotBoarding = null;
    this.world.propStates.clear();
    this.world.runtimeProps.clear();
    this.world.removedPropIds.clear();
    this.world.disabledPropTypes.clear();
    this.world.propSequence = 0;
    this.world.pois.clear();
    this.world.propPoiCooldowns.clear();
    this._debugRobotVacuumStarted = false;
    this.startedAt = this.getWorldNow();
    this.world.logStartedAt = this.startedAt;
    this.autoState = null;
    this.motion = { sequence: 0, traitKey: null, traits: null };
    this.render();
  }

  set hass(value) {
    const previousTimeZone = this._clockTimeZone;
    this._hass = value;
    this._clockTimeZone = value?.config?.time_zone || null;
    if (previousTimeZone !== this._clockTimeZone) {
      this._clockSignature = "";
      this._updateClockTime(true);
    }
    this.update();
  }

  getCardSize() {
    return Math.ceil((Number(this.config.height) || 260) / 50);
  }

  getViewMode() {
    const mode = this.viewModeOverride || this.config.view_mode;
    return mode === "world" ? "world" : "cat_focus";
  }

  showControls() {
    return this.bool(this.config.show_controls);
  }

  toggleViewMode() {
    this.viewModeOverride = this.getViewMode() === "cat_focus" ? "world" : "cat_focus";
    this.logActivity?.("frame", `view ${this.getViewMode()}`);
    this.update();
    this.updateViewToggle();
  }

  getCameraViewBox(layout, state) {
    if (this.getViewMode() === "world") return `0 0 ${layout.width} ${layout.height}`;
    // A proportional crop gives the cat priority without changing the
    // authored pixel geometry. The camera follows its support point, which is
    // stable for the same pose on ground, elevated, and moving surfaces.
    const scale = 1.5;
    const width = layout.width / scale;
    const height = layout.height / scale;
    const stateX = Number(state?.x);
    const catCenterX = Number.isFinite(stateX)
      ? stateX + layout.spriteWidth / 2
      : layout.width / 2;
    const catSupportY = Number(state?.groundY ?? layout.floorY);
    // Allow the camera beyond world edges so an edge-bound cat is still centred.
    const x = catCenterX - width / 2;
    const y = catSupportY - height * 0.72;
    return `${Math.round(x)} ${Math.round(y)} ${Math.round(width)} ${Math.round(height)}`;
  }

  connectedCallback() {
    this.resizeObserver.observe(this);
    this.render();
    this._startClockTimer();
    this.animate();
  }

  ensureDebugRobotVacuum(layout, now) {
    if (!this.bool(this.config.debug_robot_vacuum) || this._debugRobotVacuumStarted) return;
    this._debugRobotVacuumStarted = true;
    const id = "debug-robot-vacuum";
    if (!this.world.runtimeProps.has(id)) {
      this.world.runtimeProps.set(id, { id, type: "robot_vacuum", label: "Debug robot vacuum" });
    }
    this.startRobotVacuum(id, layout, now);
    this.startRobotBoarding(id, layout, now);
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = null;
    this._stopClockTimer();
  }

  _getHomeAssistantTimeParts(now = Date.now()) {
    const date = new Date(now);
    const timeZone = this._hass?.config?.time_zone || undefined;
    const readParts = (options) => {
      const parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(date);
      const number = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
      return { hour: number("hour"), minute: number("minute"), second: number("second") };
    };
    try {
      return readParts({ timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    } catch (error) {
      // A transient/invalid HA zone must never stop the card. The browser zone
      // is a safe temporary fallback until the HA config becomes available.
      return readParts({ hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    }
  }

  _clockEndpointForAngle(angleDegrees, radius, centreX, centreY) {
    const radians = angleDegrees * Math.PI / 180;
    return {
      x: Math.round(centreX + Math.sin(radians) * radius),
      y: Math.round(centreY - Math.cos(radians) * radius),
    };
  }

  _rasterClockHand(centreX, centreY, endpoint) {
    const cells = [];
    let x = centreX;
    let y = centreY;
    const dx = Math.abs(endpoint.x - x);
    const dy = -Math.abs(endpoint.y - y);
    const stepX = x < endpoint.x ? 1 : -1;
    const stepY = y < endpoint.y ? 1 : -1;
    let error = dx + dy;
    while (true) {
      // The face's existing centre dot remains visible; hands begin on the
      // first outward cell, matching the supplied static-clock proportions.
      if (x !== centreX || y !== centreY) cells.push([x, y]);
      if (x === endpoint.x && y === endpoint.y) break;
      const twiceError = 2 * error;
      if (twiceError >= dy) { error += dy; x += stepX; }
      if (twiceError <= dx) { error += dx; y += stepY; }
    }
    return cells;
  }

  _getClockHandCells(parts = this._clockParts || this._getHomeAssistantTimeParts()) {
    const hour = Number(parts?.hour) || 0;
    const minute = Number(parts?.minute) || 0;
    const second = Number(parts?.second) || 0;
    const minuteAngle = (minute + second / 60) * 6;
    const hourAngle = ((hour % 12) + minute / 60 + second / 3600) * 30;
    const centreX = 7;
    const centreY = 7;
    const minuteCells = this._rasterClockHand(centreX, centreY, this._clockEndpointForAngle(minuteAngle, 4, centreX, centreY));
    const hourCells = this._rasterClockHand(centreX, centreY, this._clockEndpointForAngle(hourAngle, 3, centreX, centreY));
    return [...new Map([...minuteCells, ...hourCells].map(([x, y]) => [`${x},${y}`, [x, y]])).values()];
  }

  _clockSignatureForParts(parts) {
    return this._getClockHandCells(parts).map(([x, y]) => `${x},${y}`).sort().join("|");
  }

  _updateClockTime(force = false) {
    const parts = this._getHomeAssistantTimeParts();
    const signature = this._clockSignatureForParts(parts);
    if (!force && signature === this._clockSignature) return;
    this._clockParts = parts;
    this._clockSignature = signature;
    if (this.isConnected) this.update();
  }

  _startClockTimer() {
    if (this._clockTimer) return;
    this._updateClockTime(true);
    this._clockTimer = setInterval(() => this._updateClockTime(), 1000);
  }

  _stopClockTimer() {
    if (!this._clockTimer) return;
    clearInterval(this._clockTimer);
    this._clockTimer = null;
  }

  animate() {
    if (this.frameRequest) return;
    const tick = () => {
      this.frameRequest = requestAnimationFrame(tick);
      this.update();
    };
    this.frameRequest = requestAnimationFrame(tick);
  }

  bool(value) {
    return value === true || value === "true" || value === 1 || value === "1";
  }

  getWorldNow() {
    const realtime = performance.now();
    const activePause = this.clock?.paused ? realtime - this.clock.pausedAt : 0;
    return realtime - (this.clock?.pauseOffset || 0) - activePause;
  }

  toggleWorldClock() {
    const realtime = performance.now();
    if (this.clock.paused) {
      this.clock.pauseOffset += realtime - this.clock.pausedAt;
      this.clock.paused = false;
    } else {
      this.clock.pausedAt = realtime;
      this.clock.paused = true;
    }
    this.updateDebugControls();
    this.update();
  }

  stepWorldClock(direction) {
    if (!this.clock.paused) this.toggleWorldClock();
    const beat = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    // Virtual time advances when the accumulated real-time pause shrinks.
    this.clock.pauseOffset -= Math.sign(direction) * beat;
    this.update();
  }

  toggleFrameName() {
    this.debug.showFrameName = !this.debug.showFrameName;
    this.updateDebugControls();
    this.update();
  }

  toggleActivityLog() {
    this.debug.showActivityLog = !this.debug.showActivityLog;
    this.updateDebugControls();
    this.update();
  }

  logWorldEvent(kind, message, now = this.getWorldNow()) {
    const entries = this.world.activityLog;
    const previous = entries[entries.length - 1];
    // Repeated animation frames can be very noisy; preserve a compact world
    // history without hiding distinct state changes or warnings.
    if (previous && previous.kind === kind && previous.message === message) return;
    entries.push({ at: Math.max(0, Math.round(now - (this.world.logStartedAt || this.startedAt))), kind, message });
    if (entries.length > 28) entries.splice(0, entries.length - 28);
  }

  observeWorldState(state, layout, now) {
    const frameName = this.getFrameName(state);
    const observed = {
      x: Math.round(state.x),
      y: Math.round(state.groundY ?? layout.floorY),
      frameName,
      at: now,
    };
    const previous = this.world.lastObservedState;
    if (previous) {
      const dx = Math.abs(observed.x - previous.x);
      const dy = Math.abs(observed.y - previous.y);
      // This is deliberately observational: authored leap frames also flag
      // when their body anchor moves far. The log lets us inspect and decide
      // whether a flagged discontinuity is justified rather than masking it.
      if (dx > layout.cell || dy > layout.cell) {
        this.logWorldEvent("warn", `continuity Δ${Math.round(dx / layout.cell)}x,${Math.round(dy / layout.cell)}y · ${previous.frameName} → ${frameName}`, now);
      }
      if (previous.frameName !== frameName) this.logWorldEvent("frame", frameName, now);
    } else {
      this.logWorldEvent("frame", frameName, now);
    }
    this.world.lastObservedState = observed;
  }

  toggleAuto() {
    const now = this.getWorldNow();
    const layout = this.getLayout();
    if (this.autoEnabled) {
      const current = this.getSpriteState(now, layout, true);
      this.manualState = { x: Math.round(current.x), facing: current.facing, surfaceId: this.autoState?.surfaceId || null };
      // Cancelling the planner should not cancel an explicit pose trigger.
      if (!this.poseTest) this.autoState = null;
      this.autoEnabled = false;
    } else {
      const manual = this.manualState || { x: layout.leftX, facing: 1, surfaceId: null };
      this.autoState = { ...manual, pose: "stand", activity: null, initial: false, surfaceActivities: 0 };
      this.manualState = null;
      this.autoEnabled = true;
    }
    this.updatePoseTestButtons();
    this.update();
  }

  getManualState(layout) {
    const manual = this.manualState || { x: layout.leftX, facing: 1, surfaceId: null };
    const state = this.getStandPauseState(0, layout, manual.x, manual.facing);
    if (!manual.surfaceId) return state;
    const surface = this.getElevatedSurface(layout, manual.surfaceId);
    return { ...state, groundY: this.getGroundYForSupport(state.rows, surface.topY, state.facing, layout) };
  }

  adjustElevatedHeight(delta) {
    // The green debug surface deliberately has no ceiling: it is a placement
    // probe, so testing a very tall surface must be possible. Keep only the
    // four-cell minimum needed for a meaningful ledge.
    this.debug.elevatedHeightCells = Math.max(4, this.debug.elevatedHeightCells + delta);
    this.updateDebugControls();
    this.update();
  }

  getPoseRows(name) {
    const rows = PixelPetCard.POSES[name] || PixelPetCard.POSES.stand;
    // The standing art's paws sit one cell behind the revised first walk
    // frame. Shift the artwork, rather than the sprite anchor, so mirrored
    // left-facing poses keep the same backwards-from-cat placement.
    return name === "stand" || name === "look_up" ? this.shiftRows(rows, -1) : rows;
  }

  shiftRows(rows, cells) {
    if (!cells) return rows;
    return rows.map((row) => cells < 0
      ? `${row.slice(Math.min(-cells, row.length))}${".".repeat(Math.min(-cells, row.length))}`
      : `${".".repeat(cells)}${row}`.slice(0, row.length));
  }

  getCells(rows) {
    const cells = [];
    const paws = new Map();
    const tokens = new Map();
    rows.forEach((row, y) => [...row].forEach((value, x) => {
      if (value === "#" || value === "R" || value === "F" || value === "B" || value === "M" || value === "T") {
        cells.push([x, y]);
        tokens.set(`${x},${y}`, value);
      }
      if (value === "R" || value === "F" || value === "B") paws.set(`${x},${y}`, value);
    }));
    return { cells, paws, tokens };
  }

  getCardHeight() {
    const requested = Math.max(140, Number(this.config.height) || 260);
    const hasSofa = this.isPropTypeEnabled("sofa_half");
    if (!hasSofa) return requested;
    const width = Math.max(180, Math.round(this.getBoundingClientRect().width || 420));
    const padding = Math.max(8, Number(this.config.padding) || 18);
    const cell = Math.max(4, Math.min(Math.max(4, Number(this.config.cell_size) || 9), Math.floor((width - padding * 2) / 24)));
    // A 30-cell high sofa needs the 24-cell cat plus a small visual margin
    // above its top landing.  Expand the stage rather than crop the cat.
    return Math.max(requested, padding * 2 + cell * 56);
  }

  getLayout() {
    const width = Math.max(180, Math.round(this.getBoundingClientRect().width || 420));
    const height = this.getCardHeight();
    const padding = Math.max(8, Number(this.config.padding) || 18);
    const requestedCell = Math.max(4, Number(this.config.cell_size) || 9);
    const cell = Math.max(4, Math.min(requestedCell, Math.floor((width - padding * 2) / 24)));
    const backdropUnit = this.getBackdropUnit(cell);
    const labelReserve = this.bool(this.config.show_entity_backdrop)
      ? Math.ceil(backdropUnit * 9)
      : 0;
    const spriteWidth = cell * 24;
    const floorY = height - padding - labelReserve;
    const available = Math.max(0, width - padding * 2 - spriteWidth);
    // Stay modest: the cat should patrol a portion of a wide card, not race
    // edge-to-edge. Every distance is rounded to an integer sprite cell.
    const travelCells = Math.max(0, Math.min(Math.floor(available / cell), Math.max(5, Math.floor(width / cell * 0.22))));
    const travelPx = travelCells * cell;
    const centreX = (width - spriteWidth) / 2;
    return {
      width,
      height,
      cell,
      floorY,
      spriteWidth,
      travelCells,
      leftX: Math.round(centreX - travelPx / 2),
      backdropUnit,
      labelReserve,
    };
  }

  getBackdropUnit(catCell) {
    return String(this.config.backdrop_resolution || "double") === "same"
      ? catCell
      : catCell / 2;
  }

  getWalkFrameMs() {
    return Math.max(80, Number(this.config.walk_cycle_ms) || 1000) / PixelPetCard.WALK_FRAMES.length;
  }

  hashSeed(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  getMotionTraits() {
    const key = `${this.config.world_id || "default"}:${this.config.cat_id || "cat-1"}`;
    if (this.motion.traitKey === key && this.motion.traits) return this.motion.traits;
    const random = this.seededRandom(this.hashSeed(key));
    // A cat's movement character is stable, subtle, and independent from
    // route-level randomness. Future multi-cat scenes can reuse this key.
    this.motion.traitKey = key;
    const configuredVariation = Number(this.config.motion_variation);
    const variation = Math.max(0, Math.min(0.2, Number.isFinite(configuredVariation) ? configuredVariation : 0.06));
    this.motion.traits = {
      pace: 1 - variation + random() * variation * 2,
      acceleration: 1 - variation + random() * variation * 2,
      braking: 1 - variation + random() * variation * 2,
    };
    return this.motion.traits;
  }

  getMotionProfile(name) {
    const amble = { name: "amble", start: 1, cruise: 1, finish: 1, accelerateUntil: 0, brakeFrom: 1 };
    const base = name === "food" || name === "prompt"
      ? { name, start: 2, cruise: 4.8, finish: 0.9, accelerateUntil: 0.14, brakeFrom: 0.58 }
      : name === "poi"
        // POIs use the ordinary walk animation, but farther invitations are
        // purposefully quicker. This stays a property of the route profile,
        // so acceleration, braking and per-cat traits remain the one source
        // of truth for movement timing.
        ? { ...amble, name, distanceBias: { afterLengths: 0.75, perLength: 0.22, max: 1.65 } }
        : amble;
    const override = this.config.motion_profiles?.[name];
    if (!override || typeof override !== "object") return base;
    const numeric = (key, fallback) => Number.isFinite(Number(override[key])) ? Number(override[key]) : fallback;
    const accelerateUntil = Math.max(0, Math.min(0.9, numeric("accelerate_until", base.accelerateUntil)));
    return {
      ...base,
      start: Math.max(0.2, numeric("start", base.start)),
      cruise: Math.max(0.2, numeric("cruise", base.cruise)),
      finish: Math.max(0.2, numeric("finish", base.finish)),
      accelerateUntil,
      brakeFrom: Math.max(accelerateUntil, Math.min(1, numeric("brake_from", base.brakeFrom))),
    };
  }

  createMotionRoute(originX, destinationX, layout, profileName = "amble", routeKey = "route") {
    const cells = Math.max(0, Math.round(Math.abs(destinationX - originX) / layout.cell));
    const direction = destinationX >= originX ? 1 : -1;
    const profile = this.getMotionProfile(profileName);
    const traits = this.getMotionTraits();
    const random = this.seededRandom(this.hashSeed(`${this.config.world_id || "default"}:${this.config.cat_id || "cat-1"}:${routeKey}:${this.motion.sequence++}`));
    const baseFrameMs = this.getWalkFrameMs();
    const catLengths = cells / Math.max(1, Math.round(layout.spriteWidth / layout.cell));
    const distanceBias = profile.distanceBias
      ? Math.min(
        profile.distanceBias.max,
        1 + Math.max(0, catLengths - profile.distanceBias.afterLengths) * profile.distanceBias.perLength
      )
      : 1;
    const cumulativeMs = [];
    let total = 0;
    for (let index = 0; index < cells; index += 1) {
      const progress = (index + 0.5) / Math.max(1, cells);
      let speed = profile.cruise;
      if (progress < profile.accelerateUntil) {
        const phase = progress / Math.max(0.01, profile.accelerateUntil);
        speed = profile.start + (profile.cruise - profile.start) * phase * traits.acceleration;
      } else if (progress > profile.brakeFrom) {
        const phase = (progress - profile.brakeFrom) / Math.max(0.01, 1 - profile.brakeFrom);
        speed = profile.cruise + (profile.finish - profile.cruise) * Math.min(1, phase * traits.braking);
      }
      const journeyVariance = 0.96 + random() * 0.08;
      total += Math.round(Math.max(45, Math.min(420, baseFrameMs / (speed * distanceBias * traits.pace * journeyVariance))));
      cumulativeMs.push(total);
    }
    return { originX, destinationX, direction, cells, catLengths, distanceBias, profile: profile.name, cumulativeMs, duration: total };
  }

  getMotionRouteStep(route, elapsed) {
    let step = 0;
    while (step < route.cumulativeMs.length && elapsed >= route.cumulativeMs[step]) step += 1;
    return step;
  }

  getGlassState(propId) {
    const existing = this.world.propStates.get(propId) || {};
    // Two cells remain deliberately unreachable: the cat can lap the surface
    // and lower it, but cannot magically drink the bottom of a tall glass.
    const waterLevel = Math.max(0, Math.min(5, Number.isFinite(Number(existing.waterLevel)) ? Number(existing.waterLevel) : 5));
    return { ...existing, waterLevel };
  }

  setGlassWaterLevel(propId, waterLevel) {
    const state = this.getGlassState(propId);
    this.world.propStates.set(propId, { ...state, waterLevel: Math.max(0, Math.min(5, Math.round(waterLevel))) });
  }

  getRenderablePropArt(type, art, propId) {
    if (type !== "water_glass") return art;
    const { waterLevel } = this.getGlassState(propId);
    // One cyan cell represents the visible glass above the water.  The blue
    // band rises from the bottom, exactly as in the supplied source sheets.
    const rows = Array.from({ length: 6 }, (_, row) => {
      const waterStartsAt = 6 - waterLevel;
      return row >= waterStartsAt ? "WWW" : "GGG";
    });
    return { ...art, rows };
  }

  getWorldProps(layout) {
    const inventory = this.getRawWorldProps().filter((prop) => !this.world.disabledPropTypes.has(prop.type));
    return inventory
      .filter((prop) => prop && PixelPetCard.PROP_DEFINITIONS[prop.type])
      .map((prop, index) => {
        const definition = PixelPetCard.PROP_DEFINITIONS[prop.type];
        const id = String(prop.id || `${prop.type}-${index + 1}`);
        const robotRender = prop.type === "robot_vacuum"
          ? this.getRobotVacuumRenderState(id, layout, this.getWorldNow())
          : null;
        // A sofa stays a literal 30-cell half in a compact card. Once the
        // available world is wide enough, compose the matching mirrored half
        // so a room-scale card gets the complete sofa without scaling pixels.
        const art = robotRender?.art || (prop.type === "sofa_half"
          ? this.getResponsiveSofaArt(layout)
          : this.getRenderablePropArt(prop.type, definition.art, id));
        const side = String(prop.side || definition.defaultSide || "right") === "left" ? "left" : "right";
        const bottomOffsetCells = Math.max(0, Number(prop.bottom_offset_cells) || 0);
        if (definition.placement === "edge") {
          const side = String(prop.side || "right") === "left" ? "left" : "right";
          const insetCells = Number.isFinite(Number(prop.inset_cells)) ? Number(prop.inset_cells) : (definition.insetCells || 0);
          const x = side === "left"
            ? (insetCells * layout.cell)
            : layout.width - art.width * layout.cell - insetCells * layout.cell;
          return {
            id,
            type: prop.type,
            side,
            x: Math.round(x),
            y: Math.round(layout.floorY - art.height * layout.cell - bottomOffsetCells * layout.cell),
            art,
            label: definition.label,
            category: definition.category,
            capabilities: { ...definition.capabilities, ...(prop.capabilities || {}) },
            state: { ...(prop.state || {}), ...(this.world.propStates.get(id) || {}) },
            variant: prop.type === "sofa_half" ? (art.width > PixelPetCard.PROPS.sofa_half.width ? "full" : "half") : null,
          };
        }
        if (robotRender) {
          return {
            id,
            type: prop.type,
            side: robotRender.facing > 0 ? "right" : "left",
            x: robotRender.x,
            y: Math.round(layout.floorY - art.height * layout.cell),
            art,
            label: definition.label,
            category: definition.category,
            capabilities: { ...definition.capabilities, ...(prop.capabilities || {}) },
            state: { ...(prop.state || {}), ...(this.world.propStates.get(id) || {}), robot: robotRender },
            variant: null,
          };
        }
        const maxX = Math.max(0, layout.width - art.width * layout.cell);
        const requestedX = Number.isFinite(Number(prop.x_cells))
          ? Number(prop.x_cells) * layout.cell
          : maxX * Math.max(0, Math.min(1, Number.isFinite(Number(prop.x_ratio)) ? Number(prop.x_ratio) : definition.xRatio));
        return {
          id,
          type: prop.type,
          side,
          x: Math.round(Math.max(0, Math.min(maxX, requestedX))),
          y: Math.round(layout.floorY - art.height * layout.cell - bottomOffsetCells * layout.cell),
          art,
          label: definition.label,
          category: definition.category,
          capabilities: { ...definition.capabilities, ...(prop.capabilities || {}) },
          state: { ...(prop.state || {}), ...(this.world.propStates.get(id) || {}) },
          variant: prop.type === "sofa_half" ? (art.width > PixelPetCard.PROPS.sofa_half.width ? "full" : "half") : null,
        };
      });
  }

  getRobotVacuumArt(view = "side", ledOn = false, facing = 1) {
    const art = PixelPetCard.PROPS[`robot_vacuum_${view}`] || PixelPetCard.PROPS.robot_vacuum_side;
    // The source sheets use a 20 x 5 side profile. Mirroring the complete
    // grid is important: the LED is a five-cell housing, not just a red dot.
    // That keeps the housing attached to the leading end in both directions.
    const rows = art.rows.map((row) => [...row]);
    if (facing < 0) rows.forEach((row) => row.reverse());
    if (!ledOn || !art.ledCell) return { ...art, rows: rows.map((row) => row.join("")) };
    const [baseX, y] = art.ledCell;
    const x = facing < 0 ? art.width - 1 - baseX : baseX;
    if (rows[y]?.[x] !== undefined) rows[y][x] = "R";
    return { ...art, rows: rows.map((row) => row.join("")) };
  }

  getRobotVacuumTravelDuration(layout) {
    // 10 world cells per second looks purposeful without out-running the
    // pixel animation. The art width keeps fully-off-screen entrances honest.
    const distance = layout.width + PixelPetCard.PROPS.robot_vacuum_side.width * layout.cell;
    return Math.max(900, Math.round((distance / (layout.cell * 10)) * 1000));
  }

  getRobotVacuumPhaseDuration(phase, layout) {
    // Five authored robot-only cells make one reversal. A little over a
    // quarter-second per state keeps the turn readable at native pixel scale.
    return phase.startsWith("turn") ? 1250 : this.getRobotVacuumTravelDuration(layout);
  }

  startRobotVacuum(propId, layout = this.getLayout(), now = this.getWorldNow()) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    this.world.robotVacuum = {
      propId,
      phase: "outbound",
      startedAt: now,
      enterDirection: direction,
      // Pass zero is the foreground pass. Each completed turn advances this
      // count so furniture can decide whether the next traversal is occluded.
      passIndex: 0,
      // The reference sheet supplies both possible sweeps around the chassis.
      // Keep the choice explicit so every reversal may rotate clockwise or
      // counter-clockwise independently of the route the robot is travelling.
      turnDirection: Math.random() < 0.5 ? 1 : -1,
    };
    this.logWorldEvent("robot", `${propId} enters ${direction > 0 ? "from left" : "from right"}`, now);
  }

  requestRobotExit(propId, layout = this.getLayout(), now = this.getWorldNow()) {
    const robot = this.world.robotVacuum;
    if (!robot || robot.propId !== propId) return false;
    const render = this.getRobotVacuumRenderState(propId, layout, now);
    const width = PixelPetCard.PROPS.robot_vacuum_side.width * layout.cell;
    robot.phase = "exit";
    robot.startedAt = now;
    robot.exitFromX = render.x;
    // Leave by whichever edge is closer at the moment the request arrives.
    robot.exitDirection = render.x + width / 2 < layout.width / 2 ? -1 : 1;
    this.logWorldEvent("robot", `${propId} heads for ${robot.exitDirection > 0 ? "right" : "left"} exit`, now);
    return true;
  }

  advanceRobotVacuum(now, layout) {
    const robot = this.world.robotVacuum;
    if (!robot) return;
    const nextPhase = {
      outbound: "turn-outbound",
      "turn-outbound": "return",
      return: "turn-return",
      // A robot with a prospective or actual rider stays in the room.  This
      // gives the cat a real moving target to catch and, later, gives the
      // dismount controller a deliberate place to request an exit.
      "turn-return": this.world.robotBoarding?.propId === robot.propId ? "loop-outbound" : "exit",
      exit: null,
      "loop-outbound": "turn-loop-outbound",
      "turn-loop-outbound": "loop-return",
      "loop-return": "turn-loop-return",
      "turn-loop-return": "loop-outbound",
    };
    let guard = 0;
    while (guard++ < 8) {
      const duration = this.getRobotVacuumPhaseDuration(robot.phase, layout);
      if (now - robot.startedAt < duration) return;
      robot.startedAt += duration;
      const next = nextPhase[robot.phase];
      if (!next) {
        const id = robot.propId;
        this.world.robotVacuum = null;
        this.world.runtimeProps.delete(id);
        this.world.propStates.delete(id);
        this.logWorldEvent("robot", `${id} exits scene`, now);
        this.render();
        return;
      }
      robot.phase = next;
      if (robot.phase === "return" || robot.phase === "loop-return") {
        robot.passIndex = (Number(robot.passIndex) || 0) + 1;
      }
      if (robot.phase.startsWith("turn")) {
        robot.turnDirection = Math.random() < 0.5 ? 1 : -1;
        this.logWorldEvent("robot", `${robot.propId} turns ${robot.turnDirection > 0 ? "clockwise" : "counter-clockwise"}`, now);
      }
    }
  }

  getRobotVacuumRenderState(propId, layout, now) {
    const robot = this.world.robotVacuum;
    const base = PixelPetCard.PROPS.robot_vacuum_side;
    if (!robot || robot.propId !== propId) {
      return { art: base, x: -base.width * layout.cell, facing: 1, velocityX: 0, phase: "inactive" };
    }
    const duration = this.getRobotVacuumPhaseDuration(robot.phase, layout);
    const progress = Math.max(0, Math.min(1, (now - robot.startedAt) / duration));
    const width = base.width * layout.cell;
    const outwardDirection = robot.enterDirection;
    const returnDirection = -outwardDirection;
    const from = outwardDirection > 0 ? -width : layout.width;
    const far = outwardDirection > 0 ? layout.width - width : 0;
    const near = outwardDirection > 0 ? 0 : layout.width - width;
    let x = from;
    let facing = outwardDirection;
    let view = "side";
    let artFacing = facing;
    let velocityX = 0;
    if (robot.phase === "outbound") {
      x = from + (far - from) * progress;
      velocityX = (far - from) / duration;
    }
    else if (robot.phase === "loop-outbound") {
      x = near + (far - near) * progress;
      facing = outwardDirection;
      artFacing = facing;
      velocityX = (far - near) / duration;
    }
    else if (robot.phase === "return") {
      x = far + (near - far) * progress;
      facing = returnDirection;
      artFacing = facing;
      velocityX = (near - far) / duration;
    }
    else if (robot.phase === "loop-return") {
      x = far + (near - far) * progress;
      facing = returnDirection;
      artFacing = facing;
      velocityX = (near - far) / duration;
    }
    else if (robot.phase === "exit") {
      const exitDirection = robot.exitDirection ?? returnDirection;
      const exitFromX = robot.exitFromX ?? near;
      const exit = exitDirection > 0 ? layout.width : -width;
      x = exitFromX + (exit - exitFromX) * progress;
      facing = exitDirection;
      artFacing = facing;
      velocityX = (exit - exitFromX) / duration;
    }
    else {
      const turnAtFar = robot.phase === "turn-outbound" || robot.phase === "turn-loop-outbound";
      x = turnAtFar ? far : near;
      const turnFacing = turnAtFar ? outwardDirection : returnDirection;
      artFacing = turnFacing;
      // Side → camera/back → opposite side. The narrow turn artwork remains
      // centred over the stationary vacuum rather than snapping to an edge.
      const frames = robot.turnDirection < 0
        ? ["turn_1", "turn_8", "turn_7", "turn_6", "turn_5"]
        : ["turn_1", "turn_2", "turn_3", "turn_4", "turn_5"];
      view = frames[Math.min(frames.length - 1, Math.floor(progress * frames.length))];
      // The turn art is authored in the incoming orientation. Its final frame
      // is already the reversed side profile, so keep its grid unflipped.
      if (progress >= 0.8) facing = -turnFacing;
    }
    const art = this.getRobotVacuumArt(view, Math.floor(now / 350) % 2 === 0, artFacing);
    return { art, x: Math.round(x), facing, velocityX, phase: robot.phase };
  }

  getRobotDeckSurface(propId, layout) {
    return this.getElevatedSurfaces(layout).find((surface) => (
      surface.propId === propId && surface.type === "robot-vacuum-deck"
    )) || null;
  }

  startRobotBoarding(propId, layout = this.getLayout(), now = this.getWorldNow()) {
    const robot = this.getRobotVacuumRenderState(propId, layout, now);
    const deck = this.getRobotDeckSurface(propId, layout);
    if (!deck || robot.phase === "inactive") return;
    const current = this.getSpriteState(now, layout, true);
    const currentSurface = current.surfaceId ? this.getElevatedSurface(layout, current.surfaceId) : null;
    const sourceIsHigher = currentSurface && currentSurface.topY < deck.topY;
    const facing = robot.facing || (robot.velocityX >= 0 ? 1 : -1);
    // Ground cats wait just ahead of the machine. A cat already above the
    // deck instead uses its existing descent art once the vacuum reaches
    // the relevant edge.
    // Reuse the normal descent take-off anchor when boarding from above.  This
    // keeps the initial peeking frame on the source edge instead of placing
    // the cat's sprite origin directly at that edge.
    const sourceEdgeDirection = sourceIsHigher ? -facing : null;
    const sourceEdgeX = sourceIsHigher
      ? this.getElevationEdge(currentSurface, sourceEdgeDirection)
      : null;
    const sourceTakeoffPawX = sourceIsHigher
      ? sourceEdgeX + sourceEdgeDirection * layout.cell
      : null;
    const launchX = sourceIsHigher
      ? this.getSurfaceSafeX(
        PixelPetCard.DESCENT_FRAMES[1],
        facing,
        this.getFrameXForLeadPaw(PixelPetCard.DESCENT_FRAMES[1], facing, sourceTakeoffPawX, layout),
        currentSurface,
        layout,
      )
      : Math.round(layout.width * 0.5 - layout.spriteWidth / 2);
    this.poseTest = null;
    this.world.boxEntry = null;
    this.world.elevated = null;
    this.world.robotBoarding = {
      propId,
      phase: "approach",
      startedAt: now,
      facing,
      sourceSurfaceId: sourceIsHigher ? currentSurface.id : null,
      sourceEdgeDirection,
      sourceEdgeX,
      route: this.createMotionRoute(current.x, launchX, layout, "prompt", "robot-board-approach"),
      launchX,
      boardFrame: 0,
    };
    this.logWorldEvent("poi", `robot deck invite ${propId}`, now);
    this.updateWorldActionControls();
  }

  isRobotRiding() {
    return this.world.robotBoarding?.phase === "ride";
  }

  requestRobotDismount(intent = null, exitRobot = false) {
    const boarding = this.world.robotBoarding;
    if (!boarding || boarding.phase !== "ride") return false;
    const layout = this.getLayout();
    const now = this.getWorldNow();
    const deck = this.getRobotDeckSurface(boarding.propId, layout);
    if (!deck) return false;
    const destinationX = intent?.targetX;
    const deckCentreX = deck.x + deck.width / 2;
    const direction = Number.isFinite(destinationX)
      ? (destinationX >= deckCentreX ? 1 : -1)
      : (this.getRobotVacuumRenderState(boarding.propId, layout, now).facing || 1);
    boarding.phase = "dismount";
    boarding.startedAt = now;
    boarding.dismountFacing = direction;
    boarding.dismountPawX = Math.max(
      layout.cell,
      Math.min(layout.width - layout.cell, Math.round(deckCentreX + direction * layout.cell * 4)),
    );
    boarding.afterDismount = intent;
    boarding.exitAfterDismount = exitRobot;
    boarding.rideActivity = null;
    this.logWorldEvent("poi", `robot dismount ${boarding.propId}`, now);
    this.updateWorldActionControls();
    this.update();
    return true;
  }

  finishRobotDismount(boarding, layout, now) {
    const rows = PixelPetCard.ELEVATE_FRAMES[1];
    const x = this.getFrameXForLeadPaw(rows, boarding.dismountFacing, boarding.dismountPawX, layout);
    const intent = boarding.afterDismount;
    const exitRobot = boarding.exitAfterDismount;
    const propId = boarding.propId;
    this.world.robotBoarding = null;
    this.manualState = { x, facing: boarding.dismountFacing, surfaceId: null };
    this.autoState = { x, facing: boarding.dismountFacing, pose: "stand", activity: null, initial: false };
    if (exitRobot) this.requestRobotExit(propId, layout, now);
    if (intent?.type === "prop") this.activatePropAction(intent.action, intent.propId, true);
    else if (intent?.type === "surface") this.startSurfaceTravelTest(intent.surfaceId, true, "prompt", true);
    this.updateWorldActionControls();
    return this.getAutoState(now, layout);
  }

  getRobotRideFrameIndex(robot, now, layout) {
    if (!robot.phase.startsWith("turn")) return robot.facing >= 0 ? 0 : 4;
    const elapsed = Math.max(0, now - this.world.robotVacuum.startedAt);
    const progress = Math.max(0, Math.min(1, elapsed / this.getRobotVacuumPhaseDuration(robot.phase, layout)));
    // The eight rider drawings are one continuous circle: 0 is the right-side
    // sit and 4 is the left-side sit.  Select a direction *from the actual
    // incoming side*, rather than always starting at frame 0.  This keeps the
    // left-to-right turn from playing backwards.
    const turnAtFar = robot.phase === "turn-outbound" || robot.phase === "turn-loop-outbound";
    const sourceFacing = turnAtFar ? this.world.robotVacuum.enterDirection : -this.world.robotVacuum.enterDirection;
    const clockwise = robot.turnDirection >= 0;
    const sweep = sourceFacing >= 0
      ? (clockwise ? [0, 1, 2, 3, 4] : [0, 7, 6, 5, 4])
      : (clockwise ? [4, 5, 6, 7, 0] : [4, 3, 2, 1, 0]);
    return sweep[Math.min(sweep.length - 1, Math.floor(progress * sweep.length))];
  }

  getRobotRideState(robot, deck, now, layout) {
    const boarding = this.world.robotBoarding;
    const riderFrame = this.getRobotRideFrameIndex(robot, now, layout);
    const rideRows = PixelPetCard.ROBOT_RIDE_FRAMES[riderFrame];
    // Rider drawings have different transparent margins while they turn.
    // Centre their *drawn* cells over the deck, rather than using a fixed
    // sprite origin, so a paw does not appear to detach halfway through spin.
    const getRidePlacement = (rows) => ({
      x: this.getFrameXForCentre(rows, 1, deck.x + deck.width / 2, layout),
      groundY: this.getGroundYForSupport(rows, deck.topY, 1, layout),
    });
    // Turning is always the authored rider spin. It deliberately overrides
    // every ambient activity so the cat visibly follows the deck's heading.
    if (robot.phase.startsWith("turn")) {
      return {
        rows: rideRows, ...getRidePlacement(rideRows), facing: 1,
        frame: riderFrame, walking: false,
        surfaceId: deck.id, frameName: `robot-ride-turn-${riderFrame + 1}`,
      };
    }
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const activities = [
      { type: "rider", duration: this.randomInt(6, 10) * frameMs },
      { type: "sit", duration: this.randomInt(9, 15) * frameMs },
      { type: "loaf", duration: this.randomInt(13, 20) * frameMs },
      { type: "clean", duration: this.randomInt(2, 3) * PixelPetCard.CLEANING_FRAMES.length * frameMs },
    ];
    let activity = boarding.rideActivity;
    if (!activity) {
      // Begin with the dedicated riding sit for a beat or two before the cat
      // settles into the ordinary repertoire available on a moving deck.
      activity = { ...activities[0], startedAt: boarding.startedAt };
      boarding.rideActivity = activity;
    }
    if (now - activity.startedAt >= activity.duration) {
      const choices = activities.filter((candidate) => candidate.type !== activity.type || candidate.type === "rider");
      activity = { ...choices[this.randomInt(0, choices.length - 1)], startedAt: now };
      boarding.rideActivity = activity;
    }
    if (activity.type === "rider") {
      const frame = robot.facing >= 0 ? 0 : 4;
      const rows = PixelPetCard.ROBOT_RIDE_FRAMES[frame];
      return {
        rows, ...getRidePlacement(rows), facing: 1,
        frame, walking: false, surfaceId: deck.id,
        frameName: `robot-ride-${frame + 1}`,
      };
    }
    const elapsed = Math.max(0, now - activity.startedAt);
    const facing = robot.facing >= 0 ? 1 : -1;
    const centredX = Math.round(deck.x + deck.width / 2 - layout.spriteWidth / 2);
    let state;
    if (activity.type === "sit") state = this.getSitState(elapsed, layout, centredX, facing);
    else if (activity.type === "loaf") state = this.getLoafState(elapsed, layout, centredX, facing);
    else {
      const frame = Math.floor(elapsed / frameMs) % PixelPetCard.CLEANING_FRAMES.length;
      state = { rows: PixelPetCard.CLEANING_FRAMES[frame], x: centredX, facing, frame, walking: false };
    }
    return {
      ...state,
      x: this.getSurfaceSafeX(state.rows, state.facing, state.x, deck, layout),
      groundY: this.getGroundYForSupport(state.rows, deck.topY, state.facing, layout),
      surfaceId: deck.id,
      frameName: `robot-ride-${activity.type}`,
    };
  }

  getFrameHorizontalBounds(rows, facing = 1) {
    const points = this.getCells(rows).cells.map(([x, y]) => [facing < 0 ? 23 - x : x, y]);
    if (!points.length) return { min: 0, max: 0 };
    return { min: Math.min(...points.map(([x]) => x)), max: Math.max(...points.map(([x]) => x)) + 1 };
  }

  getVerticalSurfaces(layout) {
    // Vertical faces are not landable platforms. They are world boundaries
    // for moving props today, and make a reusable contract for scratching or
    // other wall interactions later.
    return this.getWorldProps(layout)
      .filter((prop) => prop.type === "sofa_half")
      .flatMap((prop) => {
        const left = { id: `${prop.id}:vertical-left`, propId: prop.id, type: "sofa-vertical", x: prop.x, topY: prop.y, bottomY: layout.floorY };
        const right = { id: `${prop.id}:vertical-right`, propId: prop.id, type: "sofa-vertical", x: prop.x + prop.art.width * layout.cell, topY: prop.y, bottomY: layout.floorY };
        return [left, right];
      });
  }

  getRobotSofaCollision(robot, state, deck, layout) {
    const vacuum = this.world.robotVacuum;
    if (!vacuum || (Number(vacuum.passIndex) || 0) % 2 === 0 || !robot.velocityX) return null;
    const direction = robot.velocityX > 0 ? 1 : -1;
    const boundary = this.getVerticalSurfaces(layout).find((surface) => (
      direction > 0 ? surface.id.endsWith("vertical-left") : surface.id.endsWith("vertical-right")
    ));
    if (!boundary) return null;
    const bounds = this.getFrameHorizontalBounds(state.rows, state.facing);
    const catLeft = state.x + bounds.min * layout.cell;
    const catRight = state.x + bounds.max * layout.cell;
    const reachesFace = direction > 0 ? catRight >= boundary.x : catLeft <= boundary.x;
    const deckLeft = deck.x;
    const deckRight = deck.x + deck.width;
    const deckAtFace = direction > 0 ? deckRight >= boundary.x : deckLeft <= boundary.x;
    if (!reachesFace || !deckAtFace) return null;
    // Keep the entire cat on the *approaching* side of the vertical face.
    // Moving right reaches a sofa's left face, so the cat's leftmost cell is
    // pinned just to its right; moving left mirrors that rule with the
    // rightmost cell just to the face's left.  This is deliberately based on
    // the rendered-frame bounds, not sprite width, so sparse tail margins do
    // not let the body drift into the sofa.
    const pinnedX = direction > 0
      ? boundary.x - bounds.min * layout.cell
      : boundary.x - bounds.max * layout.cell;
    return { boundary, direction, pinnedX, bounds };
  }

  getRobotSofaPushState(robot, deck, state, now, layout) {
    const boarding = this.world.robotBoarding;
    const collision = this.getRobotSofaCollision(robot, state, deck, layout);
    if (!collision) return state;
    const pushed = { ...state, x: collision.pinnedX, frameName: `${state.frameName} · sofa push` };
    const catLeft = pushed.x + collision.bounds.min * layout.cell;
    const catRight = pushed.x + collision.bounds.max * layout.cell;
    const overlap = Math.max(0, Math.min(catRight, deck.x + deck.width) - Math.max(catLeft, deck.x));
    if (overlap / Math.max(1, catRight - catLeft) >= 0.5) return pushed;
    boarding.phase = "sofa-fall";
    boarding.startedAt = now;
    boarding.sofaFall = { ...pushed, boundaryId: collision.boundary.id };
    this.logWorldEvent("robot", `sofa pushes rider off at ${collision.boundary.id}`, now);
    return this.getRobotBoardingState(now, layout);
  }

  finishRobotSofaFall(boarding, layout, now) {
    const fallen = boarding.sofaFall;
    this.world.robotBoarding = null;
    this.manualState = { x: fallen.x, facing: fallen.facing, surfaceId: null };
    this.autoState = { x: fallen.x, facing: fallen.facing, pose: "stand", activity: null, initial: false };
    this.updateWorldActionControls();
    return this.getAutoState(now, layout);
  }

  getRobotBoardingState(now, layout) {
    const boarding = this.world.robotBoarding;
    const robot = this.getRobotVacuumRenderState(boarding.propId, layout, now);
    const deck = this.getRobotDeckSurface(boarding.propId, layout);
    if (!deck || robot.phase === "inactive") {
      this.world.robotBoarding = null;
      return null;
    }
    if (boarding.phase === "ride") {
      return this.getRobotSofaPushState(robot, deck, this.getRobotRideState(robot, deck, now, layout), now, layout);
    }
    if (boarding.phase === "sofa-fall") {
      const elapsed = Math.max(0, now - boarding.startedAt);
      const duration = 180;
      if (elapsed >= duration) return this.finishRobotSofaFall(boarding, layout, now);
      const start = boarding.sofaFall;
      return {
        ...start,
        groundY: Math.round(start.groundY + (layout.floorY - start.groundY) * (elapsed / duration)),
        surfaceId: undefined,
        frameName: `${start.frameName} · drop`,
      };
    }
    if (boarding.phase === "dismount") {
      const elapsed = Math.max(0, now - boarding.startedAt);
      const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
      const crouchMs = Math.max(150, Math.round(frameMs * 0.8));
      const leapMs = Math.max(70, Math.round(frameMs * 0.32));
      const landMs = Math.max(160, Math.round(frameMs * 0.9));
      const facing = boarding.dismountFacing;
      if (elapsed >= crouchMs + leapMs + landMs) return this.finishRobotDismount(boarding, layout, now);
      if (elapsed < crouchMs) {
        const rows = PixelPetCard.ELEVATE_FRAMES[1];
        return {
          rows,
          x: this.getFrameXForLeadPaw(rows, facing, deck.x + deck.width / 2, layout),
          facing, frame: 0, walking: false, surfaceId: deck.id,
          groundY: this.getGroundYForSupport(rows, deck.topY, facing, layout),
          frameName: "robot dismount crouch",
        };
      }
      const rows = elapsed < crouchMs + leapMs
        ? PixelPetCard.BOX_ENTRY_FRAMES[0]
        : PixelPetCard.ELEVATE_FRAMES[1];
      return {
        rows,
        x: this.getFrameXForLeadPaw(rows, facing, boarding.dismountPawX, layout),
        facing, frame: elapsed < crouchMs + leapMs ? 1 : 2, walking: false,
        groundY: layout.floorY,
        frameName: elapsed < crouchMs + leapMs ? "robot dismount leap" : "robot dismount land",
      };
    }
    const elapsed = Math.max(0, now - boarding.startedAt);
    if (boarding.phase === "approach") {
      if (elapsed >= boarding.route.duration) {
        boarding.phase = "wait";
        boarding.startedAt = now;
        return this.getRobotBoardingState(now, layout);
      }
      const step = this.getMotionRouteStep(boarding.route, elapsed);
      return {
        rows: this.getWalkFrame(step % PixelPetCard.WALK_FRAMES.length),
        x: boarding.route.originX + boarding.route.direction * step * layout.cell,
        facing: boarding.route.direction,
        frame: step,
        walking: true,
        frameName: "robot board approach",
        groundY: boarding.sourceSurfaceId ? this.getElevatedSurface(layout, boarding.sourceSurfaceId).topY : layout.floorY,
        surfaceId: boarding.sourceSurfaceId || undefined,
      };
    }
    // A ground launch remains fixed in world space.  Wait until the deck is
    // actually beside the cat rather than starting the hop while it is merely
    // somewhere nearby; this prevents the crouch visibly sliding with it.
    const deckCentreX = deck.x + deck.width / 2;
    const launchCentreX = boarding.launchX + layout.spriteWidth / 2;
    // Begin while the deck is still one clear cat-paw away.  The actual leap
    // target is frozen below, so this reads as an anticipatory jump instead
    // of letting the vacuum collide with the waiting crouch.
    const targetNearLaunch = Math.abs(deckCentreX - launchCentreX) <= layout.cell * 3;
    // Position beats velocity here: at the edge of a robot turn velocity can
    // be zero/stale, whereas the deck's actual side unambiguously tells us
    // which way the waiting cat should look.
    const incomingFacing = deckCentreX <= launchCentreX ? -1 : 1;
    if (boarding.phase === "wait") {
      if (targetNearLaunch && !robot.phase.startsWith("turn")) {
        boarding.phase = "hop";
        boarding.startedAt = now;
        // Freeze the take-off target. The launch drawing belongs to the
        // ground world, not the moving vacuum; only the landing crouch starts
        // following the deck.
        boarding.hopFacing = incomingFacing;
        boarding.hopTargetX = deckCentreX;
        return this.getRobotBoardingState(now, layout);
      }
      return {
        rows: PixelPetCard.ELEVATE_FRAMES[1],
        x: boarding.launchX,
        // Face the arriving machine while coiling for the short hop.
        facing: incomingFacing,
        frame: 0,
        walking: false,
        frameName: "robot board wait",
        groundY: boarding.sourceSurfaceId ? this.getElevatedSurface(layout, boarding.sourceSurfaceId).topY : layout.floorY,
        surfaceId: boarding.sourceSurfaceId || undefined,
      };
    }
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    // A moving target benefits from a deliberately abbreviated beat: crouch,
    // a single airborne drawing, then the same crouch now bound to the deck.
    const hopMs = Math.max(70, Math.round(frameMs * 0.35));
    const landMs = Math.max(180, Math.round(frameMs * 1.1));
    const frame = elapsed < hopMs ? 0 : 1;
    if (elapsed >= hopMs + landMs) {
      boarding.phase = "ride";
      boarding.startedAt = now;
      boarding.rideActivity = null;
      this.logWorldEvent("poi", `robot board ${boarding.propId}`, now);
      return this.getRobotBoardingState(now, layout);
    }
    if (boarding.sourceSurfaceId) {
      const source = this.getElevatedSurface(layout, boarding.sourceSurfaceId);
      const edgeDirection = boarding.sourceEdgeDirection ?? -boarding.facing;
      const edgeX = boarding.sourceEdgeX ?? this.getElevationEdge(source, edgeDirection);
      // The first two descent cells stay pinned to the source edge. The
      // later contact cells use the moving deck as their floor, preserving
      // the same authored angled descent already used by static surfaces.
      const placement = this.getLeapPlacement("descend", frame, edgeX, edgeDirection, boarding.facing, source, { ...layout, floorY: deck.topY });
      return {
        rows: placement.rows, x: placement.x, facing: boarding.facing, frame,
        walking: false, groundY: placement.groundY,
        frameName: "robot board descend " + (frame + 1),
      };
    }
    const facing = boarding.hopFacing ?? incomingFacing;
    const landingPawX = frame === 0
      ? (boarding.hopTargetX ?? deckCentreX)
      : deck.x + deck.width / 2;
    const rows = frame === 0 ? PixelPetCard.BOX_ENTRY_FRAMES[0] : PixelPetCard.ELEVATE_FRAMES[1];
    return {
      rows,
      x: this.getFrameXForLeadPaw(rows, facing, landingPawX, layout),
      facing,
      frame,
      walking: false,
      frameName: frame === 0 ? "robot board leap" : "robot board deck crouch",
      groundY: frame === 0
        ? layout.floorY
        : this.getGroundYForSupport(rows, deck.topY, facing, layout),
      surfaceId: frame === 1 ? deck.id : undefined,
    };
  }

  getRawWorldProps() {
    const configured = Array.isArray(this.config.props) ? this.config.props : [];
    return [
      ...configured.filter((prop, index) => !this.world.removedPropIds.has(this.getConfiguredPropId(prop, index))),
      ...this.world.runtimeProps.values(),
    ].filter((prop) => prop && PixelPetCard.PROP_DEFINITIONS[prop.type]);
  }

  isPropTypeEnabled(type) {
    return !this.world.disabledPropTypes.has(type)
      && this.getRawWorldProps().some((prop) => prop.type === type);
  }

  togglePropType(type) {
    const definition = PixelPetCard.PROP_DEFINITIONS[type];
    if (!definition) return;
    const configured = (Array.isArray(this.config.props) ? this.config.props : [])
      .filter((prop, index) => !this.world.removedPropIds.has(this.getConfiguredPropId(prop, index)) && prop?.type === type);
    const runtimeIds = [...this.world.runtimeProps.values()]
      .filter((prop) => prop.type === type)
      .map((prop) => prop.id);

    if (this.isPropTypeEnabled(type)) {
      // Remove transient instances first so their associated POIs and state
      // are cleaned up, then hide any YAML-defined fixture as one type.
      runtimeIds.forEach((id) => this.removeWorldProp(id));
      if (configured.length) this.world.disabledPropTypes.add(type);
      this.logWorldEvent("prop", `toggle off ${type}`, this.getWorldNow());
      this.render();
      return;
    }

    this.world.disabledPropTypes.delete(type);
    if (configured.length) {
      this.logWorldEvent("prop", `toggle on ${type}`, this.getWorldNow());
      this.render();
      return;
    }
    this.addRuntimeProp(type);
  }

  getPropToggleTypes() {
    // Keep room fixtures first, then present the optional library in a stable
    // order. Adding a future prop is only a registry entry plus this list.
    return [
      "food_bowl", "sofa_half", "clock",
      "cardboard_box", "toy_mouse", "ball", "mug", "water_glass", "plant", "floor_lamp", "robot_vacuum",
    ].filter((type) => PixelPetCard.PROP_DEFINITIONS[type]);
  }

  getConfiguredPropId(prop, index) {
    return String(prop?.id || `${prop?.type}-${index + 1}`);
  }

  getNextRuntimePropId(type) {
    const existing = new Set([
      ...(Array.isArray(this.config.props) ? this.config.props : []).map((prop, index) => this.getConfiguredPropId(prop, index)),
      ...this.world.runtimeProps.keys(),
    ]);
    let sequence = Math.max(1, this.world.propSequence + 1);
    let id = `${type}-${sequence}`;
    while (existing.has(id)) id = `${type}-${++sequence}`;
    this.world.propSequence = sequence;
    return id;
  }

  getRuntimePropRatio(type, layout) {
    const occupied = this.getWorldProps(layout)
      .filter((prop) => PixelPetCard.PROP_DEFINITIONS[prop.type]?.placement !== "edge")
      .map((prop) => prop.x / Math.max(1, layout.width));
    const candidates = [0.14, 0.28, 0.46, 0.62, 0.78, 0.88];
    return candidates
      .map((ratio) => ({ ratio, distance: Math.min(...occupied.map((value) => Math.abs(value - ratio)), 1) }))
      .sort((left, right) => right.distance - left.distance)[0].ratio;
  }

  addRuntimeProp(type) {
    const definition = PixelPetCard.PROP_DEFINITIONS[type];
    if (!definition) return;
    const layout = this.getLayout();
    const id = this.getNextRuntimePropId(type);
    const prop = { id, type };
    if (definition.placement === "edge") prop.side = definition.defaultSide || "right";
    else prop.x_ratio = this.getRuntimePropRatio(type, layout);
    this.world.runtimeProps.set(id, prop);
    const now = this.getWorldNow();
    this.logWorldEvent("prop", `add ${id}`, now);
    if (type === "robot_vacuum") this.startRobotVacuum(id, layout, now);
    if (type === "robot_vacuum") this.startRobotBoarding(id, layout, now);
    else this.createPropPoi(prop, layout, now);
    // Props affect both the scene SVG and the runtime inventory controls.
    // `update()` intentionally redraws only the SVG stage, so use a complete
    // render here to keep the Props menu in sync with the live world state.
    this.render();
  }

  removeWorldProp(propId) {
    const id = String(propId || "");
    const layout = this.getLayout();
    const prop = this.getWorldProps(layout).find((candidate) => candidate.id === id);
    if (!prop) return;
    if (this.world.runtimeProps.delete(id) === false) this.world.removedPropIds.add(id);
    for (const [poiId, poi] of this.world.pois) {
      if (poi.propId === id) this.world.pois.delete(poiId);
    }
    if (this.world.boxEntry?.boxId === id) this.world.boxEntry = null;
    if (this.world.glassVisit?.propId === id) this.world.glassVisit = null;
    if (this.world.robotVacuum?.propId === id) this.world.robotVacuum = null;
    if (this.world.robotBoarding?.propId === id) this.world.robotBoarding = null;
    this.world.propStates.delete(id);
    this.logWorldEvent("prop", `remove ${id}`, this.getWorldNow());
    this.render();
  }

  createPropPoi(propConfig, layout, now) {
    const definition = PixelPetCard.PROP_DEFINITIONS[propConfig.type];
    const poiConfig = definition?.poi;
    if (!poiConfig) return null;
    const prop = this.getWorldProps(layout).find((candidate) => candidate.id === propConfig.id);
    if (!prop) return null;
    if ((this.world.propPoiCooldowns.get(prop.id) || 0) > now) return null;
    const existing = [...this.world.pois.values()].find((poi) => poi.source === "prop" && poi.propId === prop.id && poi.status !== "cooldown");
    if (existing) return existing;
    const targetX = Math.max(0, Math.min(layout.width - layout.spriteWidth,
      Math.round((prop.x - layout.spriteWidth + layout.cell * 2) / layout.cell) * layout.cell));
    const poi = this.createNaturalPoi(layout, now, "prop", targetX, null, poiConfig.priority || 70);
    if (!poi) return null;
    Object.assign(poi, {
      propId: prop.id,
      intent: poiConfig.intent || "inspect",
      oneShot: poiConfig.oneShot !== false,
      profile: poiConfig.profile || "poi",
      label: `${prop.label} invitation`,
    });
    this.logWorldEvent("poi", `new ${prop.id} invitation`, now);
    return poi;
  }

  ensurePropPois(now, layout) {
    this.getWorldProps(layout).forEach((prop) => this.createPropPoi(prop, layout, now));
  }

  getResponsiveSofaArt(layout) {
    const half = PixelPetCard.PROPS.sofa_half;
    // 60 cells leave a twelve-cell approach margin in a 72-cell world.
    // Smaller cards retain the edge half rather than scaling artwork down.
    if (Math.floor(layout.width / layout.cell) < 72) return half;
    return {
      width: half.width * 2,
      height: half.height,
      rows: half.rows.map((row) => `${row}${[...row].reverse().join("")}`),
      palette: half.palette,
    };
  }

  getPropElevatedSurfaces(layout) {
    // Props describe their surfaces in their own pixel grid. At runtime that
    // local description becomes a world surface, so a moving prop can carry
    // the exact same surface contract as a sofa or a configured platform.
    // `motion` is deliberately data rather than a robot special-case: future
    // actors can attach to it, inherit its position, and inspect velocity.
    return this.getWorldProps(layout).flatMap((prop) => {
      const definition = PixelPetCard.PROP_DEFINITIONS[prop.type];
      const specs = Array.isArray(definition?.surfaces) ? definition.surfaces : [];
      return specs.map((spec, index) => {
        const widthCells = Math.max(1, Math.min(prop.art.width, Number(spec.width_cells) || prop.art.width));
        const xCells = Math.max(0, Math.min(prop.art.width - widthCells, Number(spec.x_cells) || 0));
        const topOffsetCells = Math.max(0, Number(spec.top_offset_cells) || 0);
        const robotState = prop.state?.robot;
        return {
          id: `${prop.id}:${String(spec.id || `surface-${index + 1}`)}`,
          x: Math.round(prop.x + xCells * layout.cell),
          width: Math.round(widthCells * layout.cell),
          topY: Math.round(prop.y + topOffsetCells * layout.cell),
          color: String(spec.color || "transparent"),
          propId: prop.id,
          type: String(spec.type || `${prop.type}-surface`),
          supports: Array.isArray(spec.supports) ? spec.supports : ["sit"],
          acceptedPoses: Array.isArray(spec.accepted_poses) ? spec.accepted_poses : ["sit"],
          preferredPoses: Array.isArray(spec.preferred_poses) ? spec.preferred_poses : ["sit"],
          activityWeights: spec.activity_weights && typeof spec.activity_weights === "object" ? spec.activity_weights : null,
          // Stage 2 exposes and tracks the deck without yet allowing the cat
          // to path onto it. Stage 3 will turn this on once boarding is wired.
          traversable: spec.traversable === true,
          moving: spec.moving === true,
          motion: spec.moving === true ? {
            kind: "follow-prop",
            propId: prop.id,
            velocityX: Number(robotState?.velocityX) || 0,
            phase: robotState?.phase || "static",
          } : null,
        };
      });
    });
  }

  getElevatedSurfaces(layout) {
    const width = Math.max(8, Math.floor((layout.width / layout.cell) * 0.42)) * layout.cell;
    const debugHeightCells = this.getDebugElevatedHeightCells();
    const debugSurface = {
      id: "debug-elevated-surface",
      x: layout.width - width,
      width,
      topY: layout.floorY - layout.cell * debugHeightCells,
      color: "#3ca875",
      type: "debug-platform",
      supports: ["walk", "sit"],
      acceptedPoses: ["walk", "stand", "sit"],
      preferredPoses: ["sit"],
      activityWeights: { walk: 2, stand: 1, sit: 5 },
      traversable: true,
    };
    const configured = Array.isArray(this.config.elevated_surfaces) ? this.config.elevated_surfaces : [];
    const maxCells = Math.floor(layout.width / layout.cell);
    const configuredSurfaces = configured.map((surface, index) => {
      const widthCells = Math.max(4, Math.min(maxCells, Number(surface.width_cells) || 12));
      const xCells = Math.max(0, Math.min(maxCells - widthCells, Number(surface.x_cells) || 0));
      const heightCells = Math.max(4, Math.min(30, Number(surface.height_cells) || 12));
      return {
        id: String(surface.id || `elevated-surface-${index + 1}`),
        x: Math.round(xCells * layout.cell),
        width: Math.round(widthCells * layout.cell),
        topY: Math.round(layout.floorY - heightCells * layout.cell),
        color: String(surface.color || "#3ca875"),
        type: String(surface.type || "platform"),
        supports: Array.isArray(surface.supports) ? surface.supports : ["walk", "sit"],
        acceptedPoses: Array.isArray(surface.accepted_poses) ? surface.accepted_poses : ["walk", "stand", "sit"],
        preferredPoses: Array.isArray(surface.preferred_poses) ? surface.preferred_poses : ["sit"],
        activityWeights: surface.activity_weights && typeof surface.activity_weights === "object" ? surface.activity_weights : null,
        traversable: surface.traversable !== false,
      };
    });
    // Sofa surfaces are individual world nodes.  A node can be traversable
    // without supporting a walking idle: the arm is a useful short landing
    // between the seat and backrest, but only accepts a settled sit.
    const sofaSurfaces = this.getWorldProps(layout)
      .filter((prop) => prop.type === "sofa_half")
      .flatMap((prop) => {
        const isFullSofa = prop.variant === "full";
        const surfaces = [
        {
          id: `${prop.id}:back-top`,
          x: prop.x + 11 * layout.cell,
          width: (isFullSofa ? 38 : 19) * layout.cell,
          topY: prop.y,
          color: "transparent",
          propId: prop.id,
          type: "sofa-backrest",
          supports: ["walk", "sit"],
          acceptedPoses: ["walk", "stand", "sit", "look_up", "clean"],
          preferredPoses: ["sit", "look_up"],
          // The backrest is a perch: mostly sit and look around, with a
          // little room to walk or clean without behaving like a floor.
          activityWeights: { walk: 1, stand: 1, sit: 12, clean: 1, loaf: 0, stretch: 0 },
          traversable: true,
          allowNarrowLanding: true,
        },
        {
          id: `${prop.id}:seat`,
          x: prop.x + 8 * layout.cell,
          width: (isFullSofa ? 44 : 22) * layout.cell,
          topY: prop.y + 19 * layout.cell,
          color: "transparent",
          propId: prop.id,
          type: "sofa-seat",
          supports: ["walk", "sit", "loaf", "clean", "stretch"],
          acceptedPoses: ["walk", "stand", "sit", "loaf", "clean", "stretch"],
          preferredPoses: ["loaf", "sit"],
          // The cushion is deliberately cosy. It remains traversable, but a
          // cat that settles here should be much more likely to loaf awhile.
          activityWeights: { walk: 1, stand: 1, sit: 4, loaf: 12, clean: 3, stretch: 2 },
          traversable: true,
          allowNarrowLanding: true,
        },
        {
          id: `${prop.id}:arm-left`,
          x: prop.x + layout.cell,
          width: 6 * layout.cell,
          topY: prop.y + 10 * layout.cell,
          color: "transparent",
          propId: prop.id,
          type: "sofa-arm",
          supports: ["sit"],
          acceptedPoses: ["sit"],
          preferredPoses: ["sit"],
          // A narrow arm is a perch/stepping stone, not a walkable lounge.
          activityWeights: { walk: 0, stand: 0, sit: 12, loaf: 0, clean: 0, stretch: 0 },
          traversable: true,
          allowNarrowLanding: false,
        },
        ];
        if (isFullSofa) {
          surfaces.push({
            ...surfaces[2],
            id: `${prop.id}:arm-right`,
            x: prop.x + (prop.art.width - 7) * layout.cell,
          });
        }
        return surfaces;
      });
    return [debugSurface, ...configuredSurfaces, ...sofaSurfaces, ...this.getPropElevatedSurfaces(layout)];
  }

  getDebugElevatedHeightCells() {
    const configuredHeight = Number(this.config.elevated_surface_height);
    return Number.isFinite(configuredHeight)
      ? Math.max(4, Math.round(configuredHeight))
      : this.debug.elevatedHeightCells;
  }

  getElevatedSurface(layout, surfaceId = null) {
    const surfaces = this.getElevatedSurfaces(layout);
    return surfaces.find((surface) => surface.id === surfaceId) || surfaces[0];
  }

  shouldRenderDebugElevatedSurface() {
    return typeof this.config.debug_elevated_surface === "boolean"
      ? this.config.debug_elevated_surface
      : this.debug.showElevatedSurface;
  }

  shouldRenderSurfaceDebug() {
    // Configuration enables the layer initially, but must not turn the
    // on-card toggle into a no-op when its saved value is false.
    return this.bool(this.config.show_surface_debug) || this.debug.showSurfaceDebug;
  }

  getFrameMetrics(rows, facing = 1) {
    const { cells, paws } = this.getCells(rows);
    const points = cells.map(([x, y]) => [facing < 0 ? 23 - x : x, y]);
    const pawPoints = [...paws.keys()].map((key) => key.split(",").map(Number))
      .map(([x, y]) => [facing < 0 ? 23 - x : x, y]);
    // R markers are deliberately authored as contact points. Older/general
    // poses do not always have them, so their lowest filled cells are a safe
    // fallback for keeping the sprite on a surface.
    const supports = pawPoints.length
      ? pawPoints
      : points.filter(([, y]) => y === Math.max(...points.map(([, pointY]) => pointY)));
    return {
      leadX: facing < 0 ? Math.min(...supports.map(([x]) => x)) : Math.max(...supports.map(([x]) => x)),
      supportY: Math.max(...supports.map(([, y]) => y)),
    };
  }

  getFrameXForLeadPaw(rows, facing, leadPawX, layout) {
    return Math.round(leadPawX - this.getFrameMetrics(rows, facing).leadX * layout.cell);
  }

  getFrameXForCentre(rows, facing, centreX, layout) {
    const { cells } = this.getCells(rows);
    const points = cells.map(([x, y]) => [facing < 0 ? 23 - x : x, y]);
    if (!points.length) return Math.round(centreX);
    const minX = Math.min(...points.map(([x]) => x));
    const maxX = Math.max(...points.map(([x]) => x));
    // `+ 1` centres cell areas rather than their grid lines.
    return Math.round(centreX - ((minX + maxX + 1) / 2) * layout.cell);
  }

  getFrameContact(rows, facing = 1, contact = "support") {
    const { cells, paws } = this.getCells(rows);
    const transform = ([x, y]) => [facing < 0 ? 23 - x : x, y];
    const marked = [...paws.keys()].map((key) => key.split(",").map(Number)).map(transform);
    const points = cells.map(transform);
    if (contact === "lowest") {
      return [...points].sort((left, right) => right[1] - left[1] || (facing < 0 ? left[0] - right[0] : right[0] - left[0]))[0];
    }
    const candidates = marked.length ? marked : points.filter(([, y]) => y === Math.max(...points.map(([, pointY]) => pointY)));
    const ordered = [...candidates].sort((left, right) => left[0] - right[0] || right[1] - left[1]);
    if (contact === "front") return facing < 0 ? ordered[0] : ordered[ordered.length - 1];
    if (contact === "rear") return facing < 0 ? ordered[ordered.length - 1] : ordered[0];
    return [...candidates].sort((left, right) => right[1] - left[1] || (facing < 0 ? left[0] - right[0] : right[0] - left[0]))[0];
  }

  placeFrameByContact(rows, facing, contact, contactX, contactY, layout) {
    const [localX, localY] = this.getFrameContact(rows, facing, contact);
    return {
      x: Math.round(contactX - localX * layout.cell),
      groundY: Math.round(contactY - (localY - 23) * layout.cell),
    };
  }

  placeFrameByLocalPoint(rows, facing, point, worldX, worldY, layout) {
    const [sourceX, sourceY] = point;
    const localX = facing < 0 ? 23 - sourceX : sourceX;
    return {
      x: Math.round(worldX - localX * layout.cell),
      groundY: Math.round(worldY - (sourceY - 23) * layout.cell),
    };
  }

  placeFrameBySurfaceEdge(rows, facing, anchor, edgeX, surfaceTopY, layout) {
    const [edgeLocalX] = facing < 0 ? [23 - anchor.edgeX] : [anchor.edgeX];
    const [, supportLocalY] = facing < 0
      ? [23 - anchor.support[0], anchor.support[1]]
      : anchor.support;
    return {
      x: Math.round(edgeX - edgeLocalX * layout.cell),
      groundY: Math.round(surfaceTopY - (supportLocalY - 23) * layout.cell),
    };
  }

  getLeapPlacement(kind, frame, edgeX, edgeDirection, facing, surface, layout) {
    // Every leap beat uses one explicit, authored anchor.  Do not infer the
    // lowest red cell: different drawings mark different paws, which was the
    // source of the old frame-to-frame teleporting.
    const ascent = kind === "ascend";
    const rows = ascent
      ? PixelPetCard.ELEVATE_FRAMES[frame]
      : [PixelPetCard.DESCENT_FRAMES[0], PixelPetCard.DESCENT_FRAMES[1], PixelPetCard.DESCENT_FRAMES[2], PixelPetCard.ELEVATE_FRAMES[1]][frame];
    const edgeAnchor = !ascent ? PixelPetCard.DESCENT_EDGE_ANCHORS[frame] : null;
    if (edgeAnchor) {
      // Blue is the bearing surface and aqua is the platform edge in the
      // reference grid. Pinning both keeps the first two descent poses
      // attached to the ledge without a post-placement silhouette clamp.
      return {
        rows,
        ...this.placeFrameBySurfaceEdge(rows, facing, edgeAnchor, edgeX, surface.topY, layout),
      };
    }
    const anchor = PixelPetCard.LEAP_FRAME_ANCHORS[kind][frame];
    const contactY = anchor.level === "floor"
      ? layout.floorY
      : anchor.level === "surface"
        ? surface.topY
        : Math.round((layout.floorY + surface.topY) / 2);
    const contactX = edgeX + edgeDirection * anchor.edgeOffset * layout.cell;
    return {
      rows,
      ...this.placeFrameByLocalPoint(rows, facing, anchor.point, contactX, contactY, layout),
    };
  }

  getDescentFollowX(edgeX, edgeDirection, exitDirection, surface, layout) {
    // Hand the world back using the same *leading paw* that absorbed the
    // landing. The crouch and normal first walk frame have different local
    // paw columns, so retaining the crouch's raw sprite origin made the gait
    // appear to begin one or more cells behind the cat.
    const landing = this.getLeapPlacement("descend", 3, edgeX, edgeDirection, exitDirection, surface, layout);
    const landingPawX = landing.x + this.getFrameMetrics(landing.rows, exitDirection).leadX * layout.cell;
    const followRows = this.getStandPauseState(0, layout, 0, exitDirection).rows;
    return this.getFrameXForLeadPaw(followRows, exitDirection, landingPawX, layout);
  }

  getSurfaceSafeX(rows, facing, desiredX, surface, layout) {
    // The last low, rear pixels of our authored sprites are the tail. They may
    // hang beyond an edge; every other filled cell must remain over the landing.
    const bodyCells = this.getCells(rows).cells
      .filter(([x, y]) => !(x < 7 && y >= 18))
      .map(([x, y]) => [facing < 0 ? 23 - x : x, y]);
    const minX = Math.min(...bodyCells.map(([x]) => x));
    const maxX = Math.max(...bodyCells.map(([x]) => x));
    const minSpriteX = surface.x - minX * layout.cell;
    const maxSpriteX = surface.x + surface.width - (maxX + 1) * layout.cell;
    return Math.round(Math.max(minSpriteX, Math.min(maxSpriteX, desiredX)));
  }

  getSequenceFrame(elapsed, frameMs, holds) {
    let remaining = Math.max(0, elapsed);
    for (let index = 0; index < holds.length; index += 1) {
      const duration = frameMs * holds[index];
      if (remaining < duration) return { frame: index, duration: holds.reduce((total, hold) => total + hold * frameMs, 0) };
      remaining -= duration;
    }
    return { frame: holds.length - 1, duration: holds.reduce((total, hold) => total + hold * frameMs, 0) };
  }

  getGroundYForSupport(rows, supportY, facing, layout) {
    const metrics = this.getFrameMetrics(rows, facing);
    return Math.round(supportY - (metrics.supportY - 23) * layout.cell);
  }

  getElevationEdge(surface, direction) {
    return direction > 0 ? surface.x : surface.x + surface.width;
  }

  getElevationApproach(layout, currentX, surfaceId = null) {
    const candidates = this.getNavigableElevatedSurfaces(layout)
      .filter((surface) => !surfaceId || surface.id === surfaceId);
    const choices = candidates.flatMap((surface) => [1, -1].map((direction) => {
      const edgeX = this.getElevationEdge(surface, direction);
      const takeoffPawX = edgeX - direction * layout.cell;
      const takeoffX = this.getFrameXForLeadPaw(PixelPetCard.ELEVATE_FRAMES[0], direction, takeoffPawX, layout);
      return { surfaceId: surface.id, direction, edgeX, takeoffPawX, takeoffX, distance: Math.abs(takeoffX - currentX) };
    })).filter(({ takeoffX }) => takeoffX >= -layout.spriteWidth && takeoffX <= layout.width);
    return choices.sort((left, right) => left.distance - right.distance)[0] || choices[0];
  }

  getElevationApproachForSurface(layout, currentX, surface) {
    const choices = [1, -1].map((direction) => {
      const edgeX = this.getElevationEdge(surface, direction);
      const takeoffPawX = edgeX - direction * layout.cell;
      const takeoffX = this.getFrameXForLeadPaw(PixelPetCard.ELEVATE_FRAMES[0], direction, takeoffPawX, layout);
      return { surfaceId: surface.id, direction, edgeX, takeoffPawX, takeoffX, distance: Math.abs(takeoffX - currentX) };
    });
    return choices.sort((left, right) => left.distance - right.distance)[0];
  }

  startElevationTest(surfaceId = null, returnToAuto = true) {
    const layout = this.getLayout();
    if (this.world.elevated) return;
    const now = this.getWorldNow();
    const current = this.getSpriteState(now, layout, true);
    const approach = this.getElevationApproach(layout, current.x, surfaceId);
    if (!approach) return;
    this.poseTest = null;
    this.world.visit = null;
    this.world.elevated = {
      phase: "approach-up",
      startedAt: now,
      surfaceId: approach.surfaceId,
      edgeDirection: approach.direction,
      edgeX: approach.edgeX,
      takeoffPawX: approach.takeoffPawX,
      route: this.createMotionRoute(current.x, approach.takeoffX, layout, "amble", "elevate-approach"),
      returnToAuto,
    };
    this.updatePoseTestButtons();
    this.updateWorldActionControls();
    this.update();
  }

  startSurfaceTravelTest(surfaceId, returnToAuto = true, profileName = "prompt", afterRobotDismount = false) {
    const layout = this.getLayout();
    const targetSurface = this.getElevatedSurface(layout, surfaceId);
    if (!afterRobotDismount && this.isRobotRiding()) {
      this.requestRobotDismount({
        type: "surface",
        surfaceId,
        targetX: targetSurface ? targetSurface.x + targetSurface.width / 2 : layout.width / 2,
      });
      return;
    }
    const stableSurfaceId = this.world.elevated?.phase === "elevated" ? this.world.elevated.surfaceId : null;
    if (!targetSurface || (this.world.elevated && !stableSurfaceId) || this.world.surfaceTravel) return;
    const now = this.getWorldNow();
    const current = this.getSpriteState(now, layout, true);
    const sourceSurfaceId = stableSurfaceId || this.autoState?.surfaceId || this.manualState?.surfaceId || null;
    const targetX = this.getPoiBounds(layout, targetSurface).minX;
    const plan = this.createMultiPoiTravelPlan(
      layout,
      { x: Math.round(current.x), surfaceId: sourceSurfaceId },
      { id: `test:${surfaceId}`, targetX, surfaceId },
      profileName,
      sourceSurfaceId ? this.getElevatedSurface(layout, sourceSurfaceId) : null,
      targetSurface,
      targetX
    );
    if (!plan) return;
    this.poseTest = null;
    this.world.visit = null;
    if (stableSurfaceId) this.world.elevated = null;
    this.world.surfaceTravel = { startedAt: now, plan, returnToAuto };
    this.logWorldEvent("route", `surface ${plan.routeNodes.map((id) => id || "ground").join(" → ")}`, now);
    this.update();
  }

  startPromptedPropTravel(propId) {
    const layout = this.getLayout();
    const prop = this.getWorldProps(layout).find((candidate) => candidate.id === propId);
    if (this.isRobotRiding()) {
      this.requestRobotDismount({ type: "prop", action: "prop", propId, targetX: prop?.x });
      return;
    }
    if (!prop || this.world.surfaceTravel || this.world.boxEntry || this.world.visit || this.world.glassVisit) return;
    const stableSurfaceId = this.world.elevated?.phase === "elevated" ? this.world.elevated.surfaceId : null;
    if (this.world.elevated && !stableSurfaceId) return;
    const now = this.getWorldNow();
    const current = this.getSpriteState(now, layout, true);
    const sourceSurfaceId = stableSurfaceId || this.autoState?.surfaceId || this.manualState?.surfaceId || null;
    const targetX = Math.max(0, Math.min(layout.width - layout.spriteWidth,
      Math.round((prop.x - layout.spriteWidth + layout.cell * 2) / layout.cell) * layout.cell));
    const target = { id: `prompt:${prop.id}`, targetX, surfaceId: null };
    const plan = this.createPoiTravelPlan(layout, { x: Math.round(current.x), surfaceId: sourceSurfaceId }, target, "prompt");
    if (!plan) return;
    this.poseTest = null;
    this.world.visit = null;
    if (stableSurfaceId) this.world.elevated = null;
    this.world.surfaceTravel = { startedAt: now, plan, returnToAuto: true, propId: prop.id };
    this.logWorldEvent("poi", `prompt ${prop.id}`, now);
    this.update();
  }

  startDescentTest() {
    const layout = this.getLayout();
    const now = this.getWorldNow();
    const sourceSurfaceId = this.world.elevated?.phase === "elevated"
      ? this.world.elevated.surfaceId
      : this.autoState?.surfaceId;
    if (!sourceSurfaceId) return;
    const surface = this.getElevatedSurface(layout, sourceSurfaceId);
    const edgeDirection = this.world.elevated?.edgeDirection || 1;
    const exitDirection = -edgeDirection;
    const edgeX = this.world.elevated?.edgeX ?? this.getElevationEdge(surface, edgeDirection);
    const firstRows = PixelPetCard.DESCENT_FRAMES[1];
    const startPawX = edgeX + edgeDirection * layout.cell;
    const takeoffX = this.getFrameXForLeadPaw(firstRows, exitDirection, startPawX, layout);
    const current = this.getSpriteState(now, layout, true);
    this.poseTest = null;
    this.autoState = null;
    this.world.elevated = {
      surfaceId: sourceSurfaceId,
      phase: "approach-down",
      startedAt: now,
      exitDirection,
      edgeX,
      route: this.createMotionRoute(current.x, takeoffX, layout, "amble", "descend-approach"),
      returnToAuto: true,
    };
    this.update();
  }

  activatePropAction(action, propId) {
    const layout = this.getLayout();
    const prop = this.getWorldProps(layout).find((candidate) => candidate.id === propId);
    if (action !== "robot" && this.isRobotRiding()) {
      this.requestRobotDismount({ type: "prop", action, propId, targetX: prop?.x });
      return;
    }
    if (action === "box") {
      if (this.world.boxEntry?.phase === "inside" && this.world.boxEntry.boxId === propId) this.startBoxExitTest(propId);
      else this.startBoxEntryTest(propId);
    }
    else if (action === "feed") this.activateFoodPoi(propId);
    else if (action === "drink") this.activateGlassVisit(propId);
    else if (action === "robot") {
      const now = this.getWorldNow();
      if (this.isRobotRiding() && this.world.robotBoarding?.propId === propId) {
        this.requestRobotDismount(null, true);
      }
      else if (this.world.robotVacuum?.propId === propId) {
        this.requestRobotExit(propId, layout, now);
      }
      else {
        this.startRobotVacuum(propId, layout, now);
        this.startRobotBoarding(propId, layout, now);
      }
    }
    else if (action === "surface") this.startSurfaceTravelTest(`${propId}:seat`, true, "prompt");
    else this.startPromptedPropTravel(propId);
  }

  getBoxEntryFrameX(box, sourceBoxColumn, facing, layout) {
    // The supplied hop sheets use one shared 24-cell canvas: the box rim
    // begins at `sourceBoxColumn`. Keeping that relationship in data avoids
    // post-render silhouette clamps and preserves the authored trajectory.
    if (facing > 0) return Math.round(box.x - sourceBoxColumn * layout.cell);
    return Math.round(box.x + box.art.width * layout.cell - (24 - sourceBoxColumn) * layout.cell);
  }

  startBoxEntryTest(boxId = null, startingState = null, profileName = "prompt") {
    const layout = this.getLayout();
    const box = this.getWorldProps(layout).find((prop) => prop.type === "cardboard_box" && (!boxId || prop.id === boxId));
    if (!box) return;
    const now = this.getWorldNow();
    const current = startingState || this.getSpriteState(now, layout, true);
    const facing = current.x + layout.spriteWidth / 2 <= box.x + box.art.width * layout.cell / 2 ? 1 : -1;
    const crouchX = this.getBoxEntryFrameX(box, 21, facing, layout);
    this.poseTest = null;
    this.world.visit = null;
    this.world.elevated = null;
    this.world.boxEntry = {
      boxId: box.id,
      phase: "approach",
      startedAt: now,
      facing,
      route: this.createMotionRoute(current.x, crouchX, layout, profileName, "box-entry-approach"),
      foreground: false,
      // A box visit is an activity rather than a permanent state.  One or two
      // quiet peek loops read as settling in; then the same authored exit clip
      // returns control to Auto (or the manual state if Auto is disabled).
      insideDuration: this.randomInt(24, 44) * Math.max(180, (Number(this.config.idle_frame_ms) || 250) * 1.35),
    };
    this.logWorldEvent("poi", `box invite ${box.id}`, now);
    this.updateWorldActionControls();
    this.update();
  }

  startBoxExitTest(boxId = null) {
    const layout = this.getLayout();
    const entry = this.world.boxEntry;
    const box = this.getWorldProps(layout).find((prop) => prop.type === "cardboard_box" && (!boxId || prop.id === boxId));
    if (!entry || entry.phase !== "inside" || !box || entry.boxId !== box.id) return;
    const now = this.getWorldNow();
    entry.phase = "exit";
    entry.startedAt = now;
    // The first beat is still visibly inside the box, so keep the box in the
    // foreground. Once the leap clears its rim the ordinary prop layer is
    // restored behind the cat.
    entry.foreground = true;
    this.logWorldEvent("poi", `box exit ${box.id}`, now);
    this.updateWorldActionControls();
    this.update();
  }

  getBoxIdleRows(headKey, tailKey) {
    const layers = [
      PixelPetCard.BOX_IDLE_PARTS.head[headKey],
      PixelPetCard.BOX_IDLE_PARTS.tail[tailKey],
    ].filter(Boolean);
    return Array.from({ length: 24 }, (_, y) => Array.from({ length: 24 }, (_, x) => (
      layers.some((rows) => rows[y]?.[x] === "#") ? "#" : "."
    )).join(""));
  }

  getBoxIdleState(entry, box, elapsed, layout) {
    const frameMs = Math.max(180, (Number(this.config.idle_frame_ms) || 250) * 1.35);
    const sequence = this.getSequenceFrame(elapsed, frameMs, PixelPetCard.BOX_IDLE_SEQUENCE.map((beat) => beat.hold));
    const beat = PixelPetCard.BOX_IDLE_SEQUENCE[sequence.frame];
    return {
      rows: this.getBoxIdleRows(beat.head, beat.tail),
      x: this.getBoxEntryFrameX(box, 1, entry.facing, layout),
      facing: entry.facing,
      frame: sequence.frame,
      walking: false,
      frameName: beat.name,
      groundY: layout.floorY,
    };
  }

  getBoxExitState(entry, box, elapsed, layout) {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    // Frame one is a deliberate read of the cat gathering itself inside the
    // box.  The supplied fifth drawing is the existing crouch/landing frame,
    // then the normal stand/auto player takes over from the same canvas origin.
    const sequence = this.getSequenceFrame(elapsed, frameMs, [2, 1, 1, 1, 2]);
    const frame = sequence.frame;
    const rows = frame < PixelPetCard.BOX_EXIT_FRAMES.length
      ? PixelPetCard.BOX_EXIT_FRAMES[frame]
      : PixelPetCard.ELEVATE_FRAMES[1];
    const sourceBoxColumn = [0, 0, 0, 0, 0][frame];
    entry.foreground = frame === 0;
    const x = this.getBoxEntryFrameX(box, sourceBoxColumn, entry.facing, layout);
    if (elapsed >= sequence.duration) {
      const settled = { x: Math.round(x), facing: entry.facing, surfaceId: null };
      this.world.boxEntry = null;
      this.manualState = settled;
      this.autoState = {
        ...settled,
        pose: "stand",
        activity: null,
        initial: false,
        surfaceActivities: 0,
      };
      const settledAt = this.getWorldNow();
      this.startedAt = settledAt;
      this.logWorldEvent("frame", "box exit settled", settledAt);
      this.updateWorldActionControls();
      return this.autoEnabled ? this.getAutoState(settledAt, layout) : this.getManualState(layout);
    }
    return {
      rows,
      x,
      facing: entry.facing,
      frame,
      walking: false,
      frameName: `box-exit-${frame + 1}`,
      groundY: layout.floorY,
    };
  }

  getBoxEntryState(now, layout) {
    const entry = this.world.boxEntry;
    const box = this.getWorldProps(layout).find((prop) => prop.id === entry.boxId);
    if (!box) {
      this.world.boxEntry = null;
      return null;
    }
    const elapsed = Math.max(0, now - entry.startedAt);
    if (entry.phase === "approach") {
      if (elapsed >= entry.route.duration) {
        entry.phase = "hop";
        entry.startedAt = now;
        return this.getBoxEntryState(now, layout);
      }
      const step = this.getMotionRouteStep(entry.route, elapsed);
      return {
        rows: this.getWalkFrame(step % PixelPetCard.WALK_FRAMES.length),
        x: entry.route.originX + entry.route.direction * step * layout.cell,
        facing: entry.route.direction,
        frame: step,
        walking: true,
        frameName: "box approach",
        groundY: layout.floorY,
      };
    }
    if (entry.phase === "inside") {
      if (elapsed >= entry.insideDuration) {
        this.startBoxExitTest(entry.boxId);
        return this.getBoxEntryState(now, layout);
      }
      return this.getBoxIdleState(entry, box, elapsed, layout);
    }
    if (entry.phase === "exit") return this.getBoxExitState(entry, box, elapsed, layout);

    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    // Crouch is held long enough to read as a coil before the cat disappears
    // into the independently rendered box.
    const sequence = this.getSequenceFrame(elapsed, frameMs, [3, 1, 1, 1]);
    const frame = sequence.frame;
    const rows = frame === 0 ? PixelPetCard.ELEVATE_FRAMES[1] : PixelPetCard.BOX_ENTRY_FRAMES[frame - 1];
    const sourceBoxColumn = [21, 21, 15, 7][frame];
    entry.foreground = frame >= 3;
    if (elapsed >= sequence.duration) {
      entry.phase = "inside";
      entry.foreground = true;
      entry.startedAt = now;
      return this.getBoxEntryState(now, layout);
    }
    return {
      rows,
      x: this.getBoxEntryFrameX(box, sourceBoxColumn, entry.facing, layout),
      facing: entry.facing,
      frame,
      walking: false,
      frameName: `box-hop-${frame + 1}`,
      groundY: layout.floorY,
    };
  }

  getElevationState(now, layout) {
    const elevated = this.world.elevated;
    if (!elevated) return null;
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const surface = this.getElevatedSurface(layout, elevated.surfaceId);
    const elapsed = Math.max(0, now - elevated.startedAt);
    const edgeDirection = elevated.edgeDirection || 1;
    const edgeX = elevated.edgeX ?? this.getElevationEdge(surface, edgeDirection);
    if (elevated.phase === "approach-up" || elevated.phase === "approach-down") {
      const route = elevated.route;
      if (elapsed >= route.duration) {
        elevated.phase = elevated.phase === "approach-up" ? "look-up" : "descend";
        elevated.startedAt = now;
        return this.getElevationState(now, layout);
      }
      const step = this.getMotionRouteStep(route, elapsed);
      return {
        rows: this.getWalkFrame(step % PixelPetCard.WALK_FRAMES.length),
        x: route.originX + route.direction * step * layout.cell,
        facing: route.direction,
        frame: step,
        walking: true,
        frameName: elevated.phase,
        groundY: elevated.phase === "approach-up" ? layout.floorY : surface.topY,
      };
    }
    if (elevated.phase === "look-up") {
      const duration = this.getLookUpDuration();
      if (elapsed >= duration) {
        elevated.phase = "ascend";
        elevated.startedAt = now;
        return this.getElevationState(now, layout);
      }
      return this.getLookUpState(elapsed, layout, null, edgeDirection, {
        raw: true,
        anchorPawX: elevated.takeoffPawX,
        supportY: layout.floorY,
      });
    }
    if (elevated.phase === "ascend") {
      const sequence = this.getSequenceFrame(elapsed, frameMs, [1, 3, 1, 1, 1]);
      const frame = sequence.frame;
      const placement = this.getLeapPlacement("ascend", frame, edgeX, edgeDirection, edgeDirection, surface, layout);
      if (elapsed >= sequence.duration) {
        if (elevated.returnToAuto) {
          const idleRows = PixelPetCard.ELEVATED_SIT_FRAMES[0];
          const x = this.getFrameXForLeadPaw(idleRows, edgeDirection, edgeX + edgeDirection * layout.cell * 7, layout);
          this.world.elevated = null;
          this.autoState = {
            x,
            facing: edgeDirection,
            pose: "sit",
            surfaceId: surface.id,
            surfaceActivities: 0,
            initial: false,
            activity: this.createElevatedSitActivity(now, x, edgeDirection),
          };
          this.manualState = { x, facing: edgeDirection, surfaceId: surface.id };
          return this.autoEnabled ? this.getAutoState(now, layout) : this.getManualState(layout);
        }
        elevated.phase = "elevated";
        elevated.startedAt = now;
        // This agrees with elevate-5's explicit blue-support placement:
        // its origin is seven cells inside the source edge, exactly where the
        // normal stand's leading floor cell will also render.
        elevated.anchorPawX = edgeX + edgeDirection * layout.cell * 7;
        return this.getElevationState(now, layout);
      }
      return {
        rows: placement.rows,
        x: placement.x,
        facing: edgeDirection,
        frame,
        frameName: `elevate-${frame + 1}`,
        walking: false,
        groundY: placement.groundY,
      };
    }
    if (elevated.phase === "descend") {
      // The supplied drawings are authored in this visual order: peek over
      // the edge, lean farther out, drop, then absorb the floor landing.
      // Their red markers describe different limbs, not one universal ground
      // anchor, so the vertical path is intentionally authored per beat.
      const exitDirection = elevated.exitDirection || -edgeDirection;
      const sequence = this.getSequenceFrame(elapsed, frameMs, [1, 1, 1, 3]);
      const frame = sequence.frame;
      const placement = this.getLeapPlacement("descend", frame, edgeX, edgeDirection, exitDirection, surface, layout);
      const x = placement.x;
      if (elapsed >= sequence.duration) {
        const followX = this.getDescentFollowX(edgeX, edgeDirection, exitDirection, surface, layout);
        this.world.elevated = null;
        this.startedAt = now;
        if (elevated.returnToAuto) {
          this.poseTest = null;
          this.autoState = {
            x: followX,
            facing: exitDirection,
            pose: "stand",
            surfaceId: null,
            initial: false,
            activity: { type: "stand", startedAt: now, duration: this.randomInt(3, 5) * frameMs, x: followX, facing: exitDirection, after: "stand" },
          };
          this.manualState = { x: followX, facing: exitDirection, surfaceId: null };
          return this.autoEnabled ? this.getAutoState(now, layout) : this.getManualState(layout);
        }
        this.poseTest = { target: "stand", sequence: [], requested: "stand", x: followX, facing: exitDirection };
        this.updatePoseTestButtons();
        return this.getStandPauseState(0, layout, followX, exitDirection);
      }
      return {
        rows: placement.rows,
        x,
        facing: exitDirection,
        frame,
        frameName: `descend-${frame + 1}`,
        walking: false,
        groundY: placement.groundY,
      };
    }
    const frame = Math.floor(elapsed / (frameMs * 3)) % PixelPetCard.ELEVATED_SIT_FRAMES.length;
    const rows = PixelPetCard.ELEVATED_SIT_FRAMES[frame];
    const facing = edgeDirection;
    const desiredX = this.getFrameXForLeadPaw(rows, facing, elevated.anchorPawX ?? edgeX + edgeDirection * layout.cell * 7, layout);
    return {
      rows,
      x: desiredX,
      facing,
      frame,
      frameName: `elevated-sit-${frame + 1}`,
      walking: false,
      groundY: this.getGroundYForSupport(rows, surface.topY, facing, layout),
    };
  }

  getFoodContactPlacement(prop, approachFacing, layout) {
    // POIs are based on the visible eating silhouette, not the transparent
    // 24-cell canvas. This makes the muzzle meet the bowl rather than leaving
    // an arbitrary canvas-width gap.
    const eatingFacing = approachFacing;
    const columns = this.getCells(PixelPetCard.EAT_IDLE_FRAMES[0][0]).cells
      .map(([x]) => eatingFacing < 0 ? 23 - x : x);
    const front = approachFacing > 0 ? Math.max(...columns) : Math.min(...columns);
    const bowlRight = prop.x + prop.art.width * layout.cell;
    // The bowl is rendered behind the cat. Deliberately overlap its near rim
    // by two sprite cells so the muzzle reads as properly inside the bowl.
    const bowlInset = layout.cell * 3;
    const unclampedX = approachFacing > 0
      ? prop.x - front * layout.cell + bowlInset
      : bowlRight - layout.cell - front * layout.cell - bowlInset;
    // A prop parked at an edge can otherwise produce a perfect muzzle target
    // that lies a fraction beyond the sprite's world bounds. Clamp the POI,
    // not the animation, so bowl clicks always yield an actionable visit.
    const x = Math.round(Math.max(0, Math.min(layout.width - layout.spriteWidth, unclampedX)));
    return { x, contactError: Math.abs(x - unclampedX) };
  }

  getFoodContactX(prop, approachFacing, layout) {
    return this.getFoodContactPlacement(prop, approachFacing, layout).x;
  }

  getPoiSlots(layout) {
    const maxX = layout.width - layout.spriteWidth;
    return this.getWorldProps(layout).filter((prop) => prop.capabilities?.food).flatMap((prop) => {
      const candidates = [
        { id: `${prop.id}:left`, facing: 1 },
        { id: `${prop.id}:right`, facing: -1 },
      ];
      return candidates.map((candidate) => {
        const placement = this.getFoodContactPlacement(prop, candidate.facing, layout);
        return {
        ...candidate,
        x: placement.x,
        contactError: placement.contactError,
        propId: prop.id,
        capability: "food",
        reachable: placement.x >= 0 && placement.x <= maxX,
        reservedBy: this.world.reservations.get(candidate.id) || null,
        };
      });
    });
  }

  getPoiPoolSize() {
    return Math.max(0, Math.min(5, Number(this.config.poi_pool_size) || 2));
  }

  getPoiDisplayX(poi, layout) {
    return Math.round(poi.targetX + layout.spriteWidth / 2);
  }

  getPoiSurface(layout, poi) {
    return poi?.surfaceId ? this.getElevatedSurface(layout, poi.surfaceId) : null;
  }

  getPoiBounds(layout, surface = null) {
    if (!surface) return { minX: 0, maxX: layout.width - layout.spriteWidth };
    const rows = PixelPetCard.POSES.stand;
    return {
      minX: this.getSurfaceSafeX(rows, 1, -Infinity, surface, layout),
      maxX: this.getSurfaceSafeX(rows, 1, Infinity, surface, layout),
    };
  }

  getNavigableElevatedSurfaces(layout) {
    return this.getTraversableElevatedSurfaces(layout)
      .filter((surface) => !Array.isArray(surface.supports) || surface.supports.includes("walk"));
  }

  getTraversableElevatedSurfaces(layout) {
    return this.getElevatedSurfaces(layout)
      .filter((surface) => surface.id !== "debug-elevated-surface" || this.shouldRenderDebugElevatedSurface())
      .filter((surface) => surface.traversable !== false);
  }

  getSurfaceRouteNode(layout, surfaceId = null) {
    if (!surfaceId) {
      return {
        id: null,
        x: 0,
        width: layout.width,
        topY: layout.floorY,
        type: "ground",
        traversable: true,
      };
    }
    return this.getTraversableElevatedSurfaces(layout).find((surface) => surface.id === surfaceId) || null;
  }

  getSurfaceGapCells(left, right, layout) {
    const leftEnd = left.x + left.width;
    const rightEnd = right.x + right.width;
    return Math.max(0, Math.max(left.x - rightEnd, right.x - leftEnd) / layout.cell);
  }

  getSurfaceRoute(layout, sourceSurfaceId = null, targetSurfaceId = null) {
    const nodes = [this.getSurfaceRouteNode(layout), ...this.getTraversableElevatedSurfaces(layout)];
    const sourceId = sourceSurfaceId || null;
    const targetId = targetSurfaceId || null;
    if (!nodes.some((node) => node.id === sourceId) || !nodes.some((node) => node.id === targetId)) return null;
    const distance = new Map(nodes.map((node) => [node.id, Infinity]));
    const previous = new Map();
    const pending = new Set(nodes.map((node) => node.id));
    distance.set(sourceId, 0);
    while (pending.size) {
      const currentId = [...pending].sort((left, right) => distance.get(left) - distance.get(right))[0];
      if (currentId == null && !pending.has(null)) break;
      if (distance.get(currentId) === Infinity) break;
      pending.delete(currentId);
      if (currentId === targetId) break;
      const current = nodes.find((node) => node.id === currentId);
      for (const nextId of pending) {
        const next = nodes.find((node) => node.id === nextId);
        const touchesGround = !current.id || !next.id;
        const gapCells = this.getSurfaceGapCells(current, next, layout);
        // Elevated nodes must overlap or meet at a nearby edge.  Longer
        // journeys deliberately route through the ground rather than asking a
        // cat to leap across a room.
        if (!touchesGround && gapCells > 3) continue;
        const heightCells = Math.abs(current.topY - next.topY) / layout.cell;
        // Squared height makes short, believable sofa hops cheaper than one
        // huge leap, while retaining the direct edge as a future option.
        const cost = 80 + heightCells * heightCells + gapCells * 24;
        const candidate = distance.get(currentId) + cost;
        if (candidate < distance.get(nextId)) {
          distance.set(nextId, candidate);
          previous.set(nextId, currentId);
        }
      }
    }
    if (distance.get(targetId) === Infinity) return null;
    const path = [];
    for (let cursor = targetId; cursor !== undefined; cursor = previous.get(cursor)) {
      path.unshift(cursor);
      if (cursor === sourceId) break;
    }
    return path[0] === sourceId ? path : null;
  }

  chooseNaturalPoiSurface(layout) {
    const surfaces = this.getNavigableElevatedSurfaces(layout);
    if (!surfaces.length || Math.random() >= 0.4) return null;
    return surfaces[this.randomInt(0, surfaces.length - 1)];
  }

  createNaturalPoi(layout, now, source = "natural", targetX = null, surfaceId = null, priority = 20) {
    const surface = surfaceId ? this.getElevatedSurface(layout, surfaceId) : null;
    // A POI explicitly authored for a surface must never silently fall back to
    // the floor if that surface is absent. That was the route to misleading
    // floating/grounded markers when a world surface changed underneath it.
    if (surfaceId && !surface) return null;
    const bounds = this.getPoiBounds(layout, surface);
    const x = targetX == null
      ? bounds.minX + this.randomInt(0, Math.max(0, Math.floor((bounds.maxX - bounds.minX) / layout.cell))) * layout.cell
      : Math.max(bounds.minX, Math.min(bounds.maxX, Math.round(targetX / layout.cell) * layout.cell));
    const poi = {
      id: `${source}-poi-${++this.world.poiSequence}`,
      source,
      targetX: x,
      surfaceId: surface?.id || null,
      priority,
      status: "active",
      createdAt: now,
      cooldownUntil: 0,
      reservedBy: null,
    };
    this.world.pois.set(poi.id, poi);
    return poi;
  }

  refreshPois(now) {
    for (const [propId, until] of this.world.propPoiCooldowns.entries()) {
      if (until <= now) this.world.propPoiCooldowns.delete(propId);
    }
    for (const [id, poi] of this.world.pois) {
      if (poi.status !== "cooldown" || now < poi.cooldownUntil) continue;
      // Natural POIs are short-lived scenery opportunities. User invitations
      // are consumed immediately on arrival (in releasePoi), never recycled.
      this.world.pois.delete(id);
    }
  }

  ensureNaturalPois(now, layout) {
    this.refreshPois(now);
    const wanted = this.getPoiPoolSize();
    const active = [...this.world.pois.values()].filter((poi) => poi.source === "natural" && poi.status === "active");
    for (let index = active.length; index < wanted; index += 1) {
      const existing = [...this.world.pois.values()].filter((poi) => poi.status === "active");
      const surfaces = this.getNavigableElevatedSurfaces(layout);
      const hasFloorPoi = existing.some((poi) => !poi.surfaceId);
      const hasSurfacePoi = existing.some((poi) => poi.surfaceId);
      // With a two-POI pool, maintain one floor invitation and one elevated
      // invitation. This gives Auto a genuine reason to climb up, then a
      // separate ordinary-world reason to come back down.
      const surface = surfaces.length && !hasSurfacePoi
        ? surfaces[this.randomInt(0, surfaces.length - 1)]
        : surfaces.length && hasSurfacePoi && !hasFloorPoi
          ? null
          : this.chooseNaturalPoiSurface(layout);
      let candidate = this.createNaturalPoi(layout, now, "natural", null, surface?.id || null);
      let attempts = 0;
      while (attempts < 6 && existing.some((poi) => Math.abs(poi.targetX - candidate.targetX) < layout.spriteWidth / 2 && poi.surfaceId === candidate.surfaceId)) {
        this.world.pois.delete(candidate.id);
        candidate = this.createNaturalPoi(layout, now, "natural", null, surface?.id || null);
        attempts += 1;
      }
    }
  }

  getAvailablePois(now, layout, state) {
    this.ensureNaturalPois(now, layout);
    this.ensurePropPois(now, layout);
    const currentSurfaceId = state.surfaceId || null;
    return [...this.world.pois.values()]
      .filter((poi) => poi.status === "active" && !poi.reservedBy)
      .filter((poi) => this.getSurfaceRoute(layout, currentSurfaceId, poi.surfaceId || null));
  }

  chooseAutoPoi(now, layout, state) {
    const candidates = this.getAvailablePois(now, layout, state);
    if (!candidates.length) return null;
    const user = candidates.filter((poi) => poi.source === "user").sort((a, b) => b.priority - a.priority || Math.abs(a.targetX - state.x) - Math.abs(b.targetX - state.x));
    if (user.length) return user[0];
    // A newly placed interactive prop is a strong but finite invitation. It
    // joins the normal POI pool rather than starting an out-of-band action,
    // so the cat can still route from elevated surfaces before engaging it.
    const prop = candidates.filter((poi) => poi.source === "prop")
      .sort((a, b) => b.priority - a.priority || Math.abs(a.targetX - state.x) - Math.abs(b.targetX - state.x));
    if (prop.length) return prop[0];
    const natural = candidates.filter((poi) => poi.source === "natural");
    // First, allow Auto one ordinary surface activity after the post-leap
    // settle. It makes the hop read as arriving somewhere rather than an
    // immediate U-turn.
    if (state.surfaceId && (state.surfaceActivities || 0) === 0) return null;
    // A surface visit should feel deliberate, not permanent. Let the cat
    // settle and do one or two ordinary Auto activities, then favour a floor
    // invitation so the existing descent planner takes it home again.
    if (state.surfaceId && (state.surfaceActivities || 0) >= 2) {
      const floor = natural.filter((poi) => !poi.surfaceId);
      if (floor.length) return floor.sort((a, b) => Math.abs(a.targetX - state.x) - Math.abs(b.targetX - state.x))[0];
    }
    // Natural opportunities are an invitation, not a metronome: the cat only
    // takes one at some decision points, leaving ordinary idles intact.
    const invitationChance = state.surfaceId && (state.surfaceActivities || 0) >= 1 ? 0.72 : 0.45;
    if (Math.random() >= invitationChance) return null;
    return natural
      .sort((a, b) => Math.abs(a.targetX - state.x) - Math.abs(b.targetX - state.x))[0] || null;
  }

  reservePoi(poi, now) {
    poi.status = "reserved";
    poi.reservedBy = String(this.config.cat_id || "cat-1");
    poi.reservedAt = now;
    this.logWorldEvent("poi", `reserve ${poi.id} · ${poi.surfaceId || "floor"}`, now);
  }

  releasePoi(poi, now) {
    if (!poi) return;
    // A user click is an explicit, one-shot invitation. Once the cat has
    // engaged with it, remove it instead of allowing it to reclaim attention.
    if (poi.source === "user" || (poi.source === "prop" && poi.oneShot)) {
      if (poi.source === "prop" && poi.oneShot && poi.propId) {
        this.world.propPoiCooldowns.set(poi.propId, now + this.randomInt(45, 90) * 1000);
        this.logWorldEvent("poi", `cooldown ${poi.propId}`, now);
      }
      this.world.pois.delete(poi.id);
      this.logWorldEvent("poi", `consume ${poi.id}`, now);
      return;
    }
    poi.reservedBy = null;
    poi.status = "cooldown";
    poi.cooldownUntil = now + this.randomInt(20, 60) * 1000;
    this.logWorldEvent("poi", `cooldown ${poi.id}`, now);
  }

  addUserPoiFromPoint(clientX, clientY) {
    const layout = this.getLayout();
    const stage = this.shadowRoot?.querySelector("#stage");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const pointX = ((clientX - rect.left) / Math.max(1, rect.width)) * layout.width;
    const pointY = ((clientY - rect.top) / Math.max(1, rect.height)) * layout.height;
    const desiredX = pointX - layout.spriteWidth / 2;
    const candidates = [null, ...this.getNavigableElevatedSurfaces(layout)].map((surface) => {
      const bounds = this.getPoiBounds(layout, surface);
      const targetX = Math.max(bounds.minX, Math.min(bounds.maxX, Math.round(desiredX / layout.cell) * layout.cell));
      const targetY = surface?.topY || layout.floorY;
      return { surface, targetX, targetY, distance: Math.hypot(targetX - desiredX, targetY - pointY) };
    });
    const nearest = candidates.sort((left, right) => left.distance - right.distance)[0];
    // Clicks need not be pixel-perfect, but avoid turning a click high in
    // empty sky into a surprising POI on the floor.
    if (!nearest || nearest.distance > Math.max(layout.cell * 9, layout.height * 0.22)) return;
    this.createNaturalPoi(layout, this.getWorldNow(), "user", nearest.targetX, nearest.surface?.id || null, 100);
    this.update();
  }

  getElevationSequenceDuration() {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    return [1, 3, 1, 1, 1].reduce((total, hold) => total + hold * frameMs, 0);
  }

  getDescentSequenceDuration() {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    return [1, 1, 1, 3].reduce((total, hold) => total + hold * frameMs, 0);
  }

  createSurfaceHop(layout, sourceX, sourceSurface, targetSurface, profileName, tag) {
    const sourceTopY = sourceSurface?.topY || layout.floorY;
    const sourceCenter = sourceSurface ? sourceSurface.x + sourceSurface.width / 2 : sourceX + layout.spriteWidth / 2;
    const targetCenter = targetSurface ? targetSurface.x + targetSurface.width / 2 : sourceX + layout.spriteWidth / 2;
    const direction = targetCenter >= sourceCenter ? 1 : -1;
    const currentTopY = sourceTopY;
    const targetTopY = targetSurface?.topY || layout.floorY;
    const ascending = targetTopY < currentTopY;
    const flightLayout = { ...layout, floorY: ascending ? currentTopY : targetTopY };
    if (ascending) {
      const edgeX = this.getElevationEdge(targetSurface, direction);
      const takeoffPawX = edgeX - direction * layout.cell;
      const rawTakeoffX = this.getFrameXForLeadPaw(PixelPetCard.ELEVATE_FRAMES[0], direction, takeoffPawX, layout);
      const takeoffX = sourceSurface
        ? this.getSurfaceSafeX(PixelPetCard.ELEVATE_FRAMES[0], direction, rawTakeoffX, sourceSurface, layout)
        : Math.max(0, Math.min(layout.width - layout.spriteWidth, rawTakeoffX));
      const landingPawX = edgeX + direction * layout.cell;
      const landedX = this.getSurfaceSafeX(
        PixelPetCard.POSES.stand,
        direction,
        this.getFrameXForLeadPaw(PixelPetCard.POSES.stand, direction, landingPawX, layout),
        targetSurface,
        layout
      );
      return {
        kind: "up", sourceSurfaceId: sourceSurface?.id || null, destinationSurfaceId: targetSurface.id,
        direction, edgeX, takeoffPawX, takeoffX, landedX, flightLayout,
        approachRoute: this.createMotionRoute(sourceX, takeoffX, layout, profileName, `${tag}:approach-up`),
        lookUpDuration: this.getLookUpDuration(),
        flightDuration: this.getElevationSequenceDuration(),
      };
    }
    const edgeDirection = -direction;
    const edgeX = this.getElevationEdge(sourceSurface, edgeDirection);
    const takeoffPawX = edgeX + edgeDirection * layout.cell;
    const rawTakeoffX = this.getFrameXForLeadPaw(PixelPetCard.DESCENT_FRAMES[1], direction, takeoffPawX, layout);
    const takeoffX = this.getSurfaceSafeX(PixelPetCard.DESCENT_FRAMES[1], direction, rawTakeoffX, sourceSurface, layout);
    const rawLandedX = this.getDescentFollowX(edgeX, edgeDirection, direction, sourceSurface, flightLayout);
    const landedX = targetSurface
      ? this.getSurfaceSafeX(PixelPetCard.POSES.stand, direction, rawLandedX, targetSurface, layout)
      : Math.max(0, Math.min(layout.width - layout.spriteWidth, rawLandedX));
    return {
      kind: "down", sourceSurfaceId: sourceSurface.id, destinationSurfaceId: targetSurface?.id || null,
      direction, edgeDirection, edgeX, takeoffPawX, takeoffX, landedX, flightLayout,
      approachRoute: this.createMotionRoute(sourceX, takeoffX, layout, profileName, `${tag}:approach-down`),
      flightDuration: this.getDescentSequenceDuration(),
    };
  }

  createMultiPoiTravelPlan(layout, state, poi, profileName, sourceSurface, targetSurface, destination) {
    const routeNodes = this.getSurfaceRoute(layout, sourceSurface?.id || null, targetSurface?.id || null);
    if (!routeNodes) return null;
    const segments = [];
    let x = Math.round(state.x);
    let currentSurface = sourceSurface;
    for (let index = 1; index < routeNodes.length; index += 1) {
      const nextSurface = this.getSurfaceRouteNode(layout, routeNodes[index]);
      const hop = this.createSurfaceHop(layout, x, currentSurface, nextSurface.id ? nextSurface : null, profileName, `poi:${poi.id}:hop-${index}`);
      if (hop.approachRoute.duration) {
        segments.push({ kind: "walk", route: hop.approachRoute, surfaceId: currentSurface?.id || null });
      }
      if (hop.kind === "up") segments.push({ ...hop, kind: "look-up" });
      segments.push({ kind: hop.kind, ...hop });
      x = hop.landedX;
      currentSurface = nextSurface.id ? nextSurface : null;
    }
    const finalRoute = this.createMotionRoute(x, destination, layout, profileName, `poi:${poi.id}:destination`);
    if (finalRoute.duration) segments.push({ kind: "walk", route: finalRoute, surfaceId: currentSurface?.id || null });
    const duration = segments.reduce((total, segment) => total + (segment.kind === "walk" ? segment.route.duration : segment.kind === "look-up" ? segment.lookUpDuration : segment.flightDuration), 0);
    return {
      kind: "multi", duration, destinationX: destination, destinationSurfaceId: targetSurface?.id || null,
      segments,
      routeNodes,
      debugPoints: [{ x: state.x, surfaceId: sourceSurface?.id || null }, ...segments
        .filter((segment) => segment.kind === "up" || segment.kind === "down")
        .map((segment) => ({ x: segment.landedX, surfaceId: segment.destinationSurfaceId }))],
    };
  }

  createPoiTravelPlan(layout, state, poi, profileName = "poi") {
    const sourceSurface = state.surfaceId ? this.getElevatedSurface(layout, state.surfaceId) : null;
    const targetSurface = this.getPoiSurface(layout, poi);
    const sourceX = Math.round(state.x);
    const destination = Math.max(
      this.getPoiBounds(layout, targetSurface).minX,
      Math.min(this.getPoiBounds(layout, targetSurface).maxX, poi.targetX)
    );
    const direct = (originX, destinationX, tag) => this.createMotionRoute(originX, destinationX, layout, profileName, tag);
    if ((!sourceSurface && !targetSurface) || sourceSurface?.id === targetSurface?.id) {
      const route = direct(sourceX, destination, `poi:${poi.id}:direct`);
      return {
        kind: "direct", duration: route.duration, destinationX: destination,
        destinationSurfaceId: targetSurface?.id || null, route,
        debugPoints: [{ x: sourceX, surfaceId: sourceSurface?.id || null }, { x: destination, surfaceId: targetSurface?.id || null }],
      };
    }
    const multiPlan = this.createMultiPoiTravelPlan(layout, state, poi, profileName, sourceSurface, targetSurface, destination);
    if (multiPlan) return multiPlan;
    if (!sourceSurface && targetSurface) {
      const approach = this.getElevationApproachForSurface(layout, sourceX, targetSurface);
      const approachRoute = direct(sourceX, approach.takeoffX, `poi:${poi.id}:approach-up`);
      const landingPawX = approach.edgeX + approach.direction * layout.cell;
      const landedX = this.getSurfaceSafeX(
        PixelPetCard.POSES.stand,
        approach.direction,
        this.getFrameXForLeadPaw(PixelPetCard.POSES.stand, approach.direction, landingPawX, layout),
        targetSurface,
        layout
      );
      const onSurfaceRoute = direct(landedX, destination, `poi:${poi.id}:surface`);
      return {
        kind: "up", duration: approachRoute.duration + this.getLookUpDuration() + this.getElevationSequenceDuration() + onSurfaceRoute.duration,
        destinationX: destination, destinationSurfaceId: targetSurface.id, approach, approachRoute, lookUpDuration: this.getLookUpDuration(), onSurfaceRoute, landedX,
        debugPoints: [{ x: sourceX }, { x: approach.takeoffX }, { x: landedX, surfaceId: targetSurface.id }, { x: destination, surfaceId: targetSurface.id }],
      };
    }
    // Source is elevated and the target is floor-level. Walk to the nearest
    // usable edge facing the floor target, descend, then continue normally.
    const exitDirection = destination >= sourceX ? 1 : -1;
    const edgeDirection = -exitDirection;
    const edgeX = this.getElevationEdge(sourceSurface, edgeDirection);
    const startPawX = edgeX + edgeDirection * layout.cell;
    const takeoffX = this.getSurfaceSafeX(
      PixelPetCard.DESCENT_FRAMES[1],
      exitDirection,
      this.getFrameXForLeadPaw(PixelPetCard.DESCENT_FRAMES[1], exitDirection, startPawX, layout),
      sourceSurface,
      layout
    );
    const approachRoute = direct(sourceX, takeoffX, `poi:${poi.id}:approach-down`);
    const landedX = Math.max(0, Math.min(
      layout.width - layout.spriteWidth,
      this.getDescentFollowX(edgeX, edgeDirection, exitDirection, sourceSurface, layout)
    ));
    const groundRoute = direct(landedX, destination, `poi:${poi.id}:ground`);
    return {
      kind: "down", duration: approachRoute.duration + this.getDescentSequenceDuration() + groundRoute.duration,
      destinationX: destination, destinationSurfaceId: null, edgeDirection, exitDirection, edgeX, approachRoute, groundRoute, landedX,
      debugPoints: [{ x: sourceX, surfaceId: sourceSurface.id }, { x: takeoffX, surfaceId: sourceSurface.id }, { x: landedX }, { x: destination }],
    };
  }

  getPoiWalkState(route, elapsed, layout, surface = null) {
    const step = this.getMotionRouteStep(route, elapsed);
    const rows = this.getWalkFrame(step % PixelPetCard.WALK_FRAMES.length);
    const facing = route.direction;
    const x = route.originX + route.direction * step * layout.cell;
    return {
      // A route is planned to a safe destination.  Never clamp individual
      // walk frames here: that changes their authored foot placement and
      // produces the visible edge "moonwalk".
      rows, x,
      facing, frame: step, walking: true,
      groundY: surface ? this.getGroundYForSupport(rows, surface.topY, facing, layout) : undefined,
    };
  }

  getPoiAscentState(plan, elapsed, layout) {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const surface = this.getElevatedSurface(layout, plan.approach.surfaceId);
    const sequence = this.getSequenceFrame(elapsed, frameMs, [1, 3, 1, 1, 1]);
    const frame = sequence.frame;
    const placement = this.getLeapPlacement("ascend", frame, plan.approach.edgeX, plan.approach.direction, plan.approach.direction, surface, layout);
    return {
      rows: placement.rows, x: placement.x,
      facing: plan.approach.direction, frame, frameName: `poi-elevate-${frame + 1}`, walking: false,
      groundY: placement.groundY,
    };
  }

  getPoiDescentState(plan, elapsed, layout) {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const sourceSurface = this.getElevatedSurface(layout, plan.debugPoints[0].surfaceId);
    const sequence = this.getSequenceFrame(elapsed, frameMs, [1, 1, 1, 3]);
    const frame = sequence.frame;
    const placement = this.getLeapPlacement("descend", frame, plan.edgeX, plan.edgeDirection, plan.exitDirection, sourceSurface, layout);
    return {
      rows: placement.rows, x: placement.x,
      facing: plan.exitDirection, frame, frameName: `poi-descend-${frame + 1}`, walking: false,
      groundY: placement.groundY,
    };
  }

  getMultiPoiTravelState(plan, elapsed, layout) {
    let remaining = Math.max(0, elapsed);
    for (const segment of plan.segments) {
      const duration = segment.kind === "walk"
        ? segment.route.duration
        : segment.kind === "look-up"
          ? segment.lookUpDuration
          : segment.flightDuration;
      if (remaining >= duration) {
        remaining -= duration;
        continue;
      }
      if (segment.kind === "walk") {
        return this.getPoiWalkState(segment.route, remaining, layout, segment.surfaceId ? this.getElevatedSurface(layout, segment.surfaceId) : null);
      }
      if (segment.kind === "look-up") {
        const sourceSurface = segment.sourceSurfaceId ? this.getElevatedSurface(layout, segment.sourceSurfaceId) : null;
        return {
          ...this.getLookUpState(remaining, layout, sourceSurface, segment.direction, {
            raw: true,
            anchorPawX: segment.takeoffPawX,
            supportY: sourceSurface?.topY || layout.floorY,
          }),
          frameName: `poi-look-up-${Math.floor(remaining / Math.max(80, Number(this.config.idle_frame_ms) || 250)) % PixelPetCard.LOOK_UP_FRAMES.length + 1}`,
        };
      }
      if (segment.kind === "up") {
        const sequence = this.getSequenceFrame(remaining, Math.max(80, Number(this.config.idle_frame_ms) || 250), [1, 3, 1, 1, 1]);
        const surface = this.getElevatedSurface(layout, segment.destinationSurfaceId);
        const placement = this.getLeapPlacement("ascend", sequence.frame, segment.edgeX, segment.direction, segment.direction, surface, segment.flightLayout);
        return { rows: placement.rows, x: placement.x, facing: segment.direction, frame: sequence.frame, frameName: `poi-elevate-${sequence.frame + 1}`, walking: false, groundY: placement.groundY };
      }
      const sequence = this.getSequenceFrame(remaining, Math.max(80, Number(this.config.idle_frame_ms) || 250), [1, 1, 1, 3]);
      const sourceSurface = this.getElevatedSurface(layout, segment.sourceSurfaceId);
      const placement = this.getLeapPlacement("descend", sequence.frame, segment.edgeX, segment.edgeDirection, segment.direction, sourceSurface, segment.flightLayout);
      return { rows: placement.rows, x: placement.x, facing: segment.direction, frame: sequence.frame, frameName: `poi-descend-${sequence.frame + 1}`, walking: false, groundY: placement.groundY };
    }
    const last = plan.segments[plan.segments.length - 1];
    return this.getPoiWalkState(last?.route || this.createMotionRoute(plan.destinationX, plan.destinationX, layout), 0, layout, plan.destinationSurfaceId ? this.getElevatedSurface(layout, plan.destinationSurfaceId) : null);
  }

  getPoiTravelState(plan, elapsed, layout) {
    if (plan.kind === "multi") return this.getMultiPoiTravelState(plan, elapsed, layout);
    if (plan.kind === "direct") {
      const surface = plan.destinationSurfaceId ? this.getElevatedSurface(layout, plan.destinationSurfaceId) : null;
      return this.getPoiWalkState(plan.route, elapsed, layout, surface);
    }
    if (elapsed < plan.approachRoute.duration) {
      const surface = plan.kind === "down" ? this.getElevatedSurface(layout, plan.debugPoints[0].surfaceId) : null;
      return this.getPoiWalkState(plan.approachRoute, elapsed, layout, surface);
    }
    const afterApproach = elapsed - plan.approachRoute.duration;
    if (plan.kind === "up" && afterApproach < plan.lookUpDuration) {
      return {
        ...this.getLookUpState(afterApproach, layout, null, plan.approach.direction, {
          raw: true,
          anchorPawX: plan.approach.takeoffPawX,
          supportY: layout.floorY,
        }),
        frameName: `poi-look-up-${Math.floor(Math.max(0, afterApproach) / Math.max(80, Number(this.config.idle_frame_ms) || 250)) % PixelPetCard.LOOK_UP_FRAMES.length + 1}`,
      };
    }
    const afterLookUp = afterApproach - (plan.kind === "up" ? plan.lookUpDuration : 0);
    const sequenceDuration = plan.kind === "up" ? this.getElevationSequenceDuration() : this.getDescentSequenceDuration();
    if (afterLookUp < sequenceDuration) {
      return plan.kind === "up"
        ? this.getPoiAscentState(plan, afterLookUp, layout)
        : this.getPoiDescentState(plan, afterLookUp, layout);
    }
    const afterLeap = afterLookUp - sequenceDuration;
    if (plan.kind === "up") return this.getPoiWalkState(plan.onSurfaceRoute, afterLeap, layout, this.getElevatedSurface(layout, plan.destinationSurfaceId));
    return this.getPoiWalkState(plan.groundRoute, afterLeap, layout);
  }

  getFoodVisitDurations(visit) {
    const walkFrameMs = this.getWalkFrameMs();
    const idleFrameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    return {
      travel: visit.travelPlan.duration,
      enter: walkFrameMs,
      eat: Math.max(1000, Number(this.config.food_visit_ms) || 8000),
      exit: walkFrameMs,
      settle: idleFrameMs * 3,
      cleanFirst: PixelPetCard.CLEANING_FRAMES.length * idleFrameMs * 2,
      cleanPause: idleFrameMs * 3,
      cleanSecond: PixelPetCard.CLEANING_FRAMES.length * idleFrameMs * 3,
      finalSit: idleFrameMs * 3,
      sitToWalk: walkFrameMs,
      depart: visit.departRoute.duration,
    };
  }

  activateFoodPoi(propId = null) {
    const now = this.getWorldNow();
    const layout = this.getLayout();
    const props = this.getWorldProps(layout);
    const chosenProp = props.find((prop) => prop.id === propId) || props[0];
    if (!chosenProp) return;
    if (this.isRobotRiding()) {
      this.requestRobotDismount({ type: "prop", action: "feed", propId: chosenProp.id, targetX: chosenProp.x });
      return;
    }
    const active = this.world.visit;
    if (active?.propId === chosenProp.id) {
      active.activatedAt = now;
      this.logWorldEvent("poi", `refresh food ${chosenProp.id}`, now);
      this.updateWorldActionControls();
      return;
    }
    if (active) return;
    const current = this.getSpriteState(now, layout, true);
    const sourceSurfaceId = this.world.elevated?.phase === "elevated"
      ? this.world.elevated.surfaceId
      : this.autoState?.surfaceId || this.manualState?.surfaceId || null;
    const catId = String(this.config.cat_id || "cat-1");
    const candidates = this.getPoiSlots(layout)
      .filter((slot) => slot.propId === chosenProp.id && slot.reachable && !slot.reservedBy);
    if (!candidates.length) return;
    const slot = candidates.sort((left, right) => (
      Math.abs(left.x - current.x) - Math.abs(right.x - current.x)
      || left.contactError - right.contactError
    ))[0];
    const direction = slot.x >= current.x ? 1 : -1;
    const departureTarget = Math.max(0, Math.min(
      layout.width - layout.spriteWidth,
      slot.x - slot.facing * Math.min(3, Math.floor((layout.width - layout.spriteWidth) / layout.cell)) * layout.cell
    ));
    const foodTarget = { id: `${chosenProp.id}:${slot.id}`, targetX: slot.x, surfaceId: null };
    const travelPlan = this.createPoiTravelPlan(
      layout,
      { x: Math.round(current.x), surfaceId: sourceSurfaceId },
      foodTarget,
      "food"
    );
    const departRoute = this.createMotionRoute(slot.x, departureTarget, layout, "amble", `${chosenProp.id}:depart`);
    this.world.reservations.set(slot.id, catId);
    this.poseTest = null;
    // A stable manually-elevated state otherwise survives the food visit and
    // would reclaim rendering after the descent finishes.
    if (this.world.elevated?.phase === "elevated") this.world.elevated = null;
    this.world.visit = {
      id: `food-${chosenProp.id}-${Math.round(now)}`,
      propId: chosenProp.id,
      poiId: slot.id,
      catId,
      activatedAt: now,
      originX: Math.round(current.x),
      targetX: slot.x,
      facing: slot.facing,
      travelFacing: direction,
      travelPlan,
      departureTarget,
      departFacing: departureTarget >= slot.x ? 1 : -1,
      departRoute,
    };
    this.logWorldEvent("poi", `food ${chosenProp.id} · ${travelPlan.kind} route`, now);
    this.updateWorldActionControls();
    this.update();
  }

  releaseFoodVisit(now, visit) {
    this.world.reservations.delete(visit.poiId);
    this.world.patrolOrigin = visit.departureTarget;
    this.world.visit = null;
    this.logWorldEvent("poi", `leave food ${visit.propId}`, now);
    this.startedAt = now;
    this.autoState = {
      x: visit.departureTarget,
      facing: visit.departFacing,
      pose: "stand",
      activity: null,
      initial: false,
    };
    this.manualState = { x: visit.departureTarget, facing: visit.departFacing, surfaceId: null };
    this.updateWorldActionControls();
  }

  getEatState(layout, x, facing, elapsed = 0) {
    // Keep the head planted in the bowl. The tail moves only every two seconds
    // by default, so eating remains calm rather than becoming an idle loop.
    const tailHoldMs = Math.max(1000, (Number(this.config.idle_frame_ms) || 250) * 8);
    const tailFrame = Math.floor(Math.max(0, elapsed) / tailHoldMs) % 2;
    return {
      rows: PixelPetCard.EAT_IDLE_FRAMES[0][tailFrame],
      x,
      facing,
      frame: tailFrame,
      frameName: `eat-head-low-tail-${tailFrame ? "high" : "low"}`,
      walking: false,
    };
  }

  getGlassApproaches(prop, layout) {
    // The source sheets put the three-cell glass at columns 17–19 in the
    // right-facing canvas. Mirroring maps it to columns 4–6. These are data
    // anchors, not visual clamps, so ordinary walking remains aligned when a
    // drinking visit ends.
    const sourceGlassLeft = 17;
    const mirroredGlassLeft = 24 - 1 - 19;
    const clampX = (x) => Math.round(Math.max(0, Math.min(layout.width - layout.spriteWidth, x)) / layout.cell) * layout.cell;
    return [
      { side: "left", facing: 1, x: clampX(prop.x - sourceGlassLeft * layout.cell) },
      { side: "right", facing: -1, x: clampX(prop.x - mirroredGlassLeft * layout.cell) },
    ];
  }

  getGlassCatRows(key) {
    const source = PixelPetCard.GLASS_DRINK_FRAMES[key] || PixelPetCard.GLASS_DRINK_FRAMES.sitSurface;
    return source.map((row, y) => [...row].map((token, x) => {
      if (token === "g" || token === "w") return ".";
      // Red source cells are paw diagnostics except for the tongue at the
      // water surface inside the glass. Keep only that authored red cell.
      if (token === "T") return x >= 17 && x <= 19 && y < 23 ? "T" : "#";
      return token;
    }).join(""));
  }

  activateGlassVisit(propId) {
    const now = this.getWorldNow();
    const layout = this.getLayout();
    const glass = this.getWorldProps(layout).find((prop) => prop.id === propId && prop.type === "water_glass");
    if (this.isRobotRiding()) {
      this.requestRobotDismount({ type: "prop", action: "drink", propId, targetX: glass?.x });
      return;
    }
    // Do not replace an in-flight surface transition with a drink request.
    // A request made while elevated is instead routed through the normal
    // surface travel plan below, including a descent when required.
    if (!glass || this.world.visit || this.world.boxEntry || this.world.glassVisit || this.world.surfaceTravel) return;
    if (this.world.elevated && this.world.elevated.phase !== "elevated") return;
    const current = this.getSpriteState(now, layout, true);
    const sourceSurfaceId = this.world.elevated?.phase === "elevated"
      ? this.world.elevated.surfaceId
      : this.autoState?.surfaceId || this.manualState?.surfaceId || null;
    const approach = this.getGlassApproaches(glass, layout)
      .sort((left, right) => Math.abs(left.x - current.x) - Math.abs(right.x - current.x))[0];
    const travelPlan = this.createPoiTravelPlan(
      layout,
      { x: Math.round(current.x), surfaceId: sourceSurfaceId },
      { id: `glass:${glass.id}:${approach.side}`, targetX: approach.x, surfaceId: null },
      "prompt"
    );
    if (!travelPlan) return;
    if (this.world.elevated?.phase === "elevated") this.world.elevated = null;
    this.poseTest = null;
    const style = ((Math.floor(now / 1000) + Math.round(current.x / layout.cell)) % 5) < 3 ? "sit" : "stand";
    this.world.glassVisit = {
      id: `glass-${glass.id}-${Math.round(now)}`,
      propId: glass.id,
      targetX: approach.x,
      facing: approach.facing,
      style,
      phase: "travel",
      phaseAt: now,
      travelPlan,
      sips: 0,
      levelsDrained: 0,
      depth: 0,
      failures: 0,
      tailVariant: style === "stand" && ((Math.floor(now / 1000) + Math.round(current.x / layout.cell)) % 2 === 0),
    };
    this.logWorldEvent("poi", `drink ${glass.id} from ${approach.side}`, now);
    this.update();
  }

  advanceGlassVisit(visit, now, layout) {
    const glassState = this.getGlassState(visit.propId);
    const elapsed = now - visit.phaseAt;
    const idleMs = Math.max(500, (Number(this.config.idle_frame_ms) || 250) * 3);
    if (visit.phase === "observe" && elapsed >= idleMs) {
      visit.phase = "lick";
      visit.phaseAt = now;
      return;
    }
    if (visit.phase !== "lick" || elapsed < Math.max(240, (Number(this.config.idle_frame_ms) || 250) * 1.4)) return;
    // The lower the remaining surface, the deeper the muzzle must go. The
    // supplied blue-tinted muzzle frames cover depths 1 and 2. At level 2 the
    // cat may try, but cannot reach it: this is the deliberate stopping point.
    const requiredDepth = glassState.waterLevel >= 4 ? 0 : glassState.waterLevel === 3 ? 1 : 2;
    if (glassState.waterLevel <= 2) {
      if (visit.depth < requiredDepth) {
        visit.depth += 1;
        visit.phase = "observe";
        visit.phaseAt = now;
      } else {
        visit.failures += 1;
        if (visit.failures === 1) this.logWorldEvent("poi", `${visit.propId} water is out of reach`, now);
        visit.phase = visit.failures >= 2 ? "leave" : "observe";
        visit.phaseAt = now;
      }
      return;
    }
    if (visit.depth < requiredDepth) {
      visit.depth += 1;
      visit.phase = "observe";
      visit.phaseAt = now;
      return;
    }
    visit.sips += 1;
    // Three quiet licks consume exactly one visible water cell.
    if (visit.sips >= 3) {
      this.setGlassWaterLevel(visit.propId, glassState.waterLevel - 1);
      visit.sips = 0;
      visit.levelsDrained += 1;
      this.logWorldEvent("prop", `${visit.propId} water ${glassState.waterLevel - 1}/5`, now);
    }
    visit.phase = visit.levelsDrained >= 2 ? "leave" : "observe";
    visit.phaseAt = now;
  }

  releaseGlassVisit(visit, now, layout) {
    this.world.glassVisit = null;
    // Do not invent a departure offset here.  The next Auto destination will
    // create a normal walk plan; moving the cat three cells in one render made
    // a completed drink look like a small teleport in the continuity log.
    const settledX = Math.round(visit.targetX);
    this.world.patrolOrigin = settledX;
    this.autoState = { x: settledX, facing: visit.facing, pose: "stand", activity: null, initial: false };
    this.manualState = { x: settledX, facing: visit.facing, surfaceId: null };
    this.startedAt = now;
    this.logWorldEvent("poi", `leave glass ${visit.propId}`, now);
  }

  getGlassVisitState(now, layout) {
    const visit = this.world.glassVisit;
    if (!visit) return null;
    if (visit.phase === "travel") {
      const elapsed = Math.max(0, now - visit.phaseAt);
      if (elapsed < visit.travelPlan.duration) {
        const travel = this.getPoiTravelState(visit.travelPlan, elapsed, layout);
        return { ...travel, frameName: `glass-travel-${travel.frameName || "walk"}` };
      }
      visit.phase = "observe";
      visit.phaseAt = now;
    }
    if (visit.phase === "leave") {
      this.releaseGlassVisit(visit, now, layout);
      return this.autoEnabled ? this.getAutoState(now, layout) : this.getManualState(layout);
    }
    this.advanceGlassVisit(visit, now, layout);
    const licking = visit.phase === "lick";
    const base = `${visit.style}${visit.depth ? `Depth${visit.depth}` : "Surface"}`;
    const key = licking ? `${base}Lick` : base;
    const variantKey = visit.tailVariant && !licking && key === "standDepth1" ? "standDepth1Alt" : key;
    const fallback = visit.style === "sit" ? (visit.depth ? "sitDepth1" : "sitSurface") : (visit.depth ? "standDepth1" : "standSurface");
    return {
      rows: this.getGlassCatRows(PixelPetCard.GLASS_DRINK_FRAMES[variantKey] ? variantKey : fallback),
      x: visit.targetX,
      facing: visit.facing,
      frame: visit.sips,
      walking: false,
      frameName: `glass-${visit.style}-${licking ? "lick" : "watch"}-depth-${visit.depth}`,
    };
  }

  getSitToWalkTransitionState(x, facing) {
    // The authored walk-to-sit drawing is also the one-beat reverse bridge
    // out of sitting. Keeping one source sprite prevents the two directions
    // from drifting apart while preserving the cat's current anchor/facing.
    return {
      rows: PixelPetCard.TRANSITIONS.walk_to_sit[0],
      x,
      facing,
      frame: 0,
      walking: false,
    };
  }

  getCleaningState(elapsed, layout, x, facing) {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const frame = Math.floor(Math.max(0, elapsed) / frameMs) % PixelPetCard.CLEANING_FRAMES.length;
    return {
      rows: PixelPetCard.CLEANING_FRAMES[frame],
      x,
      facing,
      frame,
      walking: false,
    };
  }

  getFoodVisitState(now, layout) {
    const visit = this.world.visit;
    if (!visit) return null;
    const elapsed = Math.max(0, now - visit.activatedAt);
    const durations = this.getFoodVisitDurations(visit);
    let remaining = elapsed;
    if (remaining < durations.travel) {
      const travel = this.getPoiTravelState(visit.travelPlan, remaining, layout);
      return { ...travel, frameName: `food-${travel.frameName || (travel.walking ? "travel" : "arrival")}` };
    }
    remaining -= durations.travel;
    if (remaining < durations.enter) {
      return {
        rows: PixelPetCard.EAT_IDLE_FRAMES[1][1],
        x: visit.targetX,
        facing: visit.facing,
        frame: 0,
        walking: false,
      };
    }
    remaining -= durations.enter;
    if (remaining < durations.eat) return this.getEatState(layout, visit.targetX, visit.facing, remaining);
    remaining -= durations.eat;
    if (remaining < durations.exit) {
      return {
        rows: PixelPetCard.EAT_IDLE_FRAMES[1][1],
        x: visit.targetX,
        facing: visit.facing,
        frame: 0,
        walking: false,
      };
    }
    remaining -= durations.exit;
    if (remaining < durations.settle) return this.getSitState(remaining, layout, visit.targetX, visit.facing);
    remaining -= durations.settle;
    if (remaining < durations.cleanFirst) return this.getCleaningState(remaining, layout, visit.targetX, visit.facing);
    remaining -= durations.cleanFirst;
    if (remaining < durations.cleanPause) return this.getSitState(remaining, layout, visit.targetX, visit.facing);
    remaining -= durations.cleanPause;
    if (remaining < durations.cleanSecond) return this.getCleaningState(remaining, layout, visit.targetX, visit.facing);
    remaining -= durations.cleanSecond;
    if (remaining < durations.finalSit) return this.getSitState(remaining, layout, visit.targetX, visit.facing);
    remaining -= durations.finalSit;
    if (remaining < durations.sitToWalk) return this.getSitToWalkTransitionState(visit.targetX, visit.departFacing);
    remaining -= durations.sitToWalk;
    if (remaining < durations.depart) {
      const step = this.getMotionRouteStep(visit.departRoute, remaining);
      return {
        rows: this.getWalkFrame(step % 4),
        x: visit.departRoute.originX + visit.departRoute.direction * step * layout.cell,
        facing: visit.departFacing,
        frame: step,
        walking: true,
      };
    }
    this.releaseFoodVisit(now, visit);
    return this.getStandPauseState(0, layout, visit.departureTarget, visit.departFacing);
  }

  randomInt(minimum, maximum) {
    return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
  }

  chooseAutoActivity(state, surface = null) {
    // Surface affordances are the single source of truth for what a cat may
    // do after arriving somewhere. A narrow arm can be a useful stepping
    // stone without accidentally starting a walk or loaf animation there.
    const accepted = surface ? new Set(surface.acceptedPoses || surface.supports || ["sit"]) : null;
    const accepts = (activity) => !accepted || accepted.has(activity);
    const choose = (weights, fallback = "sit") => {
      const activityWeights = surface?.activityWeights;
      const entries = Object.entries(weights)
        .filter(([activity]) => accepts(activity))
        .map(([activity, baseWeight]) => {
          const surfaceWeight = activityWeights ? Number(activityWeights[activity] ?? 0) : 1;
          return [activity, Math.max(0, Number(baseWeight) || 0) * Math.max(0, surfaceWeight || 0)];
        })
        .filter(([, weight]) => weight > 0);
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
      if (!total) return fallback;
      let pick = Math.random() * total;
      for (const [activity, weight] of entries) {
        pick -= weight;
        if (pick < 0) return activity;
      }
      return entries[entries.length - 1][0];
    };

    if (state.initial && accepts("walk")) return "walk";
    if (state.pose === "loaf") return choose({ loaf: 2, stretch: 1, sit: 1 });
    if (state.pose === "sit") return choose({ sit: 1, clean: 2, loaf: 1, walk: 1, stand: 1 });
    return choose({ walk: 2, stand: 1, sit: 1 });
  }

  startAutoActivity(now, layout, state) {
    const idleFrameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const currentSurface = state.surfaceId ? this.getElevatedSurface(layout, state.surfaceId) : null;
    const poi = this.chooseAutoPoi(now, layout, state);
    const type = this.chooseAutoActivity(state, currentSurface);
    const bounds = this.getPoiBounds(layout, currentSurface);
    const x = Math.max(bounds.minX, Math.min(bounds.maxX, state.x));
    let activity;
    if (poi) {
      // Stateful prop actions can declare their own contact point. A glass,
      // for example, is approached from a side rather than from its visual
      // centre, so both Auto and a user invitation use the same geometry.
      let poiTarget = poi;
      if (poi.intent === "drink" && poi.propId) {
        const glass = this.getWorldProps(layout).find((prop) => prop.id === poi.propId && prop.type === "water_glass");
        if (glass) {
          const approach = this.getGlassApproaches(glass, layout)
            .sort((left, right) => Math.abs(left.x - x) - Math.abs(right.x - x))[0];
          poiTarget = { ...poi, targetX: approach.x, surfaceId: null };
        }
      }
      const plan = this.createPoiTravelPlan(layout, { ...state, x }, poiTarget, poi.profile || "poi");
      this.reservePoi(poi, now);
      activity = {
        type: "poi", startedAt: now, duration: plan.duration, x,
        destination: plan.destinationX, facing: plan.destinationX >= x ? 1 : -1,
        poiId: poi.id, plan, targetSurfaceId: plan.destinationSurfaceId,
        propId: poi.propId || null, intent: poi.intent || null, after: "stand",
      };
    } else if (type === "walk") {
      const leftCells = Math.floor((x - bounds.minX) / layout.cell);
      const rightCells = Math.floor((bounds.maxX - x) / layout.cell);
      const direction = rightCells <= 0 ? -1 : leftCells <= 0 ? 1 : Math.random() < 0.5 ? 1 : -1;
      // Direction changes are intentionally an immediate facing change in
      // normal play. The authored pivot frames are retained only as a
      // debug spin because they do not read as a natural walking reversal.
      const routeOrigin = x;
      const routeLeftCells = Math.floor((routeOrigin - bounds.minX) / layout.cell);
      const routeRightCells = Math.floor((bounds.maxX - routeOrigin) / layout.cell);
      const available = direction > 0 ? routeRightCells : routeLeftCells;
      const cells = Math.max(1, Math.min(Math.max(1, available), this.randomInt(8, 14)));
      const destination = routeOrigin + direction * cells * layout.cell;
      const route = this.createMotionRoute(routeOrigin, destination, layout, "amble", `auto:${state.pose}`);
      const sitToWalkMs = state.pose === "sit" ? this.getWalkFrameMs() : 0;
      activity = {
        type,
        startedAt: now,
        duration: sitToWalkMs + route.duration,
        x: routeOrigin,
        destination,
        facing: direction,
        route,
        sitToWalkMs,
        after: "stand",
      };
    } else if (type === "stand") {
      activity = { type, startedAt: now, duration: this.randomInt(3, 6) * idleFrameMs, x, facing: state.facing, after: "stand" };
    } else if (type === "sit") {
      activity = { type, startedAt: now, duration: idleFrameMs + this.randomInt(16, 28) * idleFrameMs, x, facing: state.facing, after: "sit" };
    } else if (type === "clean") {
      const repeats = this.randomInt(2, 3);
      activity = { type, startedAt: now, duration: repeats * PixelPetCard.CLEANING_FRAMES.length * idleFrameMs, x, facing: state.facing, after: "sit" };
    } else if (type === "loaf") {
      const enterBridge = state.pose === "sit";
      activity = { type, startedAt: now, duration: (enterBridge ? idleFrameMs : 0) + this.randomInt(40, 64) * idleFrameMs, x, facing: state.facing, enterBridge, after: "loaf" };
    } else {
      const holds = PixelPetCard.TRANSITION_HOLD_TICKS.loaf_to_walk;
      activity = { type: "stretch", startedAt: now, duration: holds.reduce((total, ticks) => total + Math.max(1, ticks) * idleFrameMs, 0), x, facing: state.facing, after: "stand" };
    }
    state.activity = activity;
    state.initial = false;
  }

  createElevatedSitActivity(now, x, facing) {
    const idleFrameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    return {
      type: "elevated-sit",
      startedAt: now,
      // A short settling pause after a leap makes the surface feel like a
      // destination, before Auto resumes choosing ordinary activities.
      duration: this.randomInt(10, 16) * idleFrameMs,
      x,
      facing,
      after: "sit",
    };
  }

  getAutoState(now, layout) {
    if (!this.autoState) {
      this.autoState = { x: this.world.patrolOrigin ?? layout.leftX, facing: 1, pose: "stand", activity: null, initial: true, surfaceId: null, surfaceActivities: 0 };
    }
    const state = this.autoState;
    // Consume completed activities before rendering. The cap protects against
    // a tab returning from a very long sleep without spinning indefinitely.
    for (let guard = 0; guard < 12; guard += 1) {
      if (!state.activity) this.startAutoActivity(now, layout, state);
      const elapsed = Math.max(0, now - state.activity.startedAt);
      if (elapsed < state.activity.duration) break;
      const completed = state.activity;
      if (completed.type === "poi") {
        const poi = this.world.pois.get(completed.poiId);
        this.releasePoi(poi, now);
        state.surfaceId = completed.targetSurfaceId || null;
        // The box is the first prop action. Its invitation uses ordinary POI
        // pathing up to the authored launch position, then hands off to the
        // dedicated, frame-anchored entry clip.
        if (completed.intent === "box" && completed.propId) {
          state.x = completed.destination ?? completed.x;
          state.facing = completed.facing;
          state.pose = "stand";
          state.activity = null;
          this.startBoxEntryTest(completed.propId, state, "poi");
          return this.getSpriteState(now, layout, true);
        }
        if (completed.intent === "drink" && completed.propId) {
          state.x = completed.destination ?? completed.x;
          state.facing = completed.facing;
          state.pose = "stand";
          state.activity = null;
          this.activateGlassVisit(completed.propId);
          return this.getGlassVisitState(now, layout) || this.getAutoState(now, layout);
        }
      }
      state.x = completed.destination ?? completed.x;
      state.facing = completed.facing;
      state.pose = completed.after;
      state.activity = null;
      // Reaching an elevated POI always gets a small, purposeful settle.
      // After this finishes, the normal Auto planner owns the cat again and
      // can wander the surface or pick a floor POI to climb back down.
      if (completed.type === "poi" && state.surfaceId) {
        state.pose = "sit";
        state.surfaceActivities = 0;
        state.activity = this.createElevatedSitActivity(now, state.x, state.facing);
        break;
      }
      if (state.surfaceId && completed.type !== "elevated-sit") {
        state.surfaceActivities = (state.surfaceActivities || 0) + 1;
      }
    }
    const activity = state.activity;
    const elapsed = Math.max(0, now - activity.startedAt);
    const idleFrameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    if (activity.type === "poi") return this.getPoiTravelState(activity.plan, elapsed, layout);
    if (activity.type === "walk") {
      if (elapsed < (activity.sitToWalkMs || 0)) return this.getSitToWalkTransitionState(activity.x, activity.facing);
      const step = this.getMotionRouteStep(activity.route, elapsed - (activity.sitToWalkMs || 0));
      return { rows: this.getWalkFrame(step % 4), x: activity.route.originX + activity.route.direction * step * layout.cell, facing: activity.facing, frame: step, walking: true };
    }
    if (activity.type === "turn-walk") {
      if (elapsed < activity.turnMs) return this.getTurnState(elapsed, layout, activity.pivotX, -activity.facing);
      const step = this.getMotionRouteStep(activity.route, elapsed - activity.turnMs);
      return { rows: this.getWalkFrame(step % 4), x: activity.route.originX + activity.route.direction * step * layout.cell, facing: activity.facing, frame: step, walking: true };
    }
    if (activity.type === "stand") return this.getStandPauseState(elapsed, layout, activity.x, activity.facing);
    if (activity.type === "sit") {
      if (elapsed < idleFrameMs) return { rows: PixelPetCard.TRANSITIONS.walk_to_sit[0], x: activity.x, facing: activity.facing, frame: 0, walking: false };
      return this.getSitState(elapsed - idleFrameMs, layout, activity.x, activity.facing);
    }
    if (activity.type === "elevated-sit") {
      const frame = Math.floor(elapsed / (idleFrameMs * 3)) % PixelPetCard.ELEVATED_SIT_FRAMES.length;
      return { rows: PixelPetCard.ELEVATED_SIT_FRAMES[frame], x: activity.x, facing: activity.facing, frame, walking: false };
    }
    if (activity.type === "clean") return this.getCleaningState(elapsed, layout, activity.x, activity.facing);
    if (activity.type === "loaf") {
      if (activity.enterBridge && elapsed < idleFrameMs) return { rows: PixelPetCard.TRANSITIONS.sit_to_loaf[0], x: activity.x, facing: activity.facing, frame: 0, walking: false };
      return this.getLoafState(elapsed - (activity.enterBridge ? idleFrameMs : 0), layout, activity.x, activity.facing);
    }
    let remaining = elapsed;
    const holds = PixelPetCard.TRANSITION_HOLD_TICKS.loaf_to_walk;
    for (let frame = 0; frame < PixelPetCard.TRANSITIONS.loaf_to_walk.length; frame += 1) {
      const holdMs = Math.max(1, holds[frame] ?? 1) * idleFrameMs;
      if (remaining < holdMs) return { rows: PixelPetCard.TRANSITIONS.loaf_to_walk[frame], x: activity.x, facing: activity.facing, frame, walking: false };
      remaining -= holdMs;
    }
    return this.getStandPauseState(0, layout, activity.x, activity.facing);
  }

  getPatrol(now, layout, elapsed = now - this.startedAt, originX = layout.leftX) {
    const frameMs = Math.max(80, Number(this.config.walk_cycle_ms) || 1000) / 4;
    const restMs = Math.max(0, Number(this.config.rest_ms) || 1200);
    const leftX = Math.max(0, Math.min(layout.width - layout.spriteWidth, originX));
    const travelCells = Math.max(0, Math.min(
      layout.travelCells,
      Math.floor((layout.width - layout.spriteWidth - leftX) / layout.cell)
    ));
    const walkingMs = travelCells * frameMs;
    const total = restMs + walkingMs + restMs + walkingMs;
    if (!layout.travelCells || !total) {
      return { frame: 0, x: leftX, facing: 1, walking: false, pauseElapsed: 0 };
    }

    const phase = ((elapsed % total) + total) % total;
    if (phase < restMs) {
      return { frame: 0, x: leftX, facing: 1, walking: false, pauseElapsed: phase };
    }
    if (phase < restMs + walkingMs) {
      const step = Math.min(travelCells, Math.floor((phase - restMs) / frameMs));
      return { frame: step % 4, x: leftX + step * layout.cell, facing: 1, walking: true };
    }
    if (phase < restMs + walkingMs + restMs) {
      return { frame: 0, x: leftX + travelCells * layout.cell, facing: -1, walking: false, pauseElapsed: phase - restMs - walkingMs };
    }
    const step = Math.min(travelCells, Math.floor((phase - restMs - walkingMs - restMs) / frameMs));
    return {
      frame: step % 4,
      x: leftX + (travelCells - step) * layout.cell,
      facing: -1,
      walking: true,
    };
  }

  getWalkFrame(frame) {
    // Playback frame 1 is the previously authored frame 2. This makes the
    // first walking silhouette agree with the standing pause at take-off.
    return PixelPetCard.WALK_FRAMES[(frame + 1) % PixelPetCard.WALK_FRAMES.length];
  }

  getTurnDuration() {
    return PixelPetCard.TURN_FRAMES.length * Math.max(80, Number(this.config.idle_frame_ms) || 250);
  }

  getSpinDuration() {
    // Two authored half-turns: right-to-left then left-to-right, or the
    // mirrored reverse when the cat begins facing left.
    return this.getTurnDuration() * 2;
  }

  getTurnState(elapsed, layout, pivotX, fromFacing = 1) {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const tick = Math.min(PixelPetCard.TURN_FRAMES.length - 1, Math.floor(Math.max(0, elapsed) / frameMs));
    // The supplied frames are authored right-to-left. A left-to-right turn is
    // the same clip read backwards and mirrored, never a separately invented
    // sprite. Every beat is aligned by its explicit rear bearing point.
    const frame = fromFacing > 0 ? tick : PixelPetCard.TURN_FRAMES.length - 1 - tick;
    const rows = PixelPetCard.TURN_FRAMES[frame];
    const renderFacing = fromFacing > 0 ? 1 : -1;
    const placement = this.placeFrameByLocalPoint(
      rows,
      renderFacing,
      PixelPetCard.TURN_REAR_ANCHORS[frame],
      pivotX,
      layout.floorY,
      layout
    );
    return {
      rows,
      ...placement,
      facing: renderFacing,
      frame,
      frameName: `turn-${tick + 1}`,
      turning: true,
    };
  }

  getSpinState(elapsed, layout, pivotX, fromFacing = 1) {
    const halfTurnMs = this.getTurnDuration();
    if (elapsed < halfTurnMs) return this.getTurnState(elapsed, layout, pivotX, fromFacing);
    return this.getTurnState(elapsed - halfTurnMs, layout, pivotX, -fromFacing);
  }

  getTurnPivotX(state, layout) {
    const rear = this.getFrameContact(state.rows, state.facing, "rear");
    return Math.round(state.x + rear[0] * layout.cell);
  }

  getSitState(elapsed, layout, x = null, facing = 1) {
    // Both clocks advance on the same fixed grid, so captures always land on
    // whole authored frames. Their differing step counts make the tail change
    // independently of the slower body-breath state.
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const breathSteps = Math.max(1, Math.round(Number(this.config.sit_breath_steps) || 4));
    const tailSteps = Math.max(1, Math.round(Number(this.config.sit_tail_steps) || 3));
    const tick = Math.floor(Math.max(0, elapsed) / frameMs);
    const breath = Math.floor(tick / breathSteps) % 2;
    const tail = Math.floor(tick / tailSteps) % 2;
    return {
      rows: PixelPetCard.SIT_IDLE_FRAMES[breath][tail],
      x: x ?? (layout.width - layout.spriteWidth) / 2,
      facing,
      frame: tick,
      walking: false,
    };
  }

  getStandPauseState(elapsed, layout, x = null, facing = 1) {
    // This is intentionally a brief pause player, not a permanent rest pose.
    // Head/body and tail use the same grid clock but independent step counts.
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const breathSteps = Math.max(1, Math.round(Number(this.config.stand_pause_breath_steps) || 4));
    const tailSteps = Math.max(1, Math.round(Number(this.config.stand_pause_tail_steps) || 3));
    const tick = Math.floor(Math.max(0, elapsed) / frameMs);
    const breath = Math.floor(tick / breathSteps) % 2;
    const tail = Math.floor(tick / tailSteps) % 2;
    return {
      rows: this.shiftRows(PixelPetCard.STAND_PAUSE_FRAMES[breath][tail], -1),
      x: x ?? (layout.width - layout.spriteWidth) / 2,
      facing,
      frame: tick,
      walking: false,
    };
  }

  getLookUpDuration() {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    return PixelPetCard.LOOK_UP_FRAMES.length * frameMs;
  }

  getLookUpState(elapsed, layout, x = null, facing = 1, options = {}) {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const frame = Math.floor(Math.max(0, elapsed) / frameMs) % PixelPetCard.LOOK_UP_FRAMES.length;
    let rows = PixelPetCard.LOOK_UP_FRAMES[frame];
    // On the ordinary floor this uses the same backwards-in-cat-space artwork
    // offset as the standing pause.  Elevation routing instead supplies an
    // explicit lead-paw anchor, so the authored feet remain exactly at takeoff.
    if (!options.raw) rows = this.shiftRows(rows, -1);
    const anchoredX = options.anchorPawX == null
      ? (x ?? (layout.width - layout.spriteWidth) / 2)
      : this.getFrameXForLeadPaw(rows, facing, options.anchorPawX, layout);
    return {
      rows,
      x: anchoredX,
      facing,
      frame,
      frameName: `look-up-${frame + 1}`,
      walking: false,
      groundY: options.supportY == null
        ? undefined
        : this.getGroundYForSupport(rows, options.supportY, facing, layout),
    };
  }

  getWalkToSit(now, layout, originX = layout.leftX, facing = 1) {
    const elapsed = Math.max(0, now - this.startedAt);
    const frameMs = Math.max(80, Number(this.config.walk_cycle_ms) || 1000) / 4;
    const restMs = Math.max(0, Number(this.config.rest_ms) || 1200);
    const startX = Math.max(0, Math.min(layout.width - layout.spriteWidth, originX));
    const roomAhead = facing > 0
      ? Math.floor((layout.width - layout.spriteWidth - startX) / layout.cell)
      : Math.floor(startX / layout.cell);
    const walkCells = Math.min(layout.travelCells, 6, Math.max(0, roomAhead));
    const walkMs = walkCells * frameMs;
    const transition = PixelPetCard.TRANSITIONS.walk_to_sit;
    const pauseMs = restMs;
    const transitionMs = transition.length * frameMs;
    const sitX = startX + facing * walkCells * layout.cell;

    if (elapsed < restMs) return this.getStandPauseState(elapsed, layout, startX, facing);
    if (elapsed < restMs + walkMs) {
      const step = Math.min(walkCells, Math.floor((elapsed - restMs) / frameMs));
      return { rows: this.getWalkFrame(step % 4), x: startX + facing * step * layout.cell, facing, frame: step % 4, walking: true };
    }
    if (elapsed < restMs + walkMs + pauseMs) {
      return this.getStandPauseState(elapsed - restMs - walkMs, layout, sitX, facing);
    }
    if (elapsed < restMs + walkMs + pauseMs + transitionMs) {
      const frame = Math.min(transition.length - 1, Math.floor((elapsed - restMs - walkMs - pauseMs) / frameMs));
      return { rows: transition[frame], x: sitX, facing, frame, walking: false };
    }
    return this.getSitState(elapsed - restMs - walkMs - pauseMs - transitionMs, layout, sitX, facing);
  }

  getLoafState(elapsed, layout, x = null, facing = 1) {
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const lowHeadSteps = Math.max(1, Math.round(Number(this.config.loaf_low_head_steps) || 12));
    const alertSteps = Math.max(1, Math.round(Number(this.config.loaf_alert_steps) || 1));
    const cycleSteps = lowHeadSteps + alertSteps;
    const tick = Math.floor(Math.max(0, elapsed) / frameMs) % cycleSteps;
    // Frame 0 is the supplied low-head catnap. Frame 1 is a brief alert
    // glance, not a symmetric breathing loop.
    const frame = tick < lowHeadSteps ? 0 : 1;
    return {
      rows: PixelPetCard.LOAF_IDLE_FRAMES[frame],
      x: x ?? (layout.width - layout.spriteWidth) / 2,
      facing,
      frame,
      walking: false,
    };
  }

  getSitToLoaf(now, layout, x = null, facing = 1) {
    const elapsed = Math.max(0, now - this.startedAt);
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const settleMs = Math.max(0, Number(this.config.rest_ms) || 1200);
    const transition = PixelPetCard.TRANSITIONS.sit_to_loaf;
    const transitionMs = transition.length * frameMs;
    const anchorX = x ?? (layout.width - layout.spriteWidth) / 2;
    if (elapsed < settleMs) return this.getSitState(elapsed, layout, anchorX, facing);
    if (elapsed < settleMs + transitionMs) {
      const frame = Math.min(transition.length - 1, Math.floor((elapsed - settleMs) / frameMs));
      return {
        rows: transition[frame],
        x: anchorX,
        facing,
        frame,
        walking: false,
      };
    }
    return this.getLoafState(elapsed - settleMs - transitionMs, layout, anchorX, facing);
  }

  getLoafToWalk(now, layout, x = layout.leftX, facing = 1) {
    const elapsed = Math.max(0, now - this.startedAt);
    const frameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const settleMs = Math.max(0, Number(this.config.rest_ms) || 1200);
    const transition = PixelPetCard.TRANSITIONS.loaf_to_walk;
    const holdTicks = PixelPetCard.TRANSITION_HOLD_TICKS.loaf_to_walk;
    const transitionMs = holdTicks.reduce((total, ticks) => total + Math.max(1, ticks) * frameMs, 0);
    const routeX = Math.max(0, Math.min(layout.width - layout.spriteWidth, x));
    if (elapsed < settleMs) return this.getLoafState(elapsed, layout, routeX, facing);
    if (elapsed < settleMs + transitionMs) {
      let remaining = elapsed - settleMs;
      let frame = transition.length - 1;
      for (let index = 0; index < transition.length; index += 1) {
        const holdMs = Math.max(1, holdTicks[index] ?? 1) * frameMs;
        if (remaining < holdMs) {
          frame = index;
          break;
        }
        remaining -= holdMs;
      }
      return { rows: transition[frame], x: routeX, facing, frame, walking: false };
    }
    const patrol = this.getPatrol(now, layout, elapsed - settleMs - transitionMs, routeX);
    return {
      ...patrol,
      rows: patrol.walking ? this.getWalkFrame(patrol.frame) : this.getStandPauseState(patrol.pauseElapsed, layout, patrol.x, patrol.facing).rows,
    };
  }

  getRoutineDuration(name, layout) {
    const idleFrameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const walkFrameMs = Math.max(80, Number(this.config.walk_cycle_ms) || 1000) / 4;
    const restMs = Math.max(0, Number(this.config.rest_ms) || 1200);
    if (name === "walk_to_sit") {
      return restMs + Math.min(layout.travelCells, 6) * walkFrameMs + restMs
        + PixelPetCard.TRANSITIONS.walk_to_sit.length * walkFrameMs;
    }
    if (name === "sit_to_loaf") {
      return restMs + PixelPetCard.TRANSITIONS.sit_to_loaf.length * idleFrameMs;
    }
    if (name === "sit_to_walk") return this.getWalkFrameMs();
    if (name === "turn") return this.getSpinDuration();
    if (name === "loaf_to_walk") {
      return restMs + PixelPetCard.TRANSITION_HOLD_TICKS.loaf_to_walk
        .reduce((total, ticks) => total + Math.max(1, ticks) * idleFrameMs, 0);
    }
    return 0;
  }

  getConfiguredTestPose() {
    const pose = String(this.config.pose || "auto");
    if (pose === "sit" || pose === "loaf" || pose === "stand_pause" || pose === "stand" || pose === "look_up" || pose === "turn") {
      return pose === "stand_pause" ? "stand" : pose;
    }
    const routine = String(this.config.routine || "patrol");
    if (routine === "walk_to_sit") return "sit";
    if (routine === "sit_to_loaf") return "loaf";
    return "walk";
  }

  startPoseTest(requested) {
    const now = this.getWorldNow();
    if (requested === "auto") {
      this.toggleAuto();
      return;
    }
    const source = this.poseTest?.target || this.autoState?.pose || this.getConfiguredTestPose();
    const current = this.getSpriteState(now, this.getLayout());
    let target = requested;
    let sequence = [];
    if (requested === "turn") {
      target = "turn";
    } else if (requested === "stretch") {
      target = "walk";
      sequence = ["loaf_to_walk"];
    } else if (requested === "walk" && source === "loaf") {
      sequence = ["loaf_to_walk"];
    } else if (requested === "walk" && source === "sit") {
      sequence = ["sit_to_walk"];
    } else if (requested === "sit" && source === "loaf") {
      sequence = ["loaf_to_walk", "walk_to_sit"];
    } else if (requested === "sit" && source !== "sit") {
      sequence = ["walk_to_sit"];
    } else if (requested === "loaf" && source === "sit") {
      sequence = ["sit_to_loaf"];
    } else if (requested === "loaf" && source !== "loaf") {
      sequence = ["walk_to_sit", "sit_to_loaf"];
    } else if (requested === "stand" && source === "loaf") {
      sequence = ["loaf_to_walk"];
    }
    this.startedAt = now;
    // Keep the current sprite anchor through pose changes. Transition clips
    // can move deliberately, but selecting an idle stance must not teleport
    // the cat to the centre or patrol origin.
    const idleFrameMs = Math.max(80, Number(this.config.idle_frame_ms) || 250);
    const transitionMs = sequence.reduce((total, routine) => total + this.getRoutineDuration(routine, this.getLayout()), 0);
    const holdMs = {
      walk: this.randomInt(18, 28) * this.getWalkFrameMs(),
      stand: this.randomInt(6, 10) * idleFrameMs,
      look_up: this.getLookUpDuration(),
      sit: this.randomInt(14, 22) * idleFrameMs,
      clean: this.randomInt(2, 3) * PixelPetCard.CLEANING_FRAMES.length * idleFrameMs,
      loaf: this.randomInt(28, 42) * idleFrameMs,
      turn: this.getSpinDuration() + this.randomInt(2, 4) * idleFrameMs,
    }[target] ?? (PixelPetCard.TRANSITION_HOLD_TICKS.loaf_to_walk.reduce((total, ticks) => total + Math.max(1, ticks) * idleFrameMs, 0));
    this.poseTest = {
      target,
      sequence,
      requested,
      x: Math.round(current.x),
      facing: current.facing,
      pivotX: target === "turn" ? this.getTurnPivotX(current, this.getLayout()) : null,
      duration: transitionMs + holdMs,
    };
    this.updatePoseTestButtons();
    this.update();
  }

  getPoseTestState(now, layout) {
    let elapsed = Math.max(0, now - this.startedAt);
    for (const routine of this.poseTest.sequence) {
      const duration = this.getRoutineDuration(routine, layout);
      if (elapsed < duration) {
        const routineNow = this.startedAt + elapsed;
        if (routine === "walk_to_sit") return this.getWalkToSit(routineNow, layout, this.poseTest.x, this.poseTest.facing);
        if (routine === "sit_to_walk") return this.getSitToWalkTransitionState(this.poseTest.x, this.poseTest.facing);
        if (routine === "sit_to_loaf") return this.getSitToLoaf(routineNow, layout, this.poseTest.x, this.poseTest.facing);
        if (routine === "loaf_to_walk") return this.getLoafToWalk(routineNow, layout, this.poseTest.x, this.poseTest.facing);
      }
      elapsed -= duration;
    }
    if (this.poseTest.target === "turn") {
      const spinDuration = this.getSpinDuration();
      if (elapsed < spinDuration) return this.getSpinState(elapsed, layout, this.poseTest.pivotX, this.poseTest.facing);
      const standRows = this.getStandPauseState(0, layout, 0, this.poseTest.facing).rows;
      const x = this.poseTest.pivotX - this.getFrameContact(standRows, this.poseTest.facing, "rear")[0] * layout.cell;
      return this.getStandPauseState(elapsed - spinDuration, layout, x, this.poseTest.facing);
    }
    if (this.poseTest.target === "sit") return this.getSitState(elapsed, layout, this.poseTest.x, this.poseTest.facing);
    if (this.poseTest.target === "clean") return this.getCleaningState(elapsed, layout, this.poseTest.x, this.poseTest.facing);
    if (this.poseTest.target === "loaf") return this.getLoafState(elapsed, layout, this.poseTest.x, this.poseTest.facing);
    if (this.poseTest.target === "stand") return this.getStandPauseState(elapsed, layout, this.poseTest.x, this.poseTest.facing);
    if (this.poseTest.target === "look_up") return this.getLookUpState(elapsed, layout, this.poseTest.x, this.poseTest.facing);
    const patrol = this.getPatrol(this.startedAt + elapsed, layout, elapsed, this.poseTest.x);
    return {
      ...patrol,
      rows: patrol.walking
        ? this.getWalkFrame(patrol.frame)
        : this.getStandPauseState(patrol.pauseElapsed, layout, patrol.x, patrol.facing).rows,
    };
  }

  updatePoseTestButtons() {
    this.shadowRoot?.querySelectorAll("[data-pose-test]").forEach((button) => {
      const active = button.dataset.poseTest === "auto"
        ? this.autoEnabled
        : this.poseTest && button.dataset.poseTest === this.poseTest.requested;
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  updateDebugControls() {
    const catButton = this.shadowRoot?.querySelector("[data-debug-action='cat']");
    if (catButton) {
      catButton.setAttribute("aria-pressed", this.debug.showCat ? "true" : "false");
      catButton.textContent = this.debug.showCat ? "Hide cat" : "Show cat";
    }
    const frameButton = this.shadowRoot?.querySelector("[data-debug-action='frame-name']");
    if (frameButton) frameButton.setAttribute("aria-pressed", this.debug.showFrameName ? "true" : "false");
    const clockButton = this.shadowRoot?.querySelector("[data-world-action='clock']");
    if (clockButton) {
      clockButton.setAttribute("aria-pressed", this.clock.paused ? "true" : "false");
      clockButton.textContent = this.clock.paused ? "Play" : "Pause";
    }
    const platformButton = this.shadowRoot?.querySelector("[data-debug-action='platform']");
    if (platformButton) platformButton.setAttribute("aria-pressed", this.debug.showElevatedSurface ? "true" : "false");
    const heightReadout = this.shadowRoot?.querySelector("[data-debug-height]");
    if (heightReadout) heightReadout.textContent = `Height: ${this.getDebugElevatedHeightCells()} cells`;
    const pawButton = this.shadowRoot?.querySelector("[data-debug-action='paws']");
    if (pawButton) pawButton.setAttribute("aria-pressed", this.debug.showPawDebug ? "true" : "false");
    const poiButton = this.shadowRoot?.querySelector("[data-debug-action='pois']");
    if (poiButton) poiButton.setAttribute("aria-pressed", this.debug.showPoiDebug ? "true" : "false");
    const pathButton = this.shadowRoot?.querySelector("[data-debug-action='paths']");
    if (pathButton) pathButton.setAttribute("aria-pressed", this.debug.showPathDebug ? "true" : "false");
    const surfaceButton = this.shadowRoot?.querySelector("[data-debug-action='surfaces']");
    if (surfaceButton) surfaceButton.setAttribute("aria-pressed", this.debug.showSurfaceDebug ? "true" : "false");
    const activityButton = this.shadowRoot?.querySelector("[data-debug-action='activity-log']");
    if (activityButton) activityButton.setAttribute("aria-pressed", this.debug.showActivityLog ? "true" : "false");
    const placementButton = this.shadowRoot?.querySelector("[data-debug-action='place-poi']");
    if (placementButton) {
      placementButton.setAttribute("aria-pressed", this.world.poiPlacementArmed ? "true" : "false");
      placementButton.textContent = this.world.poiPlacementArmed ? "Place POI: on" : "Place POI";
    }
    this.updateWorldActionControls();
  }

  updateWorldActionControls() {
    const feedButton = this.shadowRoot?.querySelector("[data-world-action='feed']");
    if (feedButton) feedButton.setAttribute("aria-pressed", this.world.visit ? "true" : "false");
    const boxButton = this.shadowRoot?.querySelector("[data-world-action='box']");
    if (boxButton) boxButton.textContent = this.world.boxEntry?.phase === "inside" ? "Leave box" : "Box hop";
    const activeBoxId = this.world.boxEntry?.phase === "inside" ? this.world.boxEntry.boxId : null;
    this.shadowRoot?.querySelectorAll("[data-prop-action='box']").forEach((button) => {
      const leaving = button.dataset.propId === activeBoxId;
      button.setAttribute("aria-label", leaving
        ? `Invite cat to leave ${button.dataset.propId}`
        : `Invite cat to jump into ${button.dataset.propId}`);
    });
  }

  getDebugElevationFrameState(layout) {
    const match = String(this.config.debug_elevation_frame || "").trim().match(/^(ascend|descend)-(\d+)$/);
    if (!match) return null;
    const kind = match[1];
    const frame = Number(match[2]) - 1;
    const frameCount = kind === "ascend" ? PixelPetCard.ELEVATE_FRAMES.length : 4;
    if (!Number.isInteger(frame) || frame < 0 || frame >= frameCount) return null;
    // The debug surface is on the right, so ascent crosses its left edge
    // facing right; descent returns through that same edge facing left.
    const edgeDirection = 1;
    const facing = kind === "ascend" ? edgeDirection : -edgeDirection;
    const surface = this.getElevatedSurface(layout, "debug-elevated-surface");
    const edgeX = this.getElevationEdge(surface, edgeDirection);
    const placement = this.getLeapPlacement(kind, frame, edgeX, edgeDirection, facing, surface, layout);
    return {
      rows: placement.rows,
      x: placement.x,
      groundY: placement.groundY,
      facing,
      frame,
      frameName: `audit-${kind}-${frame + 1}`,
      walking: false,
      surfaceId: kind === "ascend" && frame === frameCount - 1 ? surface.id : undefined,
    };
  }

  getSpriteState(now, layout, skipWorldVisit = false) {
    const debugState = this.getDebugElevationFrameState(layout);
    if (debugState) return debugState;
    if (this.world.robotBoarding) {
      const boarding = this.getRobotBoardingState(now, layout);
      if (boarding) return boarding;
    }
    if (this.world.boxEntry) return this.getBoxEntryState(now, layout);
    if (!skipWorldVisit && this.world.visit) return this.getFoodVisitState(now, layout);
    if (!skipWorldVisit && this.world.glassVisit) return this.getGlassVisitState(now, layout);
    if (this.world.surfaceTravel) {
      const travel = this.world.surfaceTravel;
      const elapsed = Math.max(0, now - travel.startedAt);
      if (elapsed < travel.plan.duration) return this.getPoiTravelState(travel.plan, elapsed, layout);
      const destinationSurfaceId = travel.plan.destinationSurfaceId;
      const settled = this.getPoiTravelState(travel.plan, travel.plan.duration, layout);
      this.world.surfaceTravel = null;
      this.manualState = { x: Math.round(travel.plan.destinationX), facing: settled.facing || 1, surfaceId: destinationSurfaceId };
      this.autoState = {
        x: Math.round(travel.plan.destinationX), facing: settled.facing || 1, pose: "stand",
        surfaceId: destinationSurfaceId, surfaceActivities: 0, activity: null, initial: false,
      };
      this.startedAt = now;
      return travel.returnToAuto ? this.getAutoState(now, layout) : this.getManualState(layout);
    }
    if (this.world.elevated) {
      // Travel and leap clips own the cat until it has reached a stable
      // surface. Once settled, ordinary pose controls remain available; they
      // simply inherit that surface as their ground reference.
      if (this.world.elevated.phase !== "elevated" || !this.poseTest) return this.getElevationState(now, layout);
      const state = this.getPoseTestState(now, layout);
      const surface = this.getElevatedSurface(layout, this.world.elevated.surfaceId);
      return {
        ...state,
        // Stable poses retain their authored x.  Surface-safe positions are
        // selected by travel planning, not forced during rendering.
        x: state.x,
        groundY: this.getGroundYForSupport(state.rows, surface.topY, state.facing, layout),
      };
    }
    if (this.poseTest) {
      if (now - this.startedAt >= this.poseTest.duration) {
        const finished = this.getPoseTestState(now, layout);
        const surfaceId = this.autoState?.surfaceId || null;
        this.poseTest = null;
        this.startedAt = now;
        this.manualState = { x: Math.round(finished.x), facing: finished.facing, surfaceId };
        this.autoState = {
          x: Math.round(finished.x),
          facing: finished.facing,
          pose: "stand",
          surfaceId,
          surfaceActivities: 0,
          activity: null,
          initial: false,
        };
        this.updatePoseTestButtons();
        return this.autoEnabled ? this.getAutoState(now, layout) : this.getManualState(layout);
      }
      const state = this.getPoseTestState(now, layout);
      const surfaceId = this.autoState?.surfaceId;
      if (!surfaceId) return state;
      const surface = this.getElevatedSurface(layout, surfaceId);
      return {
        ...state,
        groundY: this.getGroundYForSupport(state.rows, surface.topY, state.facing, layout),
      };
    }
    const requestedPose = String(this.config.pose || "auto");
    if (requestedPose === "stand_pause") return this.getStandPauseState(now - this.startedAt, layout);
    if (requestedPose === "look_up") return this.getLookUpState(now - this.startedAt, layout);
    // YAML `pose: turn` loops the debug-only full spin for Lab captures. The
    // on-card Turn control remains finite and resolves back to its original facing.
    if (requestedPose === "turn") return this.getSpinState((now - this.startedAt) % this.getSpinDuration(), layout, Math.round(layout.width / 2), 1);
    if (requestedPose === "sit") return this.getSitState(now - this.startedAt, layout);
    if (requestedPose === "loaf") return this.getLoafState(now - this.startedAt, layout);
    if (requestedPose !== "auto") {
      return { rows: this.getPoseRows(requestedPose), x: (layout.width - layout.spriteWidth) / 2, facing: 1, frame: 0, walking: false };
    }
    if (String(this.config.routine || "patrol") === "walk_to_sit") {
      return this.getWalkToSit(now, layout);
    }
    if (String(this.config.routine || "patrol") === "sit_to_loaf") {
      return this.getSitToLoaf(now, layout);
    }
    if (String(this.config.routine || "patrol") === "loaf_to_walk") {
      return this.getLoafToWalk(now, layout);
    }
    // Auto is the world planner.  With it paused, an explicit trigger may
    // still finish, but the cat remains where that trigger left it rather
    // than immediately choosing another activity.
    if (!this.autoEnabled) return this.getManualState(layout);
    const state = this.getAutoState(now, layout);
    if (this.autoState?.activity?.type === "poi") return state;
    const surfaceId = this.autoState?.surfaceId;
    if (!surfaceId) return state;
    const surface = this.getElevatedSurface(layout, surfaceId);
    return {
      ...state,
      x: state.x,
      groundY: this.getGroundYForSupport(state.rows, surface.topY, state.facing, layout),
    };
  }

  getEntityBackdrop() {
    const entityId = String(this.config.entity || "");
    const entity = entityId ? this._hass?.states?.[entityId] : null;
    const unit = String(entity?.attributes?.unit_of_measurement || "").replace(/^Â/, "");
    const value = String(this.config.backdrop_value || entity?.state || "21.4");
    const label = String(
      this.config.backdrop_label || entity?.attributes?.friendly_name || "Temperature"
    );
    return {
      value: `${value}${unit}`.toUpperCase(),
      label: label.toUpperCase(),
    };
  }

  getBackdropEntries() {
    const configured = Array.isArray(this.config.entities) ? this.config.entities : [];
    const entries = configured
      .map((entry) => typeof entry === "string" ? { entity: entry } : entry)
      .filter((entry) => entry && entry.entity);
    if (entries.length) return entries;
    return this.config.entity ? [{
      entity: this.config.entity,
      value: this.config.backdrop_value,
      label: this.config.backdrop_label,
      value_format: this.config.backdrop_value_format,
      unit_style: this.config.backdrop_unit_style,
      color: this.config.backdrop_color,
    }] : [];
  }

  getFormattedEntityBackdrop(entry = {}) {
    const entityId = String(entry.entity || this.config.entity || "");
    const entity = entityId ? this._hass?.states?.[entityId] : null;
    const rawUnit = String(entity?.attributes?.unit_of_measurement || "");
    const unit = rawUnit.charCodeAt(0) === 194 ? rawUnit.slice(1) : rawUnit;
    const rawValue = String(entry.value || this.config.backdrop_value || entity?.state || "21.4");
    const deviceClass = String(entity?.attributes?.device_class || "");
    const format = String(entry.value_format || this.config.backdrop_value_format || "auto");
    const numericValue = Number(rawValue);
    const isTemperature = deviceClass === "temperature" || /^[°][CF]$/i.test(unit);
    let value = rawValue;
    if (Number.isFinite(numericValue) && format !== "raw") {
      if (format === "whole" || (format === "auto" && (isTemperature || Math.abs(numericValue) >= 10))) {
        value = String(Math.round(numericValue));
      } else if (format === "significant_2" || format === "auto") {
        value = String(Number(numericValue.toPrecision(2)));
      }
    }
    const unitStyle = String(entry.unit_style || this.config.backdrop_unit_style || "auto");
    const displayUnit = unitStyle === "hidden"
      ? ""
      : unitStyle === "auto" && isTemperature
        ? String.fromCharCode(176)
        : unit;
    const label = String(
      entry.label || this.config.backdrop_label || entity?.attributes?.friendly_name || "Temperature"
    );
    return {
      value: value.toUpperCase(),
      unit: displayUnit.toUpperCase(),
      label: label.toUpperCase(),
    };
  }

  getBitmapText(text, maxCharacters) {
    const degreeGlyph = [".##..", "#..#.", "#..#.", ".##..", ".....", ".....", "....."];
    const glyphs = [...String(text || "").toUpperCase().slice(0, maxCharacters)]
      .map((character) => character.charCodeAt(0) === 176
        ? degreeGlyph
        : PixelPetCard.PIXEL_FONT[character] || PixelPetCard.PIXEL_FONT["?"]);
    const cells = [];
    let cursor = 0;
    glyphs.forEach((glyph, glyphIndex) => {
      glyph.forEach((row, y) => [...row].forEach((value, x) => {
        if (value === "#") cells.push([cursor + x, y]);
      }));
      cursor += glyph[0].length + (glyphIndex < glyphs.length - 1 ? 1 : 0);
    });
    return {
      cells,
      width: Math.max(0, cursor),
      height: glyphs.reduce((height, glyph) => Math.max(height, glyph.length), 0),
    };
  }

  renderBitmapText(bitmap, x, y, unit, fill, opacity = 1) {
    const startX = x - (bitmap.width * unit) / 2;
    return `<g fill="${fill}" opacity="${opacity}" shape-rendering="crispEdges">${bitmap.cells.map(([px, py]) => `<rect x="${startX + px * unit}" y="${y + py * unit}" width="${unit}" height="${unit}" />`).join("")}</g>`;
  }

  renderEntityBackdrop(layout, entry, translateX = 0, opacity = 1) {
    const { value, unit: valueUnit, label } = this.getFormattedEntityBackdrop(entry);
    const unit = layout.backdropUnit;
    const gridSize = String(this.config.backdrop_resolution || "double") === "same" ? 24 : 48;
    const fieldSize = gridSize * unit;
    const fieldX = (layout.width - fieldSize) / 2;
    const fieldY = layout.floorY - fieldSize;
    const valueBitmap = this.getBitmapText(value, 7);
    const unitBitmap = this.getBitmapText(valueUnit, 4);
    const labelBitmap = this.getBitmapText(label, 24);
    // Values deliberately occupy the larger field. The entity name is a
    // supporting caption, closer to the concept art than a second headline.
    const labelUnit = Math.max(2, unit * 0.58);
    const unitStyle = String(entry.unit_style || this.config.backdrop_unit_style || "auto");
    const compactUnit = unitStyle === "compact"
      || (unitStyle === "auto"
        && (valueUnit === "%" || valueUnit.charCodeAt(0) === 176));
    const unitScale = compactUnit ? 0.58 : 1;
    const gap = unitBitmap.width ? unit * 1.15 : 0;
    const widestValueUnit = valueBitmap.width + (unitBitmap.width ? unitBitmap.width * unitScale + 1.15 : 0);
    // The state is the primary backdrop element: render it at twice its
    // previous scale and anchor its bottom row directly on the world floor.
    // The cat can then naturally obscure it as it walks past.
    const headlineUnit = Math.min(unit * 3.3, (fieldSize * 1.8) / Math.max(1, widestValueUnit));
    const unitUnit = headlineUnit * unitScale;
    const headlineWidth = valueBitmap.width * headlineUnit + (unitBitmap.width ? gap + unitBitmap.width * unitUnit : 0);
    const headlineStart = layout.width / 2 - headlineWidth / 2;
    const headlineY = layout.floorY - valueBitmap.height * headlineUnit;
    const grid = this.bool(this.config.show_backdrop_grid)
      ? `<g fill="none" stroke="#8f7b55" stroke-width="0.35" opacity="0.28">${Array.from({ length: gridSize + 1 }, (_, index) => `<line x1="${fieldX + index * unit}" y1="${fieldY}" x2="${fieldX + index * unit}" y2="${fieldY + fieldSize}"/><line x1="${fieldX}" y1="${fieldY + index * unit}" x2="${fieldX + fieldSize}" y2="${fieldY + index * unit}"/>`).join("")}</g>`
      : "";
    const color = entry.color || this.config.backdrop_color;
    return `<g class="pixel-entity-backdrop" transform="translate(${translateX} 0)" opacity="${opacity}">${grid}${this.renderBitmapText(valueBitmap, headlineStart + valueBitmap.width * headlineUnit / 2, headlineY, headlineUnit, color, Number(this.config.backdrop_opacity) || 0.78)}${unitBitmap.width ? this.renderBitmapText(unitBitmap, headlineStart + valueBitmap.width * headlineUnit + gap + unitBitmap.width * unitUnit / 2, headlineY, unitUnit, color, Number(this.config.backdrop_opacity) || 0.78) : ""}${this.renderBitmapText(labelBitmap, layout.width / 2, layout.floorY + labelUnit, labelUnit, this.config.backdrop_label_color, 0.88)}</g>`;
  }

  renderEntityBackdrops(layout, now) {
    if (!this.bool(this.config.show_entity_backdrop)) return "";
    const entries = this.getBackdropEntries();
    if (!entries.length) return "";
    if (entries.length === 1) return this.renderEntityBackdrop(layout, entries[0]);
    const holdMs = Math.max(500, Number(this.config.entity_display_ms) || 3600);
    const slideMs = Math.max(400, Number(this.config.entity_slide_ms) || 1000);
    const cycleMs = holdMs + slideMs;
    const elapsed = Math.max(0, now - this.startedAt);
    const cycle = Math.floor(elapsed / cycleMs);
    const activeIndex = cycle % entries.length;
    const phase = elapsed % cycleMs;
    if (phase < holdMs) return this.renderEntityBackdrop(layout, entries[activeIndex]);
    // Four authored-looking beats: shift one cat pixel and fade a quarter per
    // beat. Nothing eases or moves between cells.
    const step = Math.min(4, Math.floor((phase - holdMs) / (slideMs / 4)) + 1);
    const progress = step / 4;
    const nextIndex = (activeIndex + 1) % entries.length;
    return `<g clip-path="inset(0 0 0 0)">${this.renderEntityBackdrop(layout, entries[activeIndex], -layout.cell * step, 1 - progress)}${this.renderEntityBackdrop(layout, entries[nextIndex], layout.cell * (4 - step), progress)}</g>`;
  }

  renderProps(layout, predicate = () => true) {
    return this.getWorldProps(layout).filter(predicate).map((prop) => {
      if (prop.type === "cardboard_box" && this.world.boxEntry?.foreground) return "";
      const blocks = prop.art.rows.flatMap((row, y) => [...row].map((token, x) => {
        const fill = prop.art.palette[token];
        return fill ? `<rect x="${prop.x + x * layout.cell}" y="${prop.y + y * layout.cell}" width="${layout.cell}" height="${layout.cell}" fill="${fill}"/>` : "";
      })).join("");
      const clockHands = prop.type === "clock"
        ? this._getClockHandCells().map(([x, y]) => `<rect x="${prop.x + x * layout.cell}" y="${prop.y + y * layout.cell}" width="${layout.cell}" height="${layout.cell}" fill="${prop.art.palette.A}"/>`).join("")
        : "";
      const label = prop.label || prop.type;
      return `<g class="pixel-prop" shape-rendering="crispEdges"><title>${label}</title>${blocks}${clockHands}</g>`;
    }).join("");
  }

  renderForegroundProps(layout) {
    if (!this.world.boxEntry?.foreground) return "";
    const prop = this.getWorldProps(layout).find((candidate) => candidate.id === this.world.boxEntry.boxId);
    if (!prop) return "";
    const blocks = prop.art.rows.flatMap((row, y) => [...row].map((token, x) => {
      const fill = prop.art.palette[token];
      return fill ? `<rect x="${prop.x + x * layout.cell}" y="${prop.y + y * layout.cell}" width="${layout.cell}" height="${layout.cell}" fill="${fill}"/>` : "";
    })).join("");
    return `<g class="pixel-prop pixel-prop-foreground" shape-rendering="crispEdges"><title>${this.escape(prop.label || prop.type)}</title>${blocks}</g>`;
  }

  renderPropControls(layout) {
    return this.getWorldProps(layout).map((prop) => {
      const width = prop.art.width * layout.cell;
      const height = prop.art.height * layout.cell;
      const action = prop.type === "food_bowl"
        ? "feed"
        : prop.type === "water_glass"
          ? "drink"
        : prop.type === "cardboard_box"
          ? "box"
          : prop.type === "robot_vacuum"
            ? "robot"
          : prop.type === "sofa_half"
            ? "surface"
            : "prop";
      const leavingBox = prop.type === "cardboard_box"
        && this.world.boxEntry?.phase === "inside"
        && this.world.boxEntry.boxId === prop.id;
      const label = prop.type === "food_bowl"
        ? `Invite cat to eat at ${prop.id}`
        : prop.type === "water_glass"
          ? `Invite cat to drink from ${prop.id}`
        : prop.type === "cardboard_box"
          ? (leavingBox ? `Invite cat to leave ${prop.id}` : `Invite cat to jump into ${prop.id}`)
          : prop.type === "sofa_half"
            ? `Invite cat to visit the ${prop.label}`
          : prop.type === "robot_vacuum"
              ? (this.world.robotVacuum?.propId === prop.id
                ? `Send ${prop.label} out of the room`
                : `Start ${prop.label} route`)
            : `Invite cat to inspect ${prop.label}`;
      return `<button class="prop-hit-target" type="button" data-prop-id="${this.escape(prop.id)}" data-prop-action="${action}" aria-label="${this.escape(label)}" style="left:${(prop.x / layout.width) * 100}%;top:${(prop.y / layout.height) * 100}%;width:${(width / layout.width) * 100}%;height:${(height / layout.height) * 100}%"></button>`;
    }).join("");
  }

  renderPoiDebug(layout) {
    const showPois = this.debug.showPoiDebug;
    const showPaths = this.debug.showPathDebug;
    if (!showPois && !showPaths) return "";
    const food = this.getPoiSlots(layout).map((slot) => {
      const fill = slot.reservedBy ? "#ef5350" : slot.reachable ? "#39a96b" : "#9aa0a6";
      const opacity = slot.reachable ? 0.78 : 0.32;
      return `<g opacity="${opacity}"><rect x="${slot.x}" y="${layout.floorY - layout.cell}" width="${layout.cell}" height="${layout.cell}" fill="${fill}"/><title>${this.escape(slot.id)}${slot.reservedBy ? ` (${this.escape(slot.reservedBy)})` : ""}</title></g>`;
    }).join("");
    const statusColor = { active: "#31b8ff", reserved: "#ef5350", cooldown: "#7d8790" };
    const markers = [...this.world.pois.values()].map((poi) => {
      const surface = this.getPoiSurface(layout, poi);
      const x = this.getPoiDisplayX(poi, layout);
      const y = (surface?.topY || layout.floorY) - layout.cell;
      const fill = poi.source === "user" && poi.status === "active" ? "#f0b429" : (statusColor[poi.status] || "#31b8ff");
      const label = `${poi.id} · ${poi.surfaceId || "floor"} · ${poi.status}`;
      return `<g opacity="${poi.status === "cooldown" ? 0.46 : 0.92}"><path d="M ${x} ${y + layout.cell} L ${x - layout.cell / 2} ${y + layout.cell / 2} L ${x} ${y} L ${x + layout.cell / 2} ${y + layout.cell / 2} Z" fill="${fill}"/><text x="${x}" y="${y - 4}" text-anchor="middle" fill="${fill}" font-size="9" font-family="monospace">${this.escape(label)}</text></g>`;
    }).join("");
    const plan = this.autoState?.activity?.type === "poi" ? this.autoState.activity.plan : null;
    const route = plan?.debugPoints?.slice(0, -1).map((point, index) => {
      const next = plan.debugPoints[index + 1];
      const pointSurface = point.surfaceId ? this.getElevatedSurface(layout, point.surfaceId) : null;
      const nextSurface = next.surfaceId ? this.getElevatedSurface(layout, next.surfaceId) : null;
      const y1 = (pointSurface?.topY || layout.floorY) - layout.cell * 0.65;
      const y2 = (nextSurface?.topY || layout.floorY) - layout.cell * 0.65;
      return `<path d="M ${point.x + layout.spriteWidth / 2} ${y1} L ${next.x + layout.spriteWidth / 2} ${y2}" stroke="#f0b429" stroke-width="1.5" stroke-dasharray="4 3" fill="none" opacity="0.72"/>`;
    }).join("") || "";
    return `${showPaths ? route : ""}${showPois ? `${food}${markers}` : ""}`;
  }

  renderSurfaceDebug(layout, surfaces, verticalSurfaces = []) {
    if (!this.shouldRenderSurfaceDebug()) return "";
    const horizontal = surfaces.map((surface) => {
      const type = surface.type || "platform";
      const supports = Array.isArray(surface.supports) ? surface.supports.join("/") : "walk/sit";
      const motion = surface.moving ? ` · moving ${surface.motion?.phase || ""}` : "";
      const label = `${surface.id} · ${type} · ${supports}${motion}`;
      const labelY = Math.max(12, surface.topY - 5);
      const labelWidth = Math.min(layout.width - 4, Math.max(120, label.length * 4.8));
      const labelX = Math.max(2, Math.min(surface.x, layout.width - labelWidth));
      const marker = surface.moving ? "#4dd9e8" : "#f6d365";
      return `<rect x="${surface.x}" y="${surface.topY - 2}" width="${surface.width}" height="4" fill="${marker}" opacity="0.95" shape-rendering="crispEdges"/>
        <rect x="${surface.x}" y="${surface.topY - 4}" width="${surface.width}" height="8" fill="none" stroke="#1f2937" stroke-width="1" stroke-dasharray="3 2" shape-rendering="crispEdges"/>
        <text x="${labelX}" y="${labelY}" fill="#1f2937" font-size="8" font-family="monospace" font-weight="700" paint-order="stroke" stroke="#ffffff" stroke-width="2">${this.escape(label)}</text>`;
    }).join("");
    const vertical = verticalSurfaces.map((surface) => {
      const label = `${surface.id} · ${surface.type}`;
      return `<line x1="${surface.x}" y1="${surface.topY}" x2="${surface.x}" y2="${surface.bottomY}" stroke="#ff7a59" stroke-width="2" stroke-dasharray="3 2"/>
        <text x="${Math.max(2, surface.x + 3)}" y="${Math.max(12, surface.topY - 5)}" fill="#9a3412" font-size="8" font-family="monospace" font-weight="700" paint-order="stroke" stroke="#ffffff" stroke-width="2">${this.escape(label)}</text>`;
    }).join("");
    return `<g class="surface-debug" pointer-events="none">${horizontal}${vertical}</g>`;
  }

  isRobotBehindSofa(layout, now) {
    const robot = this.world.robotVacuum;
    if (!robot || (Number(robot.passIndex) || 0) % 2 === 0) return false;
    const render = this.getRobotVacuumRenderState(robot.propId, layout, now);
    if (!render.velocityX) return false;
    const robotLeft = render.x;
    const robotRight = render.x + render.art.width * layout.cell;
    return this.getWorldProps(layout)
      .filter((prop) => prop.type === "sofa_half")
      .some((sofa) => robotRight > sofa.x && robotLeft < sofa.x + sofa.art.width * layout.cell);
  }

  renderSprite(state, layout) {
    const { cells, paws, tokens } = this.getCells(state.rows);
    const cell = layout.cell;
    const x = Math.round(state.x);
    const y = (state.groundY ?? layout.floorY) - cell * 24;
    const fill = this.config.color;
    const pawDebug = this.debug.showPawDebug;
    const pawColours = { R: "#ef5350", F: "#ef5350", B: "#f6ad55" };
    const authoredColours = { M: "#473b78", T: "#eb564b" };
    const blocks = cells
      .map(([px, py]) => {
        const marker = paws.get(`${px},${py}`);
        const token = tokens.get(`${px},${py}`);
        const cellFill = pawDebug && marker ? pawColours[marker] : (authoredColours[token] || fill);
        return `<rect x="${px * cell}" y="${py * cell}" width="${cell}" height="${cell}" fill="${cellFill}" />`;
      })
      .join("");
    const grid = this.bool(this.config.show_grid)
      ? Array.from({ length: 25 }, (_, index) => `<line x1="${index * cell}" y1="0" x2="${index * cell}" y2="${24 * cell}" /><line x1="0" y1="${index * cell}" x2="${24 * cell}" y2="${index * cell}" />`).join("")
      : "";
    const flip = state.facing < 0 ? `translate(${24 * cell} 0) scale(-1 1)` : "";
    return `<g transform="translate(${x} ${y})"><g transform="${flip}" shape-rendering="crispEdges">${blocks}<g class="pixel-grid">${grid}</g></g></g>`;
  }

  getFrameName(state) {
    if (state.frameName) return state.frameName;
    if (state.walking) return `walk-${(state.frame % PixelPetCard.WALK_FRAMES.length) + 1}`;
    if (PixelPetCard.TRANSITIONS.walk_to_sit.includes(state.rows)) return "walk-sit bridge";
    if (PixelPetCard.TRANSITIONS.sit_to_loaf.includes(state.rows)) return "sit-loaf bridge";
    if (PixelPetCard.TRANSITIONS.loaf_to_walk.includes(state.rows)) return "stretch";
    if (PixelPetCard.EAT_IDLE_FRAMES.flat().includes(state.rows)) {
      return state.rows === PixelPetCard.EAT_IDLE_FRAMES[1][1] ? "eat bridge" : "eat";
    }
    const cleaningFrame = PixelPetCard.CLEANING_FRAMES.indexOf(state.rows);
    if (cleaningFrame >= 0) return `clean-${cleaningFrame + 1}`;
    const loafFrame = PixelPetCard.LOAF_IDLE_FRAMES.indexOf(state.rows);
    if (loafFrame >= 0) return loafFrame === 0 ? "loaf-catnap" : "loaf-alert";
    const sitting = PixelPetCard.SIT_IDLE_FRAMES.some((bodyFrames) => bodyFrames.includes(state.rows));
    if (sitting) return "sit";
    return "stand-pause";
  }

  renderFrameName(state, layout) {
    if (!this.debug.showFrameName) return "";
    const x = Math.round(state.x + layout.spriteWidth / 2);
    const y = (state.groundY ?? layout.floorY) + Math.max(12, layout.cell * 1.7);
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="var(--secondary-text-color)" font-family="monospace" font-size="11">${this.escape(this.getFrameName(state))}</text>`;
  }

  renderActivityLog(layout) {
    if (!this.debug.showActivityLog) return "";
    const lines = this.world.activityLog.slice(-12);
    const kindColor = { frame: "#607d8b", poi: "#1a9c63", warn: "#d65a4a" };
    const x = layout.cell;
    const y = layout.cell * 2.1;
    const lineHeight = 10;
    const formatTime = (milliseconds) => {
      const seconds = Math.max(0, milliseconds) / 1000;
      return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${seconds.toFixed(1).padStart(4, "0")}`;
    };
    const text = lines.map((entry, index) => {
      const color = kindColor[entry.kind] || "#607d8b";
      return `<text x="${x}" y="${y + index * lineHeight}" fill="${color}" font-size="8" font-family="monospace" opacity="0.78">${this.escape(`${formatTime(entry.at)} ${entry.kind.toUpperCase()} ${entry.message}`)}</text>`;
    }).join("");
    return `<g class="activity-log"><rect x="${x - 3}" y="${y - 9}" width="${Math.min(layout.width * 0.46, 320)}" height="${Math.max(18, lines.length * lineHeight + 9)}" rx="2" fill="var(--card-background-color, #fff)" opacity="0.68"/>${text}</g>`;
  }

  render() {
    if (!this.isConnected) return;
    const height = this.getCardHeight();
    const layout = this.getLayout();
    this.shadowRoot.innerHTML = `
      <ha-card>
        ${this.config.title ? `<div class="title">${this.escape(this.config.title)}</div>` : ""}
        <div class="stage-wrap">
          <svg id="stage" viewBox="0 0 1 ${height}" preserveAspectRatio="none" role="img" aria-label="Pixel art cat"></svg>
          <div id="prop-controls" aria-label="World props">${this.renderPropControls(layout)}</div>
          <button id="view-toggle" class="view-toggle" type="button" aria-pressed="${this.getViewMode() === "cat_focus"}">${this.getViewMode() === "cat_focus" ? "World view" : "Cat focus"}</button>
        </div>
        ${this.showControls() ? `<div class="pose-test-controls" aria-label="Pet controls">
          <div class="control-group control-auto" aria-label="Auto behaviour">
            <button type="button" data-pose-test="auto" aria-pressed="${this.autoEnabled}">Auto</button>
            <button type="button" data-control-menu="poses" aria-expanded="${this.controlMenu === "poses"}">Poses</button>
            <button type="button" data-control-menu="world" aria-expanded="${this.controlMenu === "world"}">World</button>
            <button type="button" data-control-menu="props" aria-expanded="${this.controlMenu === "props"}">Props</button>
            <button type="button" data-control-menu="debug" aria-expanded="${this.controlMenu === "debug"}">Debug</button>
          </div>
          <div class="control-group control-poses" aria-label="Pose triggers" ${this.controlMenu === "poses" ? "" : "hidden"}>
            <span class="control-label">Pose</span>
            <button type="button" data-pose-test="walk">Walk</button>
            <button type="button" data-pose-test="stand">Stand</button>
            <button type="button" data-pose-test="look_up">Look up</button>
            <button type="button" data-pose-test="sit">Sit</button>
            <button type="button" data-pose-test="loaf">Loaf</button>
            <button type="button" data-pose-test="stretch">Stretch</button>
            <button type="button" data-pose-test="clean">Clean</button>
          </div>
          <div class="control-group control-actions" aria-label="World actions" ${this.controlMenu === "world" ? "" : "hidden"}>
            <span class="control-label">World</span>
            <button type="button" data-world-action="feed" aria-pressed="false">Feed</button>
            <button type="button" data-world-action="elevate">Elevate</button>
            <button type="button" data-world-action="sofa-top">Sofa top</button>
            <button type="button" data-world-action="descend">Descend</button>
            <button type="button" data-world-action="box">${this.world.boxEntry?.phase === "inside" ? "Leave box" : "Box hop"}</button>
          </div>
          <div class="control-group control-props-menu" aria-label="Scene prop controls" ${this.controlMenu === "props" ? "" : "hidden"}>
            <span class="control-label">Scene props</span>
            ${this.getPropToggleTypes().map((type) => {
              const definition = PixelPetCard.PROP_DEFINITIONS[type];
              const enabled = this.isPropTypeEnabled(type);
              const label = type === "sofa_half" ? "Sofa" : definition.label;
              return `<button type="button" class="prop-toggle ${enabled ? "is-present" : "is-absent"}" data-prop-toggle="${type}" aria-pressed="${enabled}" title="${enabled ? "Remove" : "Add"} ${this.escape(label)}">${this.escape(label)}</button>`;
            }).join("")}
          </div>
          <div class="control-group control-debug" aria-label="Debug controls" ${this.controlMenu === "debug" ? "" : "hidden"}>
            <span class="control-label">Debug</span>
          <button type="button" data-pose-test="turn">Turn 360</button>
          <button type="button" data-debug-action="cat" aria-pressed="true">Hide cat</button>
          <button type="button" data-debug-action="frame-name" aria-pressed="false">Frame name</button>
          <button type="button" data-world-action="clock" aria-pressed="false">Pause</button>
          <button type="button" data-world-action="previous">Previous frame</button>
          <button type="button" data-world-action="next">Next frame</button>
          <button type="button" data-debug-action="platform" aria-pressed="true">Platform</button>
          <button type="button" data-debug-action="paws" aria-pressed="false">Paw colours</button>
          <button type="button" data-debug-action="pois" aria-pressed="false">POIs</button>
          <button type="button" data-debug-action="paths" aria-pressed="false">Pathing</button>
          <button type="button" data-debug-action="surfaces" aria-pressed="false">Surfaces</button>
          <button type="button" data-debug-action="activity-log" aria-pressed="false">Activity log</button>
          <button type="button" data-world-action="platform-down">Height −</button>
          <button type="button" data-world-action="platform-up">Height +</button>
          <output class="debug-height" data-debug-height>Height: ${this.getDebugElevatedHeightCells()} cells</output>
          <button type="button" data-debug-action="place-poi" aria-pressed="false">Place POI</button>
          </div>
        </div>` : ""}
      </ha-card>
      <style>
        :host { display: block; }
        ha-card { display: block; overflow: hidden; padding: 0; }
        .title { padding: 12px 14px 0; color: var(--primary-text-color); font-size: 16px; font-weight: 600; }
        .stage-wrap { position: relative; }
        svg { display: block; width: 100%; height: ${height}px; overflow: hidden; }
        .title + .stage-wrap svg { height: ${Math.max(80, height - 32)}px; }
        #prop-controls { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
        .view-toggle { position: absolute; z-index: 3; right: 10px; top: 10px; border: 1px solid var(--divider-color); border-radius: 999px; padding: 4px 8px; background: color-mix(in srgb, var(--card-background-color, #fff) 82%, transparent); color: var(--secondary-text-color); font: 600 11px/1.2 system-ui, sans-serif; cursor: pointer; }
        .view-toggle[aria-pressed="true"] { border-color: color-mix(in srgb, var(--primary-color) 55%, var(--divider-color)); color: var(--primary-color); }
        .prop-hit-target { position: absolute; display: block; margin: 0; padding: 0; border: 0; border-radius: 0; background: transparent; cursor: pointer; pointer-events: auto; }
        .prop-hit-target:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
        .pixel-grid { fill: none; stroke: #607d8b; stroke-width: 0.45; opacity: 0.5; }
        .pixel-prop { cursor: pointer; }
        .pose-test-controls { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 12px 12px; border-top: 1px solid var(--divider-color); }
        .control-group { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding-left: 8px; border-left: 1px solid var(--divider-color); }
        .control-group[hidden] { display: none; }
        .control-group:first-child { padding-left: 0; border-left: 0; }
        .control-auto { flex-basis: 100%; }
        .control-auto [data-control-menu][aria-expanded="true"] { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 14%, transparent); }
        .control-label { color: var(--secondary-text-color); font-size: 10px; font-weight: 650; letter-spacing: .05em; text-transform: uppercase; }
        .pose-test-controls button { appearance: none; border: 1px solid var(--divider-color); border-radius: 8px; padding: 5px 9px; background: var(--card-background-color, transparent); color: var(--primary-text-color); font: inherit; font-size: 12px; cursor: pointer; }
        .pose-test-controls button[aria-pressed="true"] { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 14%, transparent); }
        .control-auto [data-pose-test="auto"] { border-color: color-mix(in srgb, var(--primary-color) 62%, var(--divider-color)); background: color-mix(in srgb, var(--primary-color) 13%, var(--card-background-color, transparent)); color: var(--primary-color); font-weight: 700; }
        .control-auto [data-pose-test="auto"][aria-pressed="false"] { border-color: var(--divider-color); background: color-mix(in srgb, var(--secondary-text-color) 7%, var(--card-background-color, transparent)); color: var(--secondary-text-color); }
        .control-poses button { background: color-mix(in srgb, var(--primary-text-color) 4%, var(--card-background-color, transparent)); }
        .control-actions button { background: color-mix(in srgb, var(--primary-color) 7%, var(--card-background-color, transparent)); }
        .control-props-menu { flex-basis: 100%; }
        .control-props-menu .prop-toggle.is-present { background: #fff; border-color: color-mix(in srgb, var(--primary-color) 35%, var(--divider-color)); color: var(--primary-text-color); }
        .control-props-menu .prop-toggle.is-absent { background: color-mix(in srgb, var(--secondary-text-color) 13%, var(--card-background-color, #fff)); border-color: color-mix(in srgb, var(--secondary-text-color) 22%, var(--divider-color)); color: color-mix(in srgb, var(--secondary-text-color) 72%, transparent); }
        .control-debug button { background: color-mix(in srgb, var(--secondary-text-color) 7%, var(--card-background-color, transparent)); color: var(--secondary-text-color); }
        .debug-height { color: var(--secondary-text-color); font: 11px/1.2 monospace; white-space: nowrap; }
      </style>
    `;
    this.shadowRoot.querySelectorAll("[data-pose-test]").forEach((button) => {
      button.addEventListener("click", () => this.startPoseTest(button.dataset.poseTest));
    });
    this.shadowRoot.querySelector("#view-toggle")?.addEventListener("click", () => this.toggleViewMode());
    this.shadowRoot.querySelectorAll("[data-control-menu]").forEach((button) => {
      button.addEventListener("click", () => {
        const menu = button.dataset.controlMenu;
        this.controlMenu = this.controlMenu === menu ? null : menu;
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll("[data-world-action='feed']").forEach((button) => {
      button.addEventListener("click", () => this.activateFoodPoi());
    });
    this.shadowRoot.querySelector("[data-world-action='elevate']")?.addEventListener("click", () => this.startElevationTest());
    this.shadowRoot.querySelector("[data-world-action='sofa-top']")?.addEventListener("click", () => this.startSurfaceTravelTest("sofa-half-1:back-top", true, "prompt"));
    this.shadowRoot.querySelector("[data-world-action='descend']")?.addEventListener("click", () => this.startDescentTest());
    this.shadowRoot.querySelector("[data-world-action='box']")?.addEventListener("click", () => {
      if (this.world.boxEntry?.phase === "inside") this.startBoxExitTest();
      else this.startBoxEntryTest();
    });
    this.shadowRoot.querySelectorAll("[data-prop-toggle]").forEach((button) => {
      button.addEventListener("click", () => this.togglePropType(button.dataset.propToggle));
    });
    this.shadowRoot.querySelector("[data-debug-action='cat']")?.addEventListener("click", () => { this.debug.showCat = !this.debug.showCat; this.updateDebugControls(); this.update(); });
    this.shadowRoot.querySelector("[data-debug-action='frame-name']")?.addEventListener("click", () => this.toggleFrameName());
    this.shadowRoot.querySelector("[data-world-action='clock']")?.addEventListener("click", () => this.toggleWorldClock());
    this.shadowRoot.querySelector("[data-world-action='previous']")?.addEventListener("click", () => this.stepWorldClock(-1));
    this.shadowRoot.querySelector("[data-world-action='next']")?.addEventListener("click", () => this.stepWorldClock(1));
    this.shadowRoot.querySelector("[data-debug-action='platform']")?.addEventListener("click", () => { this.debug.showElevatedSurface = !this.debug.showElevatedSurface; this.updateDebugControls(); this.update(); });
    this.shadowRoot.querySelector("[data-debug-action='paws']")?.addEventListener("click", () => { this.debug.showPawDebug = !this.debug.showPawDebug; this.updateDebugControls(); this.update(); });
    this.shadowRoot.querySelector("[data-debug-action='pois']")?.addEventListener("click", () => { this.debug.showPoiDebug = !this.debug.showPoiDebug; this.updateDebugControls(); this.update(); });
    this.shadowRoot.querySelector("[data-debug-action='paths']")?.addEventListener("click", () => { this.debug.showPathDebug = !this.debug.showPathDebug; this.updateDebugControls(); this.update(); });
    this.shadowRoot.querySelector("[data-debug-action='surfaces']")?.addEventListener("click", () => { this.debug.showSurfaceDebug = !this.debug.showSurfaceDebug; this.updateDebugControls(); this.update(); });
    this.shadowRoot.querySelector("[data-debug-action='activity-log']")?.addEventListener("click", () => this.toggleActivityLog());
    this.shadowRoot.querySelector("[data-debug-action='place-poi']")?.addEventListener("click", () => {
      this.world.poiPlacementArmed = !this.world.poiPlacementArmed;
      this.updateDebugControls();
    });
    this.shadowRoot.querySelector("[data-world-action='platform-down']")?.addEventListener("click", () => this.adjustElevatedHeight(-1));
    this.shadowRoot.querySelector("[data-world-action='platform-up']")?.addEventListener("click", () => this.adjustElevatedHeight(1));
    this.shadowRoot.querySelector("#prop-controls").addEventListener("click", (event) => {
      const prop = event.target.closest?.("[data-prop-id]");
      if (prop) this.activatePropAction(prop.dataset.propAction, prop.dataset.propId);
    });
    const stage = this.shadowRoot.querySelector("#stage");
    const activateProp = (event) => {
      const prop = event.target.closest?.("[data-prop-id]");
      if (prop) {
        this.activatePropAction(prop.dataset.propAction, prop.dataset.propId);
        return;
      }
      const surface = event.target.closest?.("[data-surface-id]");
      if (surface) {
        this.startSurfaceTravelTest(surface.dataset.surfaceId, true, "prompt");
        return;
      }
      if (this.world.poiPlacementArmed) this.addUserPoiFromPoint(event.clientX, event.clientY);
    };
    stage.addEventListener("click", activateProp);
    stage.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateProp(event);
      }
    });
    this.updatePoseTestButtons();
    this.updateDebugControls();
    this.update();
  }

  update() {
    const stage = this.shadowRoot?.querySelector("#stage");
    if (!stage) return;
    const layout = this.getLayout();
    const floor = this.bool(this.config.show_floor)
      ? `<line x1="0" y1="${layout.floorY}" x2="${layout.width}" y2="${layout.floorY}" stroke="${this.config.floor_color}" stroke-width="2" opacity="${Number(this.config.floor_opacity) || 0}" />`
      : "";
    const now = this.getWorldNow();
    this.ensureDebugRobotVacuum(layout, now);
    this.advanceRobotVacuum(now, layout);
    const state = this.getSpriteState(now, layout);
    stage.setAttribute("viewBox", this.getCameraViewBox(layout, state));
    this.observeWorldState(state, layout, now);
    const surfaces = this.shouldRenderDebugElevatedSurface()
      ? this.getElevatedSurfaces(layout)
      : this.getElevatedSurfaces(layout).filter((surface) => surface.id !== "debug-elevated-surface");
    const verticalSurfaces = this.getVerticalSurfaces(layout);
    const surface = surfaces.map((elevatedSurface) => `<rect data-surface-id="${this.escape(elevatedSurface.id)}" x="${elevatedSurface.x}" y="${elevatedSurface.topY}" width="${elevatedSurface.width}" height="${layout.floorY - elevatedSurface.topY}" fill="${elevatedSurface.color}" shape-rendering="crispEdges"/>`).join("");
    const cat = this.debug.showCat
      ? `${this.renderSprite(state, layout)}${this.renderFrameName(state, layout)}`
      : "";
    const robotBehindSofa = this.isRobotBehindSofa(layout, now);
    const ordinaryProps = this.renderProps(layout, (prop) => prop.type !== "robot_vacuum" && (robotBehindSofa ? prop.type !== "sofa_half" : true));
    const robotProps = this.renderProps(layout, (prop) => prop.type === "robot_vacuum");
    const sofaProps = robotBehindSofa ? this.renderProps(layout, (prop) => prop.type === "sofa_half") : "";
    stage.innerHTML = `${this.renderEntityBackdrops(layout, now)}${floor}${surface}${ordinaryProps}${robotProps}${sofaProps}${this.renderPoiDebug(layout)}${this.renderSurfaceDebug(layout, surfaces, verticalSurfaces)}${this.renderActivityLog(layout)}${cat}${this.renderForegroundProps(layout)}`;
  }

  updateViewToggle() {
    const button = this.shadowRoot?.querySelector("#view-toggle");
    if (!button) return;
    const focus = this.getViewMode() === "cat_focus";
    button.setAttribute("aria-pressed", String(focus));
    button.textContent = focus ? "World view" : "Cat focus";
  }

  escape(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
  }

  // Named static pose arrays. Add a future sitting image here as `sit` after
  // it has been transcribed and checked against its 24x24 source grid.
  static POSES = {
    stand: [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "..##....................",
      "..#.....................",
      "..#.....................",
      "..#.....................",
      "..##.............#.#....",
      "...##............###....",
      "...##...........#####...",
      "....##.######..#######..",
      "....##################..",
      "....#################...",
      "....###############.....",
      "...###############......",
      "...###############......",
      "...######...#####.......",
      "..######.....####.......",
      "..##.##.....###.#.......",
      "..#..##.....##..#.......",
      "..##..##....#...##......",
    ],
  };

  // Supplied standing look-up pose. The head is explicitly tilted toward an
  // elevated point of interest; the two literal variants retain the loose and
  // hooked authored tail positions without procedural body or tail movement.
  static LOOK_UP_FRAMES = [
    // loose tail (supplied reference)
    ["........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..#..........#..#.......","..##.........######.....","...##.........######....","...##.........######....","....##.#####.#######....","....###############.....",".....#############......",".....############.......","....#############.......","....#####.#######.......","....#####...#####.......","....####.....####.......","....###......##.#.......","....###......##.#.......","....R.#R......R.#R......"],
    // hooked tail, keeping the same supplied head/body and paw locations
    ["........................","........................","........................","........................","........................","........................","........................","........................","..##....................","..#..........#..#.......","..#..........######.....","..##..........######....","...##.........######....","....##.#####.#######....","....###############.....",".....#############......",".....############.......","....#############.......","....#####.#######.......","....#####...#####.......","....####.....####.......","....###......##.#.......","....###......##.#.......","....R.#R......R.#R......"],
  ];

  // Walk-to-sit is a named transition clip. More supplied intermediate poses
  // can simply be appended here; the player holds each at one walk-frame beat.
  static TRANSITIONS = {
    walk_to_sit: [
      ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".............#.#........",".............###........","............#####.......","...........#######......","...........#######......","..........#######.......","......##########........",".....###########........","....############........","...#############........","..##.###########........","..##.###########........","...##.#####.###.........","......#R#R..R#R........."],
    ],
    sit_to_loaf: [
      ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".............#.#........","............####........","...........######.......","...........######.......",".........########.......",".......#########........","......##########........","......##########........","......##########..#.....","......#####R###R###....."],
    ],
    loaf_to_walk: [
      ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","...#....................","..###...................",".##.#...................",".#..####................",".#..######...#.#........",".#..#######.####........",".....############.......",".....############.......",".....############.......",".....###########........","....####..######........","....###.....#####.......",".....##......#####......",".....#R........####R...."],
      ["........................","........................","........................","........................","........................","........................","........................","........................","...#....................","..###...................",".##.#...................",".#..#...................",".##.####................","....#####...............","....######..............",".....######.#.#.........",".....##########.........",".....###########........",".....###########........",".....###########........","....####..#####.........","....###....#####........",".....##.....#####.......",".....#R.......####R....."],
      ["........................","........................","........................","........................","........................","........................","...#....................","...#....................","..#.....................","..##....................","...##...................","....#...................","....##..................","....##..................","....####................",".....####....#.#........",".....#####...###........",".....############.......",".....############.......",".....############.......",".....##########.........","......###.######........","......###....####.......","......#R........##R....."],
    ],
  };

  // Per-frame authored holds in units of the shared 250ms idle grid. The
  // stretch peak gets one extra beat so the cat visibly enjoys the stretch.
  static TRANSITION_HOLD_TICKS = {
    loaf_to_walk: [2, 1, 1],
  };

  // [breath state][tail state]. Frame [0][0] and [1][1] are literal
  // transcriptions of the supplied sit poses. The other two combinations use
  // the same body state with the alternate authored tail placement, giving a
  // genuine independent tail wag without moving or deforming pixels.
  static SIT_IDLE_FRAMES = [
    [
      // breath in, tail up (supplied frame 2)
      ["........................","........................","........................","........................","........................","........................","...........#..#.........","...........####.........","..........######........","..........######........","..........######........","..........######........","..........#####.........","..........#####.........",".........######.........","........#######.........","........#######.........",".......########.........",".......########.........",".......########.........",".......########.........",".......########...#.....",".......#########.##.....",".......###R##R#####....."],
      // breath in, tail crooked
      ["........................","........................","........................","........................","........................","........................","...........#..#.........","...........####.........","..........######........","..........######........","..........######........","..........######........","..........#####.........","..........#####.........",".........######.........","........#######.........","........#######.........",".......########.........",".......########.........",".......########.........",".......########.........",".......########..#......",".......#########..#.....",".......###R##R#####....."],
    ],
    [
      // breath out, tail up
      ["........................","........................","........................","........................","........................","........................","........................","...........#..#.........","...........####.........","..........######........","..........######........","..........######........","..........######........","..........#####.........","..........#####.........",".........######.........","........#######.........","........#######.........",".......########.........",".......########.........",".......########.........",".......########...#.....",".......#########.##.....",".......###R##R#####....."],
      // breath out, tail crooked (supplied frame 3)
      ["........................","........................","........................","........................","........................","........................","........................","...........#..#.........","...........####.........","..........######........","..........######........","..........######........","..........######........","..........#####.........","..........#####.........",".........######.........","........#######.........","........#######.........",".......########.........",".......########.........",".......########.........",".......########..#......",".......#########..#.....",".......###R##R#####....."],
    ],
  ];

  // Standing pause: the four supplied frames form an authored 2 x 2 matrix.
  // The first axis is the small head/body shift; the second is tail placement.
  // This player is used only during brief patrol rests or an explicit preview.
  static STAND_PAUSE_FRAMES = [
    [
      // head/body high, tail loose (supplied frame 1)
      ["........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..#.....................","..##.............#.#....","...##............###....","...##...........#####...","....##.#####...#######..","....##################..",".....################...",".....##############.....","....##############......","....#####.#######.......","....#####...#####.......","....####.....####.......","....###......##.#.......","....###......##.#.......","....R.#R......R.#R......"],
      // head/body high, tail hooked (supplied frame 4)
      ["........................","........................","........................","........................","........................","........................","........................","........................","..##....................","..#.....................","..#..............#.#....","..##.............###....","...##...........#####...","....##.#####...#######..","....##################..",".....################...",".....##############.....","....##############......","....#####.#######.......","....#####...#####.......","....####.....####.......","....###......##.#.......","....###......##.#.......","....R.#R......R.#R......"],
    ],
    [
      // head/body low, tail loose (supplied frame 2)
      ["........................","........................","........................","........................","........................","........................","........................","...##...................","...#....................","...#....................","...#....................","...##............#.#....","....##...........###....","....##.#####...######...","....##################..",".....#################..",".....################...","....###############.....","....#####.########......","....#####...#####.......","....####.....####.......","....###......##.#.......","....###......##.#.......","....R.#R......R.#R......"],
      // head/body low, tail hooked (supplied frame 3)
      ["........................","........................","........................","........................","........................","........................","........................","........................","....##..................","...#.#..................","...#....................","...#.............#.#....","....#...........####....","....##.#####...######...","....##################..",".....#################..",".....################...","....###############.....","....#####.########......","....#####...#####.......","....####.....####.......","....###......##.#.......","....###......##.#.......","....R.#R......R.#R......"],
    ],
  ];

  // Loaf's two supplied frames are a low catnap head and a brief alert lift.
  static LOAF_IDLE_FRAMES = [
    ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","...............#.#......",".......#####...###......","......#############.....","......#############.....","......#############.....",".....##############.....",".....######R#####R......"],
    ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","...............#.#......","...............###......",".......#####..#####.....","......#############.....","......#############.....","......#############.....",".....#############......",".....######R#####R......"],
  ];

  // Supplied three-frame sit-and-clean clip. The red guide pixels mark paw
  // contacts in the source art and retain the card's existing paw semantics.
  static CLEANING_FRAMES = [
    ["........................","........................","........................","........................","........................","........................","........................","........................","........................",".............#..........","...........###.#........","..........######........",".........######.........",".........######.........","........#######.........","........#####...........",".......#######R.........",".......########.........",".......#######..........",".......#######..........",".......#######..........",".......########..#......",".......########...#.....",".......######R#####....."],
    ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".............#..........","............##..........","..........######........",".........######.........","........#######.........","........#######.........",".......######.R.........",".......########.........",".......#######..........",".......#######..........",".......#######..........",".......########...#.....",".......#########..#.....",".......######R#####....."],
    ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","..............#.........",".............##.........","...........#####........","..........#######.......",".........#######........","........########........","........#####.R.........",".......########.........",".......#######..........",".......#######..........",".......#######..........",".......########.........",".......#########...#....",".......######R######...."],
  ];

  // Supplied bowl-adjacent frames. Terracotta bowl pixels are intentionally
  // excluded: the prop is rendered separately in world space.
  // Supplied five-beat floor-to-elevated-surface sequence. Green guide pixels
  // are deliberately not part of the cat rows: the debug platform is world art.
  static ELEVATE_FRAMES = [
    PixelPetCard.POSES.stand,
    ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".................#.#....","..##....######...###....",".##....########.#####...",".##...################..","##...#################..","##..#################...","##.################.....",".##################.....",".###.#######..##..##....",".....######...###.##....","......######R..##R.#R..."],
    ["........................","........................",".................#......","...............#.###....","...............######...","...............######...","................#####...","................####.#R.","...............#######..","..............#######...",".............#########..","............#######..R..","......###..#######......",".....##...#######.......","....##....######........","....##..########........",".....##########.........","......##.######.........",".........#####..........","..........###...........",".........####...........",".........##.#...........",".........##.R...........",".........R.............."],
    ["........................","................#.#.....","...............###......","..............#####.....","............########....","..........##########....",".........##########.....",".........#######........","........#######.........","........########........","........#########.......","........######.##R......","........#####...........","........#####...........","........######..........","........######..........","........######..........","........######..........",".......######...........",".......##.###...........","......##.####...........",".....##..###............","...#.#...##.............","...###...#R............."],
    ["........................","........................","........................","........................","........................","........................",".........###............",".......#######..........",".......#########...#.#..","......###########.###...","......################..","......#################.","......#################.","......################..",".....######..####.......","....######....#.#.......","....##..###R..R.#R......","...##...................","...##...................","..##....................",".###....................","........................","........................","........................"],
  ];

  // Supplied elevated sit idle: a hanging tail gives the new surface its own
  // silhouette instead of reusing a floor sit.
  static ELEVATED_SIT_FRAMES = [
    ["........................","........................","...............#.#......","...............###......","..............#####.....","..............######....",".............#######....","...........#########....","...........#######......","..........#######.......",".........########.......",".........########.......","........########........","........#########.......","........#########.......",".......#######.##.......","......########..#.......",".....###.#####R.#R......",".....##.................",".....#..................",".....##.................",".....##..#..............","......####..............","........................"],
    ["........................","........................","...............#.#......","...............###......","..............#####.....","..............######....",".............#######....","...........#########....","...........#######......","..........#######.......",".........########.......",".........########.......","........########........","........#########.......","........#########.......",".......#######.##.......",".......#######..#.......","......##.#####R.#R......","......#.................","......#...#.............","......#####.............",".......##...............","........................","........................"],
    ["........................","........................","...............#.#......","...............###......","..............#####.....","..............######....",".............#######....","...........#########....","...........#######......","..........#######.......",".........########.......",".........########.......","........########........","........#########.......","........#########.......",".......#######.##.......",".......#######..#.......","......##.#####R.#R......","......#.##..............","......##.#..............","......####..............","........................","........................","........................"],
    ["........................","........................","...............#.#......","...............###......","..............#####.....","..............######....",".............#######....","...........#########....","...........#######......","..........#######.......",".........########.......",".........########.......","........########........","........#########.......","........#########.......",".......#######.##.......",".......#######..#.......","......##.#####R.#R......",".....##.................",".....##.................",".....##.................",".....##.................","....##..................","....#..................."],
  ];

  static DESCENT_FRAMES = [
    ["........................","........................","........................","........................","........................","........................","........................","........................","...#.....#####..........","..##....########........",".##....#########........",".##...###########.......",".##..############.......",".##..#############......",".###.###############....",".####################...","..########..########....","...#######R.#########...",".............##.###.....",".............##.........",".............##.........",".............##.........",".............R..........","........................"],
    ["........................","........................","......#####.............",".....########...........","...##########...........","..#############.........",".###############........",".###############........",".##.############........",".##.####.#######........",".##....#..#######.......",".#.....R...#######......",".#.........#######......",".#..........#######.....","..##........########....","............#######.....","............########....","............##.###......","............##..........","............##..........","............##..........","............R...........","........................","........................"],
    ["...........###..........",".........######.........","........########........",".......#####..###.......",".....########..###......","..############..##......","..#############..##.....","..#############..##.....","..#############...#.....","..#..R.########.........","..R......#######........","..........######........","..........#######.......","..........########......","...........########.....","............########....","............#########...",".............#######....",".............########...",".............##.###.....",".............##.........",".............##.........",".............##.........",".............##R........"],
  ];

  // The first two descent drawings are calibrated to a ledge, not to the
  // floor. `support` is the blue platform-contact cell; `edgeX` is the aqua
  // vertical edge column in the unmirrored source grid. The renderer mirrors
  // both values with the frame, so either side of any platform uses the same
  // authored relationship.
  static DESCENT_EDGE_ANCHORS = [
    { support: [10, 17], edgeX: 13 },
    { support: [7, 11], edgeX: 12 },
    null,
    null,
  ];

  // Explicit local anchor cells and edge-relative world targets for all
  // non-ledge beats. Blue/aqua-authored descent beats live above; these cells
  // make the remaining take-off, flight and landing beats share a deliberate
  // trajectory instead of changing origin when a different red marker wins.
  static LEAP_FRAME_ANCHORS = {
    ascend: [
      { point: [17, 23], level: "floor", edgeOffset: -1 }, // normal stand
      { point: [20, 23], level: "floor", edgeOffset: 2 },  // coiled crouch
      { point: [9, 23], level: "mid", edgeOffset: -5 },    // airborne arc
      { point: [17, 11], level: "surface", edgeOffset: 5 }, // front paws land
      { point: [17, 16], level: "surface", edgeOffset: 7 }, // pull-up
    ],
    descend: [
      null, // blue + aqua edge anchor
      null, // blue + aqua edge anchor
      { point: [15, 23], level: "floor", edgeOffset: -5 }, // front paws floor
      { point: [20, 23], level: "floor", edgeOffset: -12 }, // landing crouch
    ],
  };

  // Literal 24 x 24 source sheets for drinking from a water glass.  The
  // glass/water pixels remain in the source for documentation and are stripped
  // out by getGlassCatRows(), because the glass is a separately rendered,
  // stateful prop. M is the blue-tinted submerged muzzle and T is the tongue.
  static GLASS_DRINK_FRAMES = {
    sitSurface: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","..................##....","...##..........####.....","..##........##########..","..#.......###########...","..#.....#############...",".##....##############...",".#....##########.###....",".##..###########.ggg....","..##.###########.ggg....","..#########.####.www....","...########.##.#.www....","...#######..##.#.www...."],
    sitSurfaceLick: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","..................##....","...##..........####.....","..##........##########..","..#.......###########...","..#.....#############...",".##....##############...",".#....##########.###....",".##..###########.Tgg....","..##.###########.ggg....","..#########.####.www....","...########.##.#.www....","...#######..##.#.www...."],
    sitDepth1: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","...##.........###.##....","..##........#######.....","..#.......############..","..#.....#############...",".##....##############...",".#....###############...",".##..###########.MMM....","..##.###########.ggg....","..#########.####.www....","...########.##.#.www....","...#######..##.#.www....","....######T..T.#Twww...."],
    sitDepth1Lick: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","...##.........###.##....","..##........#######.....","..#.......############..","..#.....#############...",".##....##############...",".#....###############...",".##..###########.MMM....","..##.###########.Tgg....","..#########.####.www....","...########.##.#.www....","...#######..##.#.www....","....######T..T.#Twww...."],
    sitDepth2: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","...##.........####......","..##........#########...","..#.......##########....","..#.....##############..",".##....##############...",".#....###############...",".##..###########.MMM....","..##.###########.MMM....","..#########.####.ggg....","...########.##.#.www....","...#######..##.#.www....","....######T..T.#Twww...."],
    sitDepth2Lick: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","...##.........####......","..##........#########...","..#.......##########....","..#.....##############..",".##....##############...",".#....###############...",".##..###########.MMM....","..##.###########.MMM....","..#########.####.Tgg....","...########.##.#.www....","...#######..##.#.www....","....######T..T.#Twww...."],
    standSurface: ["........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..#.....................","..##....................","...##.............##....","...##..........####.....","....##.###############..","....#################...",".....################...",".....################...","....############.###....","....#####.######.ggg....","....#####...####.ggg....","....####.....###.www....","....###......#.#.www....","....#.#......#.#.www....","....T.#T.....T.#Twww...."],
    standSurfaceLick: ["........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..#.....................","..##....................","...##.............##....","...##..........####.....","....##.###############..","....#################...",".....################...",".....################...","....############.###....","....#####.######.Tgg....","....#####...####.ggg....","....####.....###.www....","....###......#.#.www....","....#.#......#.#.www....","....T.#T.....T.#Twww...."],
    standDepth1: ["........................","........................","........................","........................","........................","........................","........................","....#...................","..##....................","..#.....................","..##....................","...##...................","...##.............##....","....##.######.#####.....","....##################..",".....################...",".....################...","....#################...","....#####.######.MMM....","....#####...####.ggg....","....####.....###.www....","....###......#.#.www....","....#.#......#.#.www....","....T.#T.....T.#Twww...."],
    // 16bcatglease.png: a slightly taller tail while the same muzzle reaches
    // the water. The variation is deliberately used only on the quiet beat.
    standDepth1Alt: ["........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..#.....................","..##....................","...##...................","...##.............##....","....##.######.#####.....","....##################..",".....################...",".....################...","....#################...","....#####.######.MMM....","....#####...####.ggg....","....####.....###.www....","....###......#.#.www....","....#.#......#.#.www....","....T.#T.....T.#Twww...."],
    standDepth1Lick: ["........................","........................","........................","........................","........................","........................","........................","....#...................","..##....................","..#.....................","..##....................","...##...................","...##.............##....","....##.######.#####.....","....##################..",".....################...",".....################...","....#################...","....#####.######.MMM....","....#####...####.Tgg....","....####.....###.www....","....###......#.#.www....","....#.#......#.#.www....","....T.#T.....T.#Twww...."],
    standDepth2: ["........................","........................","........................","........................","........................","........................","........................","........................","...##...................","..#.....................","..##....................","...#....................","...#............##......","...###.######.#######...","....################....",".....#################..",".....################...","....#################...","....#####.######.MMM....","....#####...####.MMM....","....####.....###.ggg....","....###......#.#.www....","....#.#......#.#.www....","....T.#T.....T.#Twww...."],
    standDepth2Lick: ["........................","........................","........................","........................","........................","........................","........................","........................","...##...................","..#.....................","..##....................","...#....................","...#............##......","...###.######.#######...","....################....",".....#################..",".....################...","....#################...","....#####.######.MMM....","....#####...####.MMM....","....####.....###.Tgg....","....###......#.#.www....","....#.#......#.#.www....","....T.#T.....T.#Twww...."],
  };

  // [head position][tail position]. These are literal authored pixel frames,
  // allowing the tail to shift while the eating head stays in the bowl.
  static EAT_IDLE_FRAMES = [
    [
      ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".......######...........",".....#############......","....##################..","..###.###############...","..#...################..","..##..##########.####...","...#..######.###........","......######R..##R......"],
      ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".......######......#....",".....##########.###.....","....################....","..###.###############...","..#...##############....","..##..##########.###....","...#..######.###........","......######R..##R......"],
    ],
    [
      ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".......######...........",".....#############......","....##################..","..###.###############...",".##...################..",".#....##########.####...",".##...######.###........","......######R..##R......"],
      ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".......######......#....",".....##########.###.....","....################....","..###.###############...",".##...##############....",".#....##########.###....",".##...######.###........","......######R..##R......"],
    ],
  ];

  // Supplied box-entry action. Orange box cells have been removed from every
  // frame: `cardboard_box` is rendered independently, including in front of
  // the final tail-only beat. R remains an authored paw-contact marker.
  static BOX_ENTRY_FRAMES = [
    ["........................","........................","................#.#.....","................###.....","...............#####....","...............######...","..............#######...",".............#######....","...........#######......","..........#########.....",".........###########....","........##########.#....","..###..############.#R..",".##...##############....","##....#########....#R...","##..#########...........",".###########............","..##.######.............",".....#####..............","......####..............",".....####...............",".....##.#...............",".....#..R...............",".....R.................."],
    ["........................","..................#.#...","..................####..","...............########.",".............##########.","...........############.",".........#############..","........############....",".......##############...",".......#########.##.##..","......########....##.R..",".....########......R....","....##.#####............","....#..####.............","...##...###.............","...#...##.#.............","...#...##.R.............","....##.#................",".......#................",".......R................","........................","........................","........................","........................"],
    ["........................","........................","........................","..........#.............","...........#............","...........##...........","............#...........","............###.........",".............##.........","........###...##........",".......R..###.###.......","...........######.......",".......###########......",".......R..#########.....","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
    ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","..........#.............","...........#............","...........##...........","............##..........","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
  ];

  // Supplied box-exit action, transcribed from box-exit-01 through -04.
  // Orange box cells and red temporary paw markers are intentionally omitted:
  // the fixed cardboard-box prop supplies the former, while the latter are
  // reference-only guides.  Frame five is the existing ELEVATE crouch frame
  // and is selected by the player below so the landing rejoins the shared
  // standing/auto anchor without a second copy of that artwork.
  static BOX_EXIT_FRAMES = [
    ["........................","........................","........................","........................","........................","..........#.#...........","..........###...........",".........#####..........",".........######.........","........#######.........",".......#######..........",".....#######............","....########............","...########.............","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
    ["........................","..............#.#.......","..............###.......",".............#####......",".............######.....","............#######.....","...........#######......",".........#######........","........#########.......",".......###########......","......##########.#......",".....############.#.....","....##############......","...###########...#......","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
    ["........................","................#.#.....","................####....",".............########...","...........##########...",".........############...",".......#############....","......############......",".....##############.....",".....#########.##.##....","....########....##.....","...########.............","..##.#####..............","..#..####...............","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
    ["...........###..........",".........######.........","........########........",".......#####..###.......",".....########..###......","..############..##......","..#############..##.....","..#############..##.....","..#############...#.....","..#....########.........",".........#######........","..........######........","..........#######.......","..........########......","...........########.....","............########....","............#########...",".............#######....",".............########...",".............##.###.....",".............##.........",".............##.........",".............##.........",".............##........."],
  ];

  // The in-box sheets are intentionally broken into independently authored
  // head/ear and tail layers. The box remains a prop in the foreground; these
  // are only the visible cat cells above its rim. That means a gentle peek can
  // occur anywhere in the box, rather than needing a separate full sprite for
  // every tail/head combination.
  static BOX_IDLE_PARTS = {
    head: {
      right_low: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","..............#...#.....","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
      right_mid: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","..............#...#.....","..............##.##.....","............#######.....","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
      right_high: ["........................","........................","........................","........................","........................","........................","........................","........................","........................",".............#...#......",".............##.##......",".............#####......","............#######.....","..........#########.....","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
      left_low: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".........#...#..........",".........##.##..........","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
      left_mid: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","..........#...#.........","..........##.##.........",".........#######........",".........#######........","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
    },
    tail: {
      none: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
      near: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".......#................","......#.................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
      far: ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".....#..................","....#...................","....##..................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................"],
    },
  };

  static BOX_IDLE_SEQUENCE = [
    { head: "right_low", tail: "none", hold: 5, name: "box peek" },
    { head: "right_mid", tail: "none", hold: 2, name: "box peek rise" },
    { head: "right_high", tail: "near", hold: 3, name: "box peek high" },
    { head: "right_mid", tail: "near", hold: 2, name: "box peek lower" },
    { head: "right_low", tail: "far", hold: 3, name: "box tail swish" },
    { head: "left_low", tail: "far", hold: 3, name: "box turn" },
    { head: "left_mid", tail: "near", hold: 3, name: "box left peek" },
    { head: "left_low", tail: "none", hold: 5, name: "box settle" },
  ];

  // Cat-only extraction from catroomba1..8. The vacuum itself remains the
  // independently rendered prop, so this artwork can ride any moving deck.
  static ROBOT_RIDE_FRAMES = [
    ["........................","........................","........................","........................","..................#.....",".................##.#...",".................####...","....##.........#######..","...##........##########.","...#.......############.","...#.....#############..","..##....############....","..#....###########......","..##..###########.......","...##.###########.......","...#########.####.......","....########.##.#.......","....#######..##.#.......",".....######...###.......","........................","........................","........................","........................","........................"],
    ["........................","........................","........................","........................","..............#..#......","..............####......",".............######.....",".......##...########....","......##....########....","......#....#########....","......#...#########.....",".....##..#########......",".....##.#########.......",".....############.......","......###########.......","......##########........","......##########........",".......#######.#........",".......#####............","........................","........................","........................","........................","........................"],
    ["........................","........................","........................","........................","..........#...#.........","..........##.##.........","..........#####.........",".........#######........",".......#.#######........","......##.#######........","......#..#######........","......#...#####.........","......#..#######........","......#..#######........","......#..#######........","......##########........",".......##########.......","........#########.......","........##.###.##.......","........................","........................","........................","........................","........................"],
    ["........................","........................","........................","........................","......#..#..............","......####..............",".....######.............","....#######....##.......","....########....##......","....########.....#......",".....########....#......","......#########..##.....",".......#########.##.....",".......############.....",".......###########......","........##########......","........##########......","........#.#######.......","............#####.......","........................","........................","........................","........................","........................"],
    ["........................","........................","........................","........................",".....#..................","...#.##.................","...####.................","..#######.........##....",".##########........##...",".############.......#...","..#############.....#...","....############....##..","......###########....#..",".......###########..##..",".......###########.##...",".......####.#########...",".......#.##.########....",".......#.##..#######....","........#....######.....","........................","........................","........................","........................","........................"],
    ["........................","........................","........................","........................","......#..#..............","......####..............",".....######.............","....########...##.......","....########....##......","....#########....#......",".....#########...#......","......#########..##.....",".......#########.##.....",".......############.....",".......###########......",".......###########......",".......###########......",".......##.#######.......",".......##.#######.......","........................","........................","........................","........................","........................"],
    ["........................","........................","........................","........................",".........#...#..........",".........##.##..........",".........#####..........","........#######.........","........#######.........","........#######.........","........########........",".........#####.##.......","........#########.......","........#######.#.......","........#######.#.......","........#########.......",".......##########.......",".......#########........",".......#########........","........................","........................","........................","........................","........................"],
    ["........................","........................","........................","........................","..............#..#......","..............####......",".............######.....",".............#######....","........#...########....","......###...########....","......#....########.....",".....##...########......",".....##.#########.......",".....############.......","......###########.......","......###########.......","......###########.......",".......#######.##.......",".......#######.##.......","........................","........................","........................","........................","........................"],
  ];

  static PROPS = {
    cardboard_box: {
      // Literal 24 x 10 extraction from reference/box-idle/newbox.png.
      // The wider authored rim and four palette shades replace the earlier
      // flat 22-cell placeholder while keeping the box independent of cat art.
      width: 24,
      height: 10,
      rows: ["..LLLLLLLLLLLLMLLLBLLM..", ".LLLLLLLLLLLLLMLLLBLLMM.", "LLLLLLLLLLLLLMBLLLBLLMMM", "LLLLLLLLLLLLMMBLLLBLLMMM", "MMMMMMMMMMMMMBBLLLBLL...", "..BBBBBBBBBBBBBLLLBLL...", "..LLLLLLLLLLLLBLLLBLL...", "..LLLLLLLLLLLLBLLLBLL...", "..LLLLLLLLLLLLBLLLBLL...", "..MMMMMMMMMMMMBMMMBMM..."],
      palette: { L: "#f2a65e", M: "#aa6627", B: "#c68141" },
    },
    food_bowl: {
      width: 4,
      height: 2,
      rows: ["DDDD", "LLLL"],
      palette: {
        D: "#c95e4b",
        L: "#f5ad68",
      },
    },
    // Literal 20 x 5 crops from the supplied robot-vacuum reference sheet.
    // O = outer rail, B = housing, L = LED surround, U/V = underside shades.
    // The red LED is applied only to `ledCell`, preserving its full surround.
    robot_vacuum_side: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "BBBBBBBBBBBBBBBLLLBB", "BBBBBBBBBBBBBBBLLLBB", "OOOOOOOOOOOOOOOOLOOO", "..UUUUUUUUUUUUUVVV.."],
      palette: { O: "#606070", B: "#43434f", L: "#c2c2d1", U: "#272736", V: "#15151f", R: "#eb564b" },
      ledCell: [16, 1],
    },
    robot_vacuum_turn_1: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "BBBBBBBBBBBBBBBLLLBB", "BBBBBBBBBBBBBBBLLLBB", "OOOOOOOOOOOOOOOOLOOO", "..UUUUUUUUUUUUUVVV.."],
      palette: { O: "#606070", B: "#43434f", L: "#c2c2d1", U: "#272736", V: "#15151f", R: "#eb564b" },
      ledCell: [16, 1],
    },
    robot_vacuum_turn_2: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "BBBBBBBBBBBBLLLBBBBB", "BBBBBBBBBBBBLLLBBBBB", "OOOOOOOOOOOOOLOOOOOO", "..UUUUUUUUUUVVVUUU.."],
      palette: { O: "#606070", B: "#43434f", L: "#c2c2d1", U: "#272736", V: "#15151f", R: "#eb564b" },
      ledCell: [13, 1],
    },
    robot_vacuum_turn_3: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "BBBBBBBBBLLLBBBBBBBB", "BBBBBBBBBLLLBBBBBBBB", "OOOOOOOOOOLOOOOOOOOO", "..UUUUUUUVVVUUUUUU.."],
      palette: { O: "#606070", B: "#43434f", L: "#c2c2d1", U: "#272736", V: "#15151f", R: "#eb564b" },
      ledCell: [10, 1],
    },
    robot_vacuum_turn_4: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "BBBBBLLLBBBBBBBBBBBB", "BBBBBLLLBBBBBBBBBBBB", "OOOOOOLOOOOOOOOOOOOO", "..UUUVVVUUUUUUUUUU.."],
      palette: { O: "#606070", B: "#43434f", L: "#c2c2d1", U: "#272736", V: "#15151f", R: "#eb564b" },
      ledCell: [6, 1],
    },
    robot_vacuum_turn_5: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "BBLLLBBBBBBBBBBBBBBB", "BBLLLBBBBBBBBBBBBBBB", "OOOLOOOOOOOOOOOOOOOO", "..VVVUUUUUUUUUUUUU.."],
      palette: { O: "#606070", B: "#43434f", L: "#c2c2d1", U: "#272736", V: "#15151f", R: "#eb564b" },
      ledCell: [3, 1],
    },
    robot_vacuum_turn_6: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "LBBBBBBBBBBBBBBBBBBB", "LBBBBBBBBBBBBBBBBBBB", "OOOOOOOOOOOOOOOOOOOO", "..UUUUUUUUUUUUUUUU.."],
      palette: { O: "#606070", B: "#43434f", L: "#c2c2d1", U: "#272736" },
    },
    robot_vacuum_turn_7: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "BBBBBBBBBBBBBBBBBBBB", "BBBBBBBBBBBBBBBBBBBB", "OOOOOOOOOOOOOOOOOOOO", "..UUUUUUUUUUUUUUUU.."],
      palette: { O: "#606070", B: "#43434f", U: "#272736" },
    },
    robot_vacuum_turn_8: {
      width: 20,
      height: 5,
      rows: ["OOOOOOOOOOOOOOOOOOOO", "BBBBBBBBBBBBBBBBBBBL", "BBBBBBBBBBBBBBBBBBBL", "OOOOOOOOOOOOOOOOOOOO", "..UUUUUUUUUUUUUUUU.."],
      palette: { O: "#606070", B: "#43434f", L: "#c2c2d1", U: "#272736" },
    },
    // Literal 30 x 30 transcription of the supplied refined half-sofa.
    // Every token is a source cell: G is upholstery base, H highlight, M
    // mid-tone, D structural shadow, and K/F are the dark/light sofa feet.
    // A wider card composes this with a mirrored half at native resolution.
    sofa_half: {
      width: 30,
      height: 30,
      rows: [
        "...........HHHHHHHHGGHHHHHHHH.",
        "..........HHHGGGHHGGGGHHHGGGGH",
        ".........HHHGGGGGGGGGGGGGGGGGH",
        "........HHGGGGGGGGGGGGGGGGGGGH",
        "........HGGGGGGGGGGHGGGGGGGGGH",
        "........HGGGGGGGGGGHGGGGGGGGGH",
        "........HGGGGGGGGGHHGGGGGGGGGH",
        "........HGGGGGGGGGHHGGGGGGGGGH",
        "........HGGGGGGGGGHHGGGGGGGGGH",
        "........HGGGGGGGGGHHGGGGGGGGGH",
        ".GHHHHDDHGGGGGGGGGHHGGGGGGGGGH",
        "GHHHMMMDHGGGGGGGGGHHGGGGGGGGGH",
        "HGGGGGMDHHGGGGGGGGHHGGGGGGGGGH",
        "HGGGGGMDHHGGGGGGGGHHGGGGGGGGGH",
        "HGHHGGMDHHGGGGGGGGHHGGGGGGGGGH",
        "HGHHGGMDHHGGGGGGGGHGGGGGGGGGGH",
        "HGHHGGMDHHGGGGGGGGGGGGGGGGGGHH",
        "HMHHGGMDHHMMMMMMMMMMMMMMMMMMHH",
        "DMHHGGMDDDDDDDDDDDDDDDDDDDDDDD",
        "DMHHGGMDMMMGGGGGGGGGGGGGGGGGGG",
        "DMHHGGMDMMHHHHHHGGGHHGGGGHHHHG",
        "DMHHGGMDMGGGGGGGGGHGGGGGGGGGGG",
        "DMHHGGMDMMGGGMMMMMMMMGGGGGMMGG",
        "DMHHGGMDMMMMMGGGMMMGMMMMMMMMMM",
        "DMHHGGMDDMMDDMDDMDMMDMMMMDDMDM",
        "DMMHGGMDDDDDMMDMMMMMMDDDDMDDDD",
        "DMMGGGMDDDDDDDDDDDDDDDDDDDDDDD",
        "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
        ".KKKKKK.......................",
        "..FFFF........................",
      ],
      palette: {
        G: "#3ca272",
        H: "#53b586",
        M: "#388960",
        D: "#245f41",
        K: "#282737",
        F: "#43434f",
      },
    },
    // Literal 24-cell-grid transcriptions from the supplied prop sheet.
    // Tokens retain the source palette values rather than a hand-tuned theme.
    toy_mouse: {
      width: 8,
      height: 3,
      rows: [".B....B.", "BBAAA..B", "BOOOOBB."],
      palette: { A: "#616070", B: "#7f7e8e", O: "#43434f" },
    },
    ball: {
      width: 4,
      height: 4,
      // Source grid (4 x 4): preserve the empty top-left cell so the
      // two-cell crown and two-cell base are centred on the four-cell body.
      rows: [".IG.", "IGGF", "GGFH", ".FH."],
      palette: { I: "#f3a65e", G: "#b96155", F: "#964252", H: "#793f3b" },
    },
    mug: {
      width: 6,
      height: 5,
      rows: ["CNCC..", "CCNCB.", "CNCC.B", "CCNCB.", "CNCC.."],
      palette: { C: "#c3c2d2", N: "#d0d0da", B: "#7f7e8e" },
    },
    water_glass: {
      width: 3,
      height: 6,
      rows: ["GGG", "GGG", "GGG", "WWW", "WWW", "WWW"],
      palette: { G: "#b3ffff", W: "#4da6ff" },
    },
    plant: {
      width: 7,
      height: 13,
      rows: ["D....D.", "EDD.DD.", ".DEFEE.", "...E...", "DD.F.DD", "EDDFDDE", ".EEEDE.", "...FE..", ".DDF...", "GGGGGGG", ".HHHHH.", ".HHGGG.", ".HGGGG."],
      palette: { D: "#8fde5e", E: "#3ca272", F: "#964252", G: "#b96155", H: "#793f3b" },
    },
    floor_lamp: {
      // The source sprite is a 10-cell-wide canvas. Its empty edge cells are
      // structural: retaining them centres the shade, stem and foot together.
      width: 10,
      height: 14,
      rows: ["..JIIIK...", "..JIIIK...", "..JIIIK...", ".JIIIIIK..", ".JIIIIIK..", ".JIIIIIK..", "JIIIIIIKK.", "JIIIIIIIK.", "....A.....", "....A.....", "....A.....", "....A.....", "..BBAAA...", "..BAAAA..."],
      palette: { J: "#ffb571", I: "#f3a65e", K: "#c17f42", A: "#616070", B: "#7f7e8e" },
    },
    clock: {
      width: 16,
      height: 15,
      // Face only: the original static hands are intentionally cleared from
      // the inner face. They are overlaid from HA-local time at render time.
      rows: ["....BBBBBBC.....", "...BAEEEEEBC....", "..BAEEEDEEEBC...", ".BAEEEEEEEEEBC..", "BAEEEEEEEEEEEBC.", "BEEEEEEEEEEEEEB.", "BEEEEEEEEEEEEEB.", "BEDEEEEDEEEEDEB.", "BEEEEEEEEEEEEEB.", "BEEEEEEEEEEEEEB.", "BCEEEEEEEEEEEBA.", ".BCEEEEEEEEEBA..", "..BCEEEDEEEBA...", "...BCEEEEEBA....", "....BBBBBBA....."],
      palette: { A: "#616070", B: "#7f7e8e", C: "#c3c2d2", D: "#43434f", E: "#e6e6e6" },
    },
  };

  // Inventory registry: artwork is separate from a prop's future behaviour.
  // A world instance may override capabilities/state without changing the
  // shared asset definition, allowing future pushing, rolling and persistence.
  static PROP_DEFINITIONS = {
    cardboard_box: { label: "Cardboard box", category: "container", art: PixelPetCard.PROPS.cardboard_box, xRatio: 0.68, capabilities: { movable: true, pushable: true, boppable: true, rollable: false, enterable: true }, poi: { intent: "box", priority: 90, oneShot: true } },
    food_bowl: { label: "Food bowl", category: "care", art: PixelPetCard.PROPS.food_bowl, placement: "edge", defaultSide: "left", insetCells: 1, capabilities: { food: true, movable: true, pushable: false, rollable: false } },
    sofa_half: { label: "Half sofa", category: "furniture", art: PixelPetCard.PROPS.sofa_half, placement: "edge", defaultSide: "right", capabilities: { movable: false, pushable: false, rollable: false } },
    toy_mouse: { label: "Toy mouse", category: "toy", art: PixelPetCard.PROPS.toy_mouse, xRatio: 0.10, capabilities: { movable: true, pushable: true, boppable: true, rollable: false }, poi: { intent: "inspect", priority: 42, oneShot: true } },
    ball: { label: "Ball", category: "toy", art: PixelPetCard.PROPS.ball, xRatio: 0.22, capabilities: { movable: true, pushable: true, boppable: true, rollable: true }, poi: { intent: "inspect", priority: 38, oneShot: true } },
    mug: { label: "Mug", category: "household", art: PixelPetCard.PROPS.mug, xRatio: 0.33, capabilities: { movable: true, pushable: true, rollable: false, spillable: true } },
    water_glass: { label: "Glass of water", category: "household", art: PixelPetCard.PROPS.water_glass, xRatio: 0.43, capabilities: { movable: true, pushable: true, rollable: false, spillable: true, drinkable: true }, poi: { intent: "drink", priority: 78, oneShot: true } },
    plant: { label: "Potted plant", category: "decor", art: PixelPetCard.PROPS.plant, xRatio: 0.51, capabilities: { movable: false, pushable: false, rollable: false, toppleable: true } },
    floor_lamp: { label: "Floor lamp", category: "decor", art: PixelPetCard.PROPS.floor_lamp, xRatio: 0.59, capabilities: { movable: false, pushable: false, rollable: false } },
    robot_vacuum: {
      label: "Robot vacuum",
      category: "appliance",
      art: PixelPetCard.PROPS.robot_vacuum_side,
      xRatio: 0.5,
      capabilities: { movable: true, pushable: false, rollable: true, autonomous: true, carriesSurface: true, boardable: true },
      // The deck is expressed in robot-local cells. It follows the robot now
      // and is visible in Surface debug.  The cat boards it through the
      // ordinary moving-POI route, then rides the same surface.
      surfaces: [{
        id: "deck",
        type: "robot-vacuum-deck",
        x_cells: 1,
        width_cells: 18,
        top_offset_cells: 0,
        supports: ["sit"],
        accepted_poses: ["sit"],
        preferred_poses: ["sit"],
        activity_weights: { walk: 0, stand: 0, sit: 12, loaf: 0, clean: 0, stretch: 0 },
        moving: true,
        traversable: false,
      }],
    },
    clock: { label: "Clock", category: "decor", art: PixelPetCard.PROPS.clock, xRatio: 0.30, capabilities: { movable: true, pushable: false, rollable: false } },
  };

  // Five-by-seven bitmap glyphs. Entity values and labels are composed from
  // these same small character arrays, never from a browser font.
  static PIXEL_FONT = {
    "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
    "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
    "3": ["####.", "....#", "...#.", "..##.", "....#", "#...#", ".###."],
    "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
    "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
    "6": [".###.", "#....", "####.", "#...#", "#...#", "#...#", ".###."],
    "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
    "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
    "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
    ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
    "-": [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
    "%": ["##..#", "##.#.", "..#..", ".#...", "#..##", "#..##", "....."],
    "°": [".##..", "#..#.", "#..#.", ".##..", ".....", ".....", "....."],
    "?": [".###.", "#...#", "...#.", "..#..", ".....", "..#..", "..#.."],
    " ": ["...", "...", "...", "...", "...", "...", "..."],
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
    "C": [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
    "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
    "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
    "G": [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
    "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "I": [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
    "J": ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
    "K": ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
    "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
    "N": ["#...#", "##..#", "##..#", "#.#.#", "#..##", "#..##", "#...#"],
    "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    "Q": [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
    "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "V": ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
    "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
    "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
    "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
    "Z": ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  };

  // R marks a temporary debug paw cell; it still renders as a normal black
  // pixel unless `show_paw_debug` is enabled.
  //
  // Turn frames use F (front, red) and B (rear, amber) instead. They are
  // still ordinary filled pixels unless paw debugging is enabled; the extra
  // distinction makes the authored pivot bearing visible in Card Lab.
  static TURN_REAR_ANCHORS = [
    [4, 23], [10, 23], [9, 23], [13, 23], [13, 23],
  ];

  // Supplied five-frame walking pivot, authored right-to-left. The rear
  // anchor for each beat is declared above so the player moves the canvas,
  // rather than modifying artwork, to retain the planted back-leg feeling.
  static TURN_FRAMES = [
    ["........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..#.....................","..##.............#.#....","...##............###....","...##...........#####...","....##.#####...#######..","....##################..",".....################...",".....##############.....","....##############......","....#####.#######.......","....#####...#####.......","....####.....####.......","....###......##.#.......","....###......##.#.......","....B.#B......F.#F......"],
    ["........................","........................","........................","........................","........................","........................","........................",".......#................",".....##.................",".....#..................",".....##.......#.#.......",".....##.......###.......","......#......#####......","......###...#######.....",".......##..########.....",".......############.....","........##########......","........########........",".......#########........",".......#########........",".......#########........",".......##.#.#.##........",".......B..#.F..#........","..........B....F........"],
    ["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","......#...#...#.........","......#...#####.........","......#...#####.........","......##.#######........",".......#########........",".......#########........","........#######.........",".........######.........",".........######.........",".........######.........",".........######.........",".........######.........",".........##..##.........",".........F....F........."],
    ["........................","........................","........................","........................","........................","........................","........................","................#.......",".................##.....","..................#.....",".......#.#.......##.....",".......###.......##.....","......#####......#......",".....#######...###......",".....########..##.......",".....############.......","......##########........",".......#########........","........#########.......","........#########.......","........#########.......","........##.#.#.##.......","........#..F.#..B.......","........F....B.........."],
    ["........................","........................","........................","........................","........................","........................","....................#...",".....................#..",".....................#..",".....................#..","....#.#.............##..","....###............##...","...#####...........##...","..#######...#####.##....","..##################....","...################.....",".....##############.....","......##############....",".......#######.#####....",".......#####...#####....",".......####.....####....",".......#.##......###....",".......#.##......###....","......F#.F......B#.B...."],
  ];

  static WALK_FRAMES = [
    ["........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..#.....................","..##.............#.#....","...##............###....","...##...........#####...","....##.#####...#######..","....##################..",".....################...",".....##############.....","....##############......","...######.#######.......","...######...#####.......","..######.....####.......","..##.##.....###.#.......","..#..##.....##..#.......","..R...#R....R...#R......"],
    ["........................","........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..##....................","..##.............#.#....","...##............###....","...##...###....######...","....##################..","....##################..",".....################...","....##############......","....##############......","...#####.....####.......","...####.....#####.......","...###......##.#........","...R##......R..#........",".....#R........#R......."],
    ["........................","........................","........................","........................","........................","........................","........................","....#...................","...#....................","...#....................","...#....................","...##............#.#....","....#............###....","....##..###....######...","....##################..",".....#################..",".....################...",".....#############......","....#############.......","....#####....####.......","....####.....###........","....##.......###........","....##R......#R.........",".....R........#R........"],
    ["........................","........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..##....................","...#.............#.#....","...##............###....","...##...........#####...","....##.#####...#######..","....##################..",".....################...",".....##############.....","....##############......","....#####.#######.......","....####.....####.......","...#####.....####.......","...##.##.....##.#.......","...#...#R....#..R.......","...#R........#R........."],
  ];
}

class PixelPetCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = { ...PixelPetCard.defaults };
    this._rendered = false;
  }

  set hass(value) {
    this._hass = value;
    if (!this._rendered) {
      this.render();
      return;
    }
    // `hass` changes whenever HA state changes. Recreating the editor here
    // closes the picker popovers and drops keyboard focus, so keep the
    // existing native controls mounted and only refresh their HA context.
    this.shadowRoot.querySelectorAll("ha-entity-picker, ha-form").forEach((element) => {
      element.hass = value;
    });
  }

  setConfig(config) {
    const nextConfig = { ...PixelPetCard.defaults, ...(config || {}) };
    if (this.sameConfig(nextConfig, this._config)) return;
    this._config = nextConfig;
    this.render();
  }

  connectedCallback() {
    if (!this._rendered) this.render();
  }

  getEntries() {
    const entries = Array.isArray(this._config.entities) ? this._config.entities : [];
    if (entries.length) return entries.map((entry) => typeof entry === "string" ? { entity: entry } : entry);
    if (!this._config.entity) return [];
    return [{
      entity: this._config.entity,
      value: this._config.backdrop_value || "",
      label: this._config.backdrop_label || "",
      value_format: this._config.backdrop_value_format || "auto",
      unit_style: this._config.backdrop_unit_style || "auto",
      color: this._config.backdrop_color || "#e1a640",
    }];
  }

  setEntries(entries, render = false) {
    this.updateConfig({
      entity: "",
      entities: entries,
      show_entity_backdrop: entries.length ? true : this._config.show_entity_backdrop,
    }, render);
  }

  updateConfig(changes, render = false) {
    this._config = { ...this._config, ...changes };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
    // Preserve focus for live HA controls. Only list additions, removals and
    // reordering need a new DOM tree.
    if (render) this.render();
  }

  entityName(entityId) {
    const state = this._hass?.states?.[entityId];
    return state?.attributes?.friendly_name || entityId;
  }

  sameConfig(left, right) {
    const normalise = (value) => {
      if (Array.isArray(value)) return value.map(normalise);
      if (value && typeof value === "object") {
        return Object.keys(value).sort().reduce((result, key) => {
          result[key] = normalise(value[key]);
          return result;
        }, {});
      }
      return value;
    };
    return JSON.stringify(normalise(left)) === JSON.stringify(normalise(right));
  }

  setForm(element, data, schema, onChange) {
    element.hass = this._hass;
    element.data = data;
    element.schema = schema;
    element.computeLabel = (item) => ({
      label: "Display label",
      value: "Value override",
      value_format: "Value format",
      unit_style: "Unit display",
      entity_display_ms: "Hold each entity (ms)",
      entity_slide_ms: "Four-step transition (ms)",
      view_mode: "Default view",
      show_controls: "Show in-card controls",
      show_entity_backdrop: "Show entity backdrop",
      show_floor: "Show floor",
      show_grid: "Show pixel grid",
      show_poi_debug: "Show POIs",
      show_path_debug: "Show pathing",
      show_surface_debug: "Show surfaces",
      show_activity_log: "Show activity log",
    })[item.name] || item.name;
    element.addEventListener("value-changed", (event) => onChange(event.detail.value || {}));
  }

  render() {
    if (!this.shadowRoot) return;
    this._rendered = false;
    const entries = this.getEntries();
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-expansion-panel { display: block; margin: 8px 0; }
        .section { padding: 4px 0 12px; }
        .hint { color: var(--secondary-text-color); font-size: 13px; margin: 0 0 12px; }
        .entry { border-top: 1px solid var(--divider-color); padding: 8px 0; }
        .entry-header { display: flex; align-items: center; gap: 4px; }
        .entry-title { flex: 1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .entry-controls { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .entry-controls ha-input { flex: 0 0 56px; }
        .entry-controls span { color: var(--secondary-text-color); font-size: 13px; }
        ha-icon-button { color: var(--primary-text-color); }
      </style>
      <ha-expansion-panel expanded>
        <div slot="header">Cat appearance</div>
        <div class="section">
          <div class="hint">Choose the solid pixel colour for the cat.</div>
          <ha-input id="cat-color" type="color" label="Cat colour"></ha-input>
        </div>
      </ha-expansion-panel>
      <ha-expansion-panel expanded>
        <div slot="header">Display & controls</div>
        <div class="section">
          <div class="hint">Cat Focus follows the cat in a tighter crop. World view keeps the full room visible.</div>
          <ha-form id="display-form"></ha-form>
        </div>
      </ha-expansion-panel>
      <ha-expansion-panel expanded>
        <div slot="header">Entities</div>
        <div class="section">
          <div class="hint">Add one or more entities. Their values rotate in the backdrop carousel.</div>
          <ha-entity-picker id="entity-picker" label="Add entity"></ha-entity-picker>
          <div id="entries"></div>
          <ha-form id="carousel-form"></ha-form>
        </div>
      </ha-expansion-panel>
      <ha-expansion-panel>
        <div slot="header">Developer overlays</div>
        <div class="section">
          <div class="hint">These overlays are for inspecting routes and pixel placement; leave them off for the finished card.</div>
          <ha-form id="debug-form"></ha-form>
        </div>
      </ha-expansion-panel>
    `;

    const catColor = this.shadowRoot.querySelector("#cat-color");
    catColor.value = /^#[0-9a-f]{6}$/i.test(String(this._config.color || ""))
      ? this._config.color
      : "#1f2937";
    catColor.addEventListener("change", () => this.updateConfig({ color: catColor.value }));

    const displayForm = this.shadowRoot.querySelector("#display-form");
    this.setForm(displayForm, {
      view_mode: this._config.view_mode,
      show_controls: this._config.show_controls,
      show_entity_backdrop: this._config.show_entity_backdrop,
      show_floor: this._config.show_floor,
    }, [
      { name: "view_mode", selector: { select: { mode: "dropdown", options: [
        { value: "cat_focus", label: "Cat Focus" },
        { value: "world", label: "World" },
      ] } } },
      { name: "show_controls", selector: { boolean: {} } },
      { name: "show_entity_backdrop", selector: { boolean: {} } },
      { name: "show_floor", selector: { boolean: {} } },
    ], (value) => this.updateConfig(value));

    const debugForm = this.shadowRoot.querySelector("#debug-form");
    this.setForm(debugForm, {
      show_grid: this._config.show_grid,
      show_poi_debug: this._config.show_poi_debug,
      show_path_debug: this._config.show_path_debug,
      show_surface_debug: this._config.show_surface_debug,
      show_activity_log: this._config.show_activity_log,
    }, [
      { name: "show_grid", selector: { boolean: {} } },
      { name: "show_poi_debug", selector: { boolean: {} } },
      { name: "show_path_debug", selector: { boolean: {} } },
      { name: "show_surface_debug", selector: { boolean: {} } },
      { name: "show_activity_log", selector: { boolean: {} } },
    ], (value) => this.updateConfig(value));

    const picker = this.shadowRoot.querySelector("#entity-picker");
    picker.hass = this._hass;
    picker.addEventListener("value-changed", (event) => {
      const entityId = event.detail.value;
      if (!entityId || entries.some((entry) => entry.entity === entityId)) return;
      this.setEntries([...entries, {
        entity: entityId,
        label: "",
        value: "",
        value_format: "auto",
        unit_style: "auto",
        color: "#e1a640",
      }], true);
    });

    const carouselForm = this.shadowRoot.querySelector("#carousel-form");
    this.setForm(carouselForm, {
      entity_display_ms: this._config.entity_display_ms,
      entity_slide_ms: this._config.entity_slide_ms,
    }, [
      {
        type: "grid",
        name: "",
        flatten: true,
        column_min_width: "180px",
        schema: [
          { name: "entity_display_ms", selector: { number: { min: 500, max: 30000, step: 100, mode: "box" } } },
          { name: "entity_slide_ms", selector: { number: { min: 400, max: 8000, step: 100, mode: "box" } } },
        ],
      },
    ], (value) => this.updateConfig(value));

    const container = this.shadowRoot.querySelector("#entries");
    entries.forEach((entry, index) => {
      const item = document.createElement("div");
      item.className = "entry";
      item.innerHTML = `<div class="entry-header"><ha-icon-button class="up" aria-label="Move up" icon="mdi:chevron-up"></ha-icon-button><ha-icon-button class="down" aria-label="Move down" icon="mdi:chevron-down"></ha-icon-button><div class="entry-title">${this.escape(this.entityName(entry.entity))}</div><ha-icon-button class="remove" aria-label="Remove entity" icon="mdi:close"></ha-icon-button></div><ha-form></ha-form><div class="entry-controls"><ha-input class="entry-color" type="color" label="Value colour"></ha-input><span>Controls this entity’s pixel value colour.</span></div>`;
      const form = item.querySelector("ha-form");
      this.setForm(form, entry, [
        { name: "label", selector: { text: {} } },
        { name: "value", selector: { text: {} } },
        {
          type: "grid",
          name: "",
          flatten: true,
          column_min_width: "180px",
          schema: [
            { name: "value_format", selector: { select: { mode: "dropdown", options: [
              { value: "auto", label: "Auto" },
              { value: "whole", label: "Whole number" },
              { value: "significant_2", label: "Two significant figures" },
              { value: "raw", label: "Raw entity state" },
            ] } } },
            { name: "unit_style", selector: { select: { mode: "dropdown", options: [
              { value: "auto", label: "Auto" },
              { value: "hidden", label: "Hide" },
              { value: "compact", label: "Compact" },
              { value: "full", label: "Full size" },
            ] } } },
          ],
        },
      ], (value) => {
        const next = entries.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, ...value } : candidate);
        this.setEntries(next);
      });
      const color = item.querySelector(".entry-color");
      color.value = /^#[0-9a-f]{6}$/i.test(String(entry.color || "")) ? entry.color : "#e1a640";
      color.addEventListener("change", () => {
        const next = entries.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, color: color.value } : candidate);
        this.setEntries(next);
      });
      item.querySelector(".remove").addEventListener("click", () => this.setEntries(entries.filter((_, candidateIndex) => candidateIndex !== index), true));
      item.querySelector(".up").addEventListener("click", () => {
        if (!index) return;
        const next = [...entries];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        this.setEntries(next, true);
      });
      item.querySelector(".down").addEventListener("click", () => {
        if (index === entries.length - 1) return;
        const next = [...entries];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        this.setEntries(next, true);
      });
      container.append(item);
    });
    this._rendered = true;
  }

  escape(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
  }
}

if (!customElements.get("pixel-pet-card")) {
  customElements.define("pixel-pet-card", PixelPetCard);
}

if (!customElements.get("pixel-pet-card-editor")) {
  customElements.define("pixel-pet-card-editor", PixelPetCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "pixel-pet-card",
  name: "Pixel Pet Card",
  description: "A small array-driven pixel cat that patrols inside its card.",
});
