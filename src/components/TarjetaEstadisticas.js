class TarjetaEstadisticas extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.renderizar();
  }

  obtenerIcono(tipo) {
    const iconos = {
      libro: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="heroicon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>`,
      check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="heroicon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
      autor: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="heroicon"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`,
      reloj: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="heroicon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    };
    return iconos[tipo] || iconos["libro"];
  }

  renderizar() {
    const titulo = this.getAttribute("titulo") || "";
    const valor = this.getAttribute("valor") || "0";
    const tipoIcono = this.getAttribute("tipo-icono") || "libro";
    const svgIcono = this.obtenerIcono(tipoIcono);

    this.shadowRoot.innerHTML = `
            <style>
                @import url("src/assets/styles/global.css");
                :host { display: block; }
                .stats-card { background-color: white; var(--border-radius--); box-shadow: var(--shadow-sm); padding: 1.5rem; display: flex; align-items: center; gap: 1.2rem; height: 100%; border: 1px solid var(--border-color); transition: transform 0.2s; }
                .stats-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
                .icon-container { width: 56px; height: 56px; var(--border-radius--); background-color: #f3f4f6; color: var(--primary-color); display: flex; align-items: center; justify-content: center; padding: 12px; }
                .heroicon { width: 100%; height: 100%; display: block; }
                .stats-info { flex: 1; }
                .stats-value { font-size: 1.8rem; font-weight: 800; color: var(--secondary-color); line-height: 1.1; margin-bottom: 4px; }
                .stats-title { color: var(--text-light); font-size: 0.9rem; font-weight: 500; }
            </style>
            <div class="stats-card"><div class="icon-container">${svgIcono}</div>
            <div class="stats-info"><div class="stats-value">${valor}</div>
            <div class="stats-title">${titulo}</div></div></div>
        `;
  }
}
customElements.define("tarjeta-estadisticas", TarjetaEstadisticas);
