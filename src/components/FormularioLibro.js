class FormularioLibro extends HTMLElement {
    constructor() {
        super();
        this.datosLibro = null;
        this.attachShadow({ mode: 'open' });
        this.modo = this.getAttribute('modo') || 'agregar';
    }

    static get observedAttributes() { 
        return ['modo', 'datos-libro']; 
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'modo') {
            this.modo = newValue;
        } else if (name === 'datos-libro' && newValue) {
            this.datosLibro = JSON.parse(newValue);
        }
        this.renderizar();
    }
    
    connectedCallback() { 
        this.renderizar(); 
    }

    renderizar() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url("src/assets/styles/global.css");
                @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");
                :host { display: block; }
                .form-card { background: white; padding: 2rem; var(--border-radius--); border: 1px solid var(--border-color); }
                .book-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .full-width { grid-column: 1 / -1; }
                .form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
                .search-form { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 1rem; align-items: end; background: white; padding: 1.5rem; var(--border-radius--); border: 1px solid var(--border-color); }
                @media (max-width: 900px) { .search-form { grid-template-columns: 1fr 1fr; } }
            </style>

            <div class="${this.modo === 'busqueda' ? '' : 'form-card'}">
                <form id="form">
                    ${this.modo === 'busqueda' ? this.renderBusqueda() : this.renderFormulario()}
                </form>
            </div>
        `;
        this.setupEventListeners();
    }

    renderFormulario() {
        const datos = this.datosLibro || {};
        const botonTexto = this.datosLibro ? 'Guardar Cambios' : 'Registrar';
        
        return `
            <div class="book-form">
                <div class="form-group full-width">
                    <label class="form-label">Título</label>
                    <input type="text" id="title" class="form-input" value="${datos.title || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Autor</label>
                    <input type="text" id="author" class="form-input" value="${datos.author || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Editorial</label>
                    <input type="text" id="editorial" class="form-input" value="${datos.editorial || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Año</label>
                    <input type="number" id="year" class="form-input" value="${datos.year || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">ISBN / Código</label>
                    <input type="text" id="isbn" class="form-input" value="${datos.isbn || ''}">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" id="cancel-btn" style="background: #f1f5f9; color: #64748b;">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${botonTexto}</button>
                </div>
            </div>
        `;
    }

    renderBusqueda() {
        return `
            <div class="search-form">
                <div class="form-group"><label class="form-label">Título</label><input type="text" id="s-title" class="form-input"></div>
                <div class="form-group"><label class="form-label">Autor</label><input type="text" id="s-author" class="form-input"></div>
                <div class="form-group"><label class="form-label">Editorial</label><input type="text" id="s-editorial" class="form-input"></div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select id="s-status" class="form-input">
                        <option value="todos">Todos</option>
                        <option value="disponible">Disponible</option>
                        <option value="prestado">Prestado</option>
                    </select>
                </div>
                <div class="form-group"><button type="submit" class="btn btn-primary"><i class="fas fa-search"></i></button></div>
            </div>
        `;
    }

    setupEventListeners() {
        const formulario = this.shadowRoot.getElementById('form');
        formulario.addEventListener('submit', e => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        const cancelBtn = this.shadowRoot.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('cancelarFormulario', { 
                    bubbles: true, 
                    composed: true 
                }));
            });
        }
    }

    handleSubmit() {
        if (this.modo === 'busqueda') {
            this.manejarBusqueda();
        } else {
            this.manejarGuardado();
        }
    }

    manejarBusqueda() {
        const criteria = {
            title: this.shadowRoot.getElementById('s-title').value,
            author: this.shadowRoot.getElementById('s-author').value,
            editorial: this.shadowRoot.getElementById('s-editorial').value,
            status: this.shadowRoot.getElementById('s-status').value
        };
        
        const evento = new CustomEvent('buscarLibros', { 
            bubbles: true, 
            composed: true, 
            detail: criteria 
        });
        this.dispatchEvent(evento);
    }

    manejarGuardado() {
        const data = {
            title: this.shadowRoot.getElementById('title').value,
            author: this.shadowRoot.getElementById('author').value,
            editorial: this.shadowRoot.getElementById('editorial').value,
            year: this.shadowRoot.getElementById('year').value,
            isbn: this.shadowRoot.getElementById('isbn').value
        };
        
        const nombreEvento = this.datosLibro ? 'libroActualizado' : 'libroAgregado';
        
        if (this.datosLibro) {
            data.id = this.datosLibro.id;
        }
        
        const evento = new CustomEvent(nombreEvento, { 
            bubbles: true, 
            composed: true, 
            detail: data 
        });
        this.dispatchEvent(evento);
    }
}
customElements.define('formulario-libro', FormularioLibro);
