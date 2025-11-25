class ItemLibro extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.datosLibro = null;
        this.mostrarAcciones = this.getAttribute('mostrar-acciones') === 'true';
    }

    static get observedAttributes() { return ['datos-libro', 'mostrar-acciones']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'datos-libro') {
            this.datosLibro = JSON.parse(newValue);
            this.renderizar();
        } else if (name === 'mostrar-acciones') {
            this.mostrarAcciones = newValue === 'true';
            this.renderizar();
        }
    }

    connectedCallback() { this.renderizar(); }

    renderizar() {
        if (!this.datosLibro) return;
        
        const { title, author, year, editorial, status, prestadoA } = this.datosLibro;
        const esPrestado = status === 'prestado';

        // ICONO SOLICITADO PARA LIBROS INGRESADOS
        const bookIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="heroicon"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>`;

        // Iconos para botones
        const btnPrestamoIcon = esPrestado ? 'fas fa-undo' : 'fas fa-hand-holding';
        const btnPrestamoTitle = esPrestado ? 'Devolver Libro' : 'Registrar Préstamo';
        const btnPrestamoClass = esPrestado ? 'return-btn' : 'loan-btn';

        this.shadowRoot.innerHTML = `
            <style>
                @import url("src/assets/styles/global.css");
                @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");
                :host { display: block; height: 100%; }
                .book-card { background: white; var(--border-radius--); box-shadow: var(--shadow-sm); overflow: hidden; height: 100%; display: flex; flex-direction: column; border: 1px solid var(--border-color); transition: all 0.2s; }
                .book-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--primary-color); }
                
                .book-cover { height: 140px; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; color: var(--text-light); padding: 20px; position: relative; border-bottom: 1px solid #f1f5f9; }
                .heroicon { width: 64px; height: 64px; opacity: 0.6; transition: all 0.3s ease; }
                .book-card:hover .heroicon { opacity: 1; color: var(--primary-color); transform: scale(1.1); }
                
                .status-badge { position: absolute; top: 10px; right: 10px; padding: 4px 10px; var(--border-radius--); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: white; box-shadow: var(--shadow-sm); }
                .status-disponible { color: var(--success-color); background: #ecfdf5; border: 1px solid #d1fae5; }
                .status-prestado { color: var(--warning-color); background: #fffbeb; border: 1px solid #fef3c7; }

                .book-info { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }
                .book-title { font-size: 1rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 0.25rem; line-height: 1.3; }
                .book-meta { font-size: 0.8rem; color: var(--text-light); margin-bottom: 0.5rem; }
                .loan-info { font-size: 0.75rem; color: var(--warning-color); font-weight: 600; margin-bottom: 10px; background: #fffbeb; padding: 4px 8px; border-radius: 4px; display: inline-block; }

                .book-footer { margin-top: auto; padding-top: 10px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                .actions-wrapper { display: flex; gap: 5px; }
                .action-btn { width: 30px; height: 30px; var(--border-radius--); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: var(--text-light); border: 1px solid transparent; }
                .action-btn:hover { background: #f1f5f9; color: var(--primary-color); border-color: #e2e8f0; }
                
                .main-action-btn { padding: 4px 10px; var(--border-radius--); font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s; }
                .btn-prestar { background: #ecfdf5; color: var(--success-color); border: 1px solid #d1fae5; }
                .btn-prestar:hover { background: var(--success-color); color: white; }
                .btn-devolver { background: #fffbeb; color: var(--warning-color); border: 1px solid #fef3c7; }
                .btn-devolver:hover { background: var(--warning-color); color: white; }
            </style>

            <div class="book-card">
                <div class="book-cover">
                    <span class="status-badge status-${status}">${status}</span>
                    ${bookIcon}
                </div>
                <div class="book-info">
                    <div class="book-title">${title}</div>
                    <div class="book-meta">${author} • ${year}</div>
                    ${editorial ? `<div class="book-meta" style="font-style:italic;">Ed. ${editorial}</div>` : ''}
                    ${esPrestado && prestadoA ? `<div class="loan-info"><i class="fas fa-user"></i> ${prestadoA}</div>` : ''}
                    
                    <div class="book-footer">
                        ${this.mostrarAcciones ? `
                             <button class="main-action-btn ${btnPrestamoClass}" id="toggle-status">
                                <i class="${btnPrestamoIcon}"></i> ${esPrestado ? 'Devolver' : 'Asignar'}
                             </button>
                            <div class="actions-wrapper">
                                <div class="action-btn edit-btn" title="Editar"><i class="fas fa-pen"></i></div>
                                <div class="action-btn delete-btn" title="Eliminar"><i class="fas fa-trash"></i></div>
                            </div>
                        ` : '<span></span>'}
                    </div>
                </div>
            </div>
        `;
        this.setupEventListeners(esPrestado);
    }

    setupEventListeners(esPrestado) {
        if (!this.mostrarAcciones) return;

        const btnToggle = this.shadowRoot.getElementById('toggle-status');
        const btnEdit = this.shadowRoot.querySelector('.edit-btn');
        const btnDelete = this.shadowRoot.querySelector('.delete-btn');

        if (btnToggle) {
            btnToggle.addEventListener('click', () => {
                const evento = esPrestado ? 'devolverLibro' : 'solicitarPrestamo';
                this.dispatchEvent(new CustomEvent(evento, { bubbles: true, composed: true, detail: this.datosLibro.id }));
            });
        }
        if (btnEdit) btnEdit.addEventListener('click', () => this.dispatchEvent(new CustomEvent('editarLibro', { bubbles: true, composed: true, detail: this.datosLibro.id })));
        if (btnDelete) btnDelete.addEventListener('click', () => this.dispatchEvent(new CustomEvent('libroEliminado', { bubbles: true, composed: true, detail: this.datosLibro.id })));
    }
}
customElements.define('item-libro', ItemLibro);