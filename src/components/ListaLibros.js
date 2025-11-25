class ListaLibros extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.libros = [];
        this.mostrarAcciones = this.getAttribute('mostrar-acciones') === 'true';
    }

    static get observedAttributes() { return ['libros', 'mostrar-acciones']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'libros' && newValue) {
            this.libros = JSON.parse(newValue);
            this.renderizar();
        } else if (name === 'mostrar-acciones') {
            this.mostrarAcciones = newValue === 'true';
            this.renderizar();
        }
    }

    connectedCallback() { this.renderizar(); }

    renderizar() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url("src/assets/styles/global.css");
                :host { display: block; }
                .book-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
                .empty-state { grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; var(--border-radius--); border: 1px dashed var(--border-color); color: var(--text-light); }
            </style>

            <div class="book-list">
                ${this.libros.length > 0 
                    ? this.libros.map(libro => `
                        <item-libro datos-libro='${JSON.stringify(libro)}' mostrar-acciones="${this.mostrarAcciones}"></item-libro>
                    `).join('')
                    : `<div class="empty-state"><h3>No se encontraron libros</h3></div>`
                }
            </div>
        `;
    }
}
customElements.define('lista-libros', ListaLibros);