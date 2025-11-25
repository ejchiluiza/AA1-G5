class PrestamoLibro extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    static get observedAttributes() { return ['visible', 'titulo-libro']; }
    attributeChangedCallback() { this.renderizar(); }
    connectedCallback() { this.renderizar(); }

    renderizar() {
        const visible = this.getAttribute('visible') === 'true';
        const tituloLibro = this.getAttribute('titulo-libro') || 'el libro';

        this.shadowRoot.innerHTML = `
            <style>
                @import url("src/assets/styles/global.css");
                :host { display: block; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 5000; opacity: 0; visibility: hidden; transition: all 0.2s ease; }
                .modal-overlay.visible { opacity: 1; visibility: visible; }
                .modal { background-color: white; var(--border-radius--); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); width: 90%; max-width: 400px; padding: 1.5rem; transform: scale(0.95); transition: transform 0.2s ease; }
                .modal-overlay.visible .modal { transform: scale(1); }
                .modal-header { margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
                .modal-title { font-size: 1.2rem; font-weight: 700; color: var(--secondary-color); }
                .modal-body { margin-bottom: 1.5rem; }
                .input-prestamo { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 10px; font-size: 1rem; }
            </style>
            <div class="modal-overlay ${visible ? 'visible' : ''}"><div class="modal"><div class="modal-header"><h3 class="modal-title">Registrar Préstamo</h3></div><div class="modal-body"><p>Asignar <strong>"${tituloLibro}"</strong> a:</p><input type="text" id="nombre-solicitante" class="input-prestamo" placeholder="Nombre del estudiante/persona" autofocus></div><div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;"><button class="btn" id="cancel-btn" style="border: 1px solid #cbd5e1;">Cancelar</button><button class="btn btn-primary" id="confirm-btn">Confirmar Préstamo</button></div></div></div>
        `;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        const cancelBtn = this.shadowRoot.getElementById('cancel-btn');
        const confirmBtn = this.shadowRoot.getElementById('confirm-btn');
        const input = this.shadowRoot.getElementById('nombre-solicitante');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cerrarModal(null));
        if (confirmBtn) confirmBtn.addEventListener('click', () => { const nombre = input.value.trim(); if (nombre) this.cerrarModal(nombre); else alert("Ingrese nombre."); });
        if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) this.cerrarModal(null); });
    }

    cerrarModal(nombreSolicitante) {
        this.setAttribute('visible', 'false');
        if (nombreSolicitante !== null) this.dispatchEvent(new CustomEvent('confirmarPrestamo', { bubbles: true, composed: true, detail: { solicitante: nombreSolicitante } }));
    }
}
customElements.define('prestamo-libro', PrestamoLibro);