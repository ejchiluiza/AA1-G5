// Nombre del archivo: dashboard.js

// CAMBIO 1: Nombre de la clase actualizado
class ComponenteContenedor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.libros = JSON.parse(localStorage.getItem('libraryBooks')) || [
            { id: 1, title: 'Cien años de soledad', author: 'Gabriel García Márquez', year: 1967, editorial: 'Sudamericana', status: 'disponible', prestadoA: '' },
            { id: 2, title: 'Don Quijote', author: 'Cervantes', year: 1605, editorial: 'Francisco de Robles', status: 'prestado', prestadoA: 'Juan Pérez' },
            { id: 3, title: '1984', author: 'George Orwell', year: 1949, editorial: 'Secker & Warburg', status: 'disponible', prestadoA: '' },
            { id: 4, title: 'El principito', author: 'Saint-Exupéry', year: 1943, editorial: 'Reynal & Hitchcock', status: 'disponible', prestadoA: '' },
            { id: 5, title: 'Clean Code', author: 'Robert C. Martin', year: 2008, editorial: 'Prentice Hall', status: 'disponible', prestadoA: '' },
            { id: 6, title: 'Design Patterns', author: 'Erich Gamma', year: 1994, editorial: 'Addison-Wesley', status: 'prestado', prestadoA: 'Ana López' }
        ];
        this.vistaActual = 'dashboard';
        this.libroSeleccionado = null;
        this.libroAPrestarId = null;
        this._libroAEliminarId = null;
        this._eventosConfigurados = false;
    }

    connectedCallback() {
        this.renderizar();
        if (!this._eventosConfigurados) {
            this.configurarEventosGlobales();
            this._eventosConfigurados = true;
        }
    }

    configurarEventosGlobales() {
        this.addEventListener('libroAgregado', (e) => { this.agregarLibro(e.detail); });
        this.addEventListener('libroActualizado', (e) => { this.actualizarLibro(e.detail); });
        this.addEventListener('libroEliminado', (e) => { this.eliminarLibro(e.detail); });
        this.addEventListener('editarLibro', (e) => { this.editarLibro(e.detail); });
        this.addEventListener('buscarLibros', (e) => { this.buscarLibros(e.detail); });
        this.addEventListener('cancelarFormulario', () => { this.cambiarVista('libros'); });
        this.addEventListener('respuestaConfirmacion', (e) => { this.manejarRespuestaModal(e); });
        this.addEventListener('solicitarPrestamo', (e) => { this.abrirModalPrestamo(e.detail); });
        this.addEventListener('devolverLibro', (e) => { this.procesarDevolucion(e.detail); });
        this.addEventListener('confirmarPrestamo', (e) => { this.procesarPrestamo(e.detail.solicitante); });
    }

    configurarEventosVista() {
        this.shadowRoot.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.cambiarVista(e.currentTarget.dataset.view);
            });
        });
    }

    renderizar() {
        const librosDisponibles = this.libros.filter(b => b.status === 'disponible').length;
        const librosPrestados = this.libros.filter(b => b.status === 'prestado').length;
        const autoresUnicos = new Set(this.libros.map(b => b.author)).size;
        
        const vDashboard = this.vistaActual === 'dashboard' ? '' : 'hidden';
        const vLibros = this.vistaActual === 'libros' ? '' : 'hidden';
        const vAgregar = this.vistaActual === 'agregar-libro' ? '' : 'hidden';

        const navDashboard = this.vistaActual === 'dashboard' ? 'active' : '';
        const navLibros = this.vistaActual === 'libros' ? 'active' : '';
        const navAgregar = this.vistaActual === 'agregar-libro' ? 'active' : '';

        this.shadowRoot.innerHTML = `
            <style>
                @import url("src/assets/styles/global.css");
                @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");
                
                :host { display: block; min-height: 100vh; }
                
                .dashboard { 
                    display: grid; 
                    grid-template-columns: 240px 1fr; 
                    min-height: 100vh; 
                }
                
                .sidebar { 
                    background-color: var(--bg-sidebar); 
                    border-right: 1px solid var(--border-color);
                    padding: 1.5rem;
                    display: flex; flex-direction: column;
                }
                
                .logo { 
                    font-size: 1.25rem; font-weight: 800; color: var(--secondary-color); 
                    margin-bottom: 2.5rem; display: flex; align-items: center; gap: 0.5rem;
                }
                
                .nav-item { 
                    padding: 0.75rem 1rem; margin-bottom: 0.5rem; border-radius: 6px; 
                    cursor: pointer; color: var(--text-light); font-weight: 500; 
                    transition: all 0.2s; display: flex; align-items: center; gap: 10px;
                }
                
                .nav-item:hover { background-color: #f8fafc; color: var(--primary-color); }
                .nav-item.active { background-color: #e5e7eb; color: #111827; font-weight: 600; }
                
                .main-content { padding: 2rem; overflow-y: auto; }
                
                .stats-container { 
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
                    gap: 1.5rem; margin-bottom: 2.5rem; 
                }
                
                .content-area { margin-top: 0; }
                .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: var(--secondary-color); }
                
                .hidden { display: none; }
            </style>

            <div class="dashboard">
                <div class="sidebar">
                    <div class="logo"><i class="fas fa-book-open" style="color: var(--primary-color);"></i> Mi Biblioteca</div>
                    
                    <div class="nav-item ${navDashboard}" data-view="dashboard"><i class="fas fa-th-large"></i> Inicio</div>
                    <div class="nav-item ${navLibros}" data-view="libros"><i class="fas fa-list"></i> Gestión de Libros</div>
                    <div class="nav-item ${navAgregar}" data-view="agregar-libro"><i class="fas fa-plus-circle"></i> Ingreso de Libros</div>
                </div>

                <div class="main-content">
                    <div id="dashboard-view" class="view ${vDashboard}">
                        <div class="stats-container">
                            <tarjeta-estadisticas titulo="Total" valor="${this.libros.length}" tipo-icono="libro"></tarjeta-estadisticas>
                            <tarjeta-estadisticas titulo="Disponibles" valor="${librosDisponibles}" tipo-icono="check"></tarjeta-estadisticas>
                            <tarjeta-estadisticas titulo="Prestados" valor="${librosPrestados}" tipo-icono="reloj"></tarjeta-estadisticas>
                            <tarjeta-estadisticas titulo="Autores" valor="${autoresUnicos}" tipo-icono="autor"></tarjeta-estadisticas>
                        </div>
                        <div class="content-area">
                            <div class="section-title">Agregados Recientemente</div>
                            <lista-libros libros='${JSON.stringify(this.libros.slice(-4).reverse())}'></lista-libros>
                        </div>
                    </div>

                    <div id="libros-view" class="view ${vLibros}">
                        <div class="content-area">
                            <formulario-libro id="search-form" modo="busqueda"></formulario-libro>
                            <br>
                            <lista-libros libros='${JSON.stringify(this.libros)}' mostrar-acciones="true"></lista-libros>
                        </div>
                    </div>

                    <div id="agregar-libro-view" class="view ${vAgregar}">
                        <div class="content-area" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: var(--shadow-sm); max-width: 800px; margin: 0 auto;">
                            <h2 id="form-title" class="section-title">
                                ${this.libroSeleccionado ? 'Editar Información' : 'Ingresar Nuevo Libro'}
                            </h2>
                            <formulario-libro id="book-form" modo="agregar"></formulario-libro>
                        </div>
                    </div>
                </div>
            </div>
            
            <ventana-confirmacion id="confirmation-modal"></ventana-confirmacion>
            <prestamo-libro id="loan-modal"></prestamo-libro> 
        `;

        this.configurarEventosVista();
    }

    abrirModalPrestamo(libroId) {
        const libro = this.libros.find(b => b.id === libroId);
        if (libro) {
            this.libroAPrestarId = libroId;
            const modal = this.shadowRoot.getElementById('loan-modal');
            modal.setAttribute('titulo-libro', libro.title);
            modal.setAttribute('visible', 'true');
        }
    }

    procesarPrestamo(nombreSolicitante) {
        if (this.libroAPrestarId && nombreSolicitante) {
            const index = this.libros.findIndex(b => b.id === this.libroAPrestarId);
            if (index !== -1) {
                this.libros[index].status = 'prestado';
                this.libros[index].prestadoA = nombreSolicitante;
                this.guardarEnLocalStorage();
                this.renderizar();
                this.mostrarModal('Préstamo Registrado', `Libro asignado a: ${nombreSolicitante}`);
            }
        }
        this.libroAPrestarId = null;
    }

    procesarDevolucion(libroId) {
        const index = this.libros.findIndex(b => b.id === libroId);
        if (index !== -1) {
            const persona = this.libros[index].prestadoA;
            this.libros[index].status = 'disponible';
            this.libros[index].prestadoA = ''; 
            this.guardarEnLocalStorage();
            this.renderizar();
            this.mostrarModal('Devolución Exitosa', `Libro devuelto por: ${persona}`);
        }
    }

    buscarLibros(criterios) {
        let filtrados = this.libros;
        if (criterios.title) filtrados = filtrados.filter(b => b.title.toLowerCase().includes(criterios.title.toLowerCase()));
        if (criterios.author) filtrados = filtrados.filter(b => b.author.toLowerCase().includes(criterios.author.toLowerCase()));
        if (criterios.editorial) filtrados = filtrados.filter(b => (b.editorial || '').toLowerCase().includes(criterios.editorial.toLowerCase()));
        if (criterios.status && criterios.status !== 'todos') filtrados = filtrados.filter(b => b.status === criterios.status);
        
        const vistaLibros = this.shadowRoot.getElementById('libros-view');
        const listaLibros = vistaLibros.querySelector('lista-libros');
        if (listaLibros) listaLibros.setAttribute('libros', JSON.stringify(filtrados));
    }

    cambiarVista(vista) {
        this.vistaActual = vista;
        this.renderizar();
        if (vista === 'agregar-libro') {
            const formulario = this.shadowRoot.getElementById('book-form');
            if (this.libroSeleccionado) {
                formulario.setAttribute('datos-libro', JSON.stringify(this.libroSeleccionado));
            } else {
                formulario.removeAttribute('datos-libro');
            }
        } else {
            this.libroSeleccionado = null;
        }
    }
    
    agregarLibro(datosLibro) {
        const nuevoLibro = { id: Date.now(), ...datosLibro, status: 'disponible', prestadoA: '' };
        this.libros.push(nuevoLibro);
        this.guardarEnLocalStorage();
        this.mostrarModal('Éxito', 'Libro ingresado al sistema');
        this.cambiarVista('libros'); 
    }
    
    actualizarLibro(datosLibro) {
        const index = this.libros.findIndex(b => b.id === datosLibro.id);
        if (index !== -1) {
            const libroExistente = this.libros[index];
            this.libros[index] = { ...libroExistente, ...datosLibro };
            this.guardarEnLocalStorage();
            this.mostrarModal('Éxito', 'Libro actualizado');
            this.libroSeleccionado = null;
            this.cambiarVista('libros');
        }
    }

    eliminarLibro(libroId) {
        const libro = this.libros.find(b => b.id === libroId);
        this._libroAEliminarId = libroId;
        const modal = this.shadowRoot.getElementById('confirmation-modal');
        modal.setAttribute('titulo', 'Eliminar Libro');
        modal.setAttribute('mensaje', `¿Eliminar "${libro.title}" del sistema?`);
        modal.setAttribute('visible', 'true');
        modal.setAttribute('mostrar-cancelar', 'true');
    }

    editarLibro(libroId) {
        this.libroSeleccionado = this.libros.find(b => b.id === libroId);
        this.cambiarVista('agregar-libro');
    }

    manejarRespuestaModal(e) {
        if (e.detail.confirmado && this._libroAEliminarId) {
            this.libros = this.libros.filter(b => b.id !== this._libroAEliminarId);
            this.guardarEnLocalStorage();
            this.mostrarModal('Eliminado', 'Libro eliminado del sistema');
            this.renderizar(); 
            this._libroAEliminarId = null;
        }
    }
    
    mostrarModal(titulo, mensaje) {
        const modal = this.shadowRoot.getElementById('confirmation-modal');
        modal.setAttribute('titulo', titulo);
        modal.setAttribute('mensaje', mensaje);
        modal.setAttribute('visible', 'true');
        modal.setAttribute('mostrar-cancelar', 'false');
        setTimeout(() => { modal.setAttribute('visible', 'false'); }, 2000);
    }

    guardarEnLocalStorage() {
        localStorage.setItem('libraryBooks', JSON.stringify(this.libros));
    }
}

// CAMBIO 2: Registramos el nuevo nombre de clase, pero mantenemos la etiqueta para que el HTML no rompa
customElements.define('app-tablero', ComponenteContenedor);
