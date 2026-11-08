/*
 * HA Card Lab's local compatibility cards.
 * These deliberately do not import or copy the Home Assistant frontend. They
 * provide useful visual/configuration coverage in the portable lab only.
 */
const tags = {
  tile: "hui-tile-card", entities: "hui-entities-card", entity: "hui-entity-card", button: "hui-button-card", glance: "hui-glance-card", heading: "hui-heading-card", grid: "hui-grid-card", "horizontal-stack": "hui-horizontal-stack-card", "vertical-stack": "hui-vertical-stack-card", conditional: "hui-conditional-card", light: "hui-light-card", sensor: "hui-sensor-card", thermostat: "hui-thermostat-card", "weather-forecast": "hui-weather-forecast-card", gauge: "hui-gauge-card", "history-graph": "hui-history-graph-card", "statistics-graph": "hui-statistics-graph-card", markdown: "hui-markdown-card", "picture-entity": "hui-picture-entity-card", "picture-elements": "hui-picture-elements-card", "media-control": "hui-media-control-card", calendar: "hui-calendar-card", map: "hui-map-card"
};
const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const domainOf = (entityId = "") => entityId.split(".")[0];
const friendly = (entity, fallback = "Entity") => entity?.attributes?.friendly_name || fallback;
const stateText = (entity) => entity ? `${entity.state}${entity.attributes?.unit_of_measurement ? ` ${entity.attributes.unit_of_measurement}` : ""}` : "Entity not found";
const iconFor = (entity, id) => entity?.attributes?.icon || ({ light: "mdi:lightbulb", switch: "mdi:toggle-switch", sensor: "mdi:gauge", climate: "mdi:thermostat", weather: "mdi:weather-partly-cloudy", person: "mdi:account", cover: "mdi:garage", vacuum: "mdi:robot-vacuum", media_player: "mdi:speaker" }[domainOf(id)] || "mdi:circle-outline");

class LabBuiltinCard extends HTMLElement {
  constructor() { super(); this._config = null; this._hass = undefined; }
  setConfig(config) { if (!config || typeof config !== "object") throw new Error("A card configuration object is required."); this._config = { ...config, type: config.type || this._labType }; this.render(); }
  set hass(value) { this._hass = value; this.render(); }
  get hass() { return this._hass; }
  getCardSize() { return this._labType === "entities" ? (this._config?.entities?.length || 1) + 1 : this._labType.includes("stack") ? this._config?.cards?.length || 1 : 2; }
  getGridOptions() { return { columns: this._labType === "grid" ? this._config.columns || 3 : 6, rows: "auto", min_columns: 3 }; }
  entity() { return this._hass?.states?.[this._config.entity]; }
  callToggle(entityId = this._config.entity) { const domain = domainOf(entityId); if (["light", "switch", "input_boolean", "cover", "vacuum", "climate"].includes(domain)) this._hass?.callService(domain, "toggle", { entity_id: entityId }); }
  base(title, body, cls = "") { return `<ha-card class="lab-builtin ${cls}">${title ? `<div class="lab-card-title">${esc(title)}</div>` : ""}${body}</ha-card>`; }
  entityRow(entityId, config = {}) { const entity = this._hass?.states?.[entityId]; const name = config.name || friendly(entity, entityId); return `<button class="lab-entity-row" data-toggle="${esc(entityId)}"><span class="lab-icon">${esc(iconFor(entity, entityId))}</span><span class="lab-entity-name">${esc(name)}</span><span class="lab-state">${esc(stateText(entity))}</span></button>`; }
  render() {
    if (!this._hass || !this._config) return;
    const type = this._labType;
    const entity = this.entity();
    if (type === "heading") { this.innerHTML = `<div class="lab-heading"><h2>${esc(this._config.heading || this._config.title || "Heading")}</h2>${this._config.subtitle ? `<p>${esc(this._config.subtitle)}</p>` : ""}</div>`; return; }
    if (type === "tile") {
      if (!this._config.entity) throw new Error("Tile cards require an entity.");
      this.innerHTML = this.base("", `<button class="lab-tile" data-toggle="${esc(this._config.entity)}"><span class="lab-tile-icon">${esc(iconFor(entity, this._config.entity))}</span><span><b>${esc(this._config.name || friendly(entity, this._config.entity))}</b><small>${esc(this._config.hide_state ? "" : stateText(entity))}</small></span></button>`, entity?.state === "on" ? "active" : "");
    } else if (type === "entities") {
      const rows = (this._config.entities || []).map(item => typeof item === "string" ? this.entityRow(item) : this.entityRow(item.entity, item)).join("");
      this.innerHTML = this.base(this._config.title, `<div class="lab-entities">${rows || "No entities configured."}</div>`);
    } else if (type === "entity" || type === "button") {
      const name = this._config.name || friendly(entity, this._config.entity);
      this.innerHTML = this.base("", `<button class="lab-button-card" data-toggle="${esc(this._config.entity)}"><span class="lab-tile-icon">${esc(iconFor(entity, this._config.entity))}</span><b>${esc(name)}</b><small>${esc(stateText(entity))}</small></button>`, entity?.state === "on" ? "active" : "");
    } else if (type === "glance") {
      const cells = (this._config.entities || []).map(item => { const id = typeof item === "string" ? item : item.entity; const value = this._hass.states[id]; return `<button class="lab-glance" data-toggle="${esc(id)}"><span>${esc(iconFor(value, id))}</span><b>${esc(friendly(value, id))}</b><small>${esc(stateText(value))}</small></button>`; }).join("");
      this.innerHTML = this.base(this._config.title, `<div class="lab-glance-row">${cells}</div>`);
    } else if (type === "gauge") {
      const min = Number(this._config.min ?? 0), max = Number(this._config.max ?? 100), value = Number(entity?.state ?? 0), percent = Math.max(0, Math.min(100, ((value - min) / Math.max(1, max - min)) * 100));
      this.innerHTML = this.base(this._config.name || friendly(entity, this._config.entity), `<div class="lab-gauge" style="--gauge:${percent}%"><strong>${esc(stateText(entity))}</strong><span>${esc(`${min} - ${max}`)}</span></div>`);
    } else if (type === "light") {
      const brightness = Number(entity?.attributes?.brightness ?? 0) / 2.55;
      this.innerHTML = this.base(this._config.name || friendly(entity, this._config.entity), `<button class="lab-light-toggle" data-toggle="${esc(this._config.entity)}">${entity?.state === "on" ? "On" : "Off"}</button><input class="lab-range" type="range" min="0" max="100" value="${brightness}" aria-label="Mock brightness">`);
    } else if (type === "sensor" || type === "history-graph" || type === "statistics-graph") {
      const ids = type === "sensor" ? [this._config.entity] : (this._config.entities || []).map(item => typeof item === "string" ? item : item.entity);
      const readouts = ids.map(id => `<div>${esc(friendly(this._hass.states[id], id))}<strong>${esc(stateText(this._hass.states[id]))}</strong></div>`).join("");
      this.innerHTML = this.base(this._config.name || this._config.title || (type === "sensor" ? friendly(entity, this._config.entity) : "Mock data graph"), `<div class="lab-graph"><svg viewBox="0 0 260 70" preserveAspectRatio="none"><polyline points="0,55 28,42 57,49 86,24 115,38 144,19 173,34 202,14 231,28 260,10"/></svg>${readouts}</div>`);
    } else if (type === "thermostat") {
      this.innerHTML = this.base(this._config.name || friendly(entity, this._config.entity), `<div class="lab-thermostat"><strong>${esc(`${entity?.attributes?.current_temperature ?? "?"} ${entity?.attributes?.temperature_unit || "°C"}`)}</strong><span>Target ${esc(entity?.attributes?.temperature ?? "?")}</span><input class="lab-range" type="range" min="7" max="30" value="${esc(entity?.attributes?.temperature ?? 21)}"></div>`);
    } else if (type === "weather-forecast") {
      this.innerHTML = this.base(this._config.name || friendly(entity, this._config.entity), `<div class="lab-weather"><b>${esc(entity?.state || "unknown")}</b><strong>${esc(stateText(entity))}</strong><span>Forecast is mock-only in HA Card Lab.</span></div>`);
    } else if (type === "media-control") {
      this.innerHTML = this.base(this._config.name || friendly(entity, this._config.entity), `<div class="lab-media"><b>${esc(entity?.attributes?.media_title || "Nothing playing")}</b><span>${esc(entity?.attributes?.media_artist || stateText(entity))}</span><button data-toggle="${esc(this._config.entity)}">Play / pause</button></div>`);
    } else if (type === "calendar") {
      this.innerHTML = this.base(this._config.title || friendly(entity, this._config.entity), `<div class="lab-calendar"><b>${esc(entity?.attributes?.message || "No upcoming event")}</b><span>${esc(entity?.attributes?.start_time || "")}</span></div>`);
    } else if (type === "markdown") {
      const content = esc(this._config.content || "# Markdown\nUse this card for local text-layout checks.").replaceAll("\n", "<br>").replace(/^# (.*?)(<br>|$)/, "<h3>$1</h3>");
      this.innerHTML = this.base(this._config.title, `<div class="lab-markdown">${content}</div>`);
    } else if (["picture-entity", "picture-elements", "map"].includes(type)) {
      this.innerHTML = this.base(this._config.title || this._config.name || friendly(entity, type), `<div class="lab-visual ${type === "map" ? "map" : ""}"><span>${type === "map" ? "Local mock map: no remote tiles" : "Local image placeholder"}</span><b>${esc(entity ? stateText(entity) : "")}</b></div>`);
    } else if (["grid", "horizontal-stack", "vertical-stack", "conditional"].includes(type)) {
      this.renderContainer(); return;
    } else { this.innerHTML = this.base(this._config.title || type, `<p class="lab-empty">This lab-native compatibility card accepts the type but has no specialised visual yet.</p>`); }
    this.bindActions();
  }
  renderContainer() {
    if (this._labType === "conditional" && !(this._config.conditions || []).every(condition => this.matches(condition))) { this.innerHTML = ""; return; }
    const children = this._labType === "conditional" ? (this._config.card ? [this._config.card] : []) : this._config.cards || [];
    this.innerHTML = this.base(this._config.title, `<div class="lab-container ${this._labType}"></div>`);
    const host = this.querySelector(".lab-container");
    children.forEach(config => { const tag = tags[config.type] || (config.type || "").replace(/^custom:/, ""); const child = document.createElement(tag || "div"); child.hass = this._hass; child.setConfig?.(config); host.append(child); });
  }
  matches(condition) { const entity = this._hass.states?.[condition.entity]; return !condition.state || entity?.state === condition.state; }
  bindActions() { this.querySelectorAll("[data-toggle]").forEach(button => button.addEventListener("click", () => this.callToggle(button.dataset.toggle))); }
}
for (const [type, tag] of Object.entries(tags)) if (!customElements.get(tag)) customElements.define(tag, class extends LabBuiltinCard { constructor() { super(); this._labType = type; } });
window.customCards = window.customCards || [];
Object.entries(tags).forEach(([type, tag]) => window.customCards.push({ type, name: `Lab-native ${type}`, description: `Portable compatibility element (${tag})` }));
