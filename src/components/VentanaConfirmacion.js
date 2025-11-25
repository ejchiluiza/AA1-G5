class VentanaConfirmacion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["visible", "titulo", "mensaje", "mostrar-cancelar"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (["visible", "titulo", "mensaje", "mostrar-cancelar"].includes(name))
      this.renderizar();
  }
  connectedCallback() {
    this.renderizar();
  }

  renderizar() {
    const visible = this.getAttribute("visible") === "true";
    const titulo = this.getAttribute("titulo") || "Confirmación";
    const mensaje = this.getAttribute("mensaje") || "";
    const mostrarCancelar = this.getAttribute("mostrar-cancelar") === "true";

    this.shadowRoot.innerHTML = `
            <style>
                @import url("src/assets/styles/global.css");
                :host { display: block; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 5000; opacity: 0; visibility: hidden; transition: all 0.2s ease; }
                .modal-overlay.visible { opacity: 1; visibility: visible; }
                .modal { background-color: white; var(--border-radius--); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); width: 90%; max-width: 400px; padding: 1.5rem; transform: scale(0.95); transition: transform 0.2s ease; }
                .modal-overlay.visible .modal { transform: scale(1); }
                .modal-header { margin-bottom: 1rem; }
                .modal-title { font-size: 1.25rem; font-weight: 700; color: var(--secondary-color); }
                .modal-body { margin-bottom: 1.5rem; color: var(--text-light); line-height: 1.5; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; }
            </style>
            <div class="modal-overlay ${visible ? "visible" : ""}">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">${titulo}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${mensaje}</p>
                    </div>
                    ${
                      mostrarCancelar
                        ? `<div class="modal-footer">
                        <button class="btn" id="cancel-btn" style="background: white; border: 1px solid var(--border-color);">Cancelar</button>
                        <button class="btn btn-danger" id="confirm-btn">Confirmar</button>
                    </div>`
                        : ""
                    }
                </div>
            </div>
        `;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const overlay = this.shadowRoot.querySelector(".modal-overlay");
    const cancelBtn = this.shadowRoot.getElementById("cancel-btn");
    const confirmBtn = this.shadowRoot.getElementById("confirm-btn");
    if (overlay)
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.cerrarModal(false);
      });
    if (cancelBtn)
      cancelBtn.addEventListener("click", () => this.cerrarModal(false));
    if (confirmBtn)
      confirmBtn.addEventListener("click", () => this.cerrarModal(true));
  }

  cerrarModal(confirmado) {
    this.setAttribute("visible", "false");
    this.dispatchEvent(
      new CustomEvent("respuestaConfirmacion", {
        bubbles: true,
        composed: true,
        detail: { confirmado },
      })
    );
  }
}
customElements.define("ventana-confirmacion", VentanaConfirmacion);
