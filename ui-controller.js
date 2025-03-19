// Control de la interfaz de usuario y eventos
const UIController = {
    // Estado de la interfaz
    estado: {
        enPantallaCompleta: false
    },
    
    // Inicializar eventos de la interfaz
    inicializar: function() {
        this.configurarEventoInputArchivo();
        this.configurarMenuDesplegable();
        this.configurarPantallaCompleta();
        this.configurarPanelEstadisticas();
    },
    
    // Ocultar mensajes de carga
    ocultarCargando: function() {
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => el.style.display = 'none');
    },
    
    // Configurar eventos para elementos clicables
    configurarEventosClicables: function() {
        document.querySelectorAll('.clickable-item, .lugar-item, .departamento-item').forEach(item => {
            item.addEventListener('click', function() {
                const tipo = this.dataset.tipo;
                const nombre = this.dataset.nombre;
                const codigo = this.dataset.codigo;
                
                if (tipo === 'municipio') {
                    UIController.enfocarMunicipio(nombre);
                } else if (tipo === 'departamento') {
                    UIController.enfocarDepartamento(codigo, nombre);
                }
            });
        });
    },
    
    // Enfocar municipio en el mapa
    enfocarMunicipio: function(nombreMunicipio) {
        if (MapConfig.coordsMunicipios[nombreMunicipio]) {
            const [lat, lng] = MapConfig.coordsMunicipios[nombreMunicipio];
            
            // Moverse a la ubicación del municipio con animación
            window.map.flyTo([lat, lng], 11, {
                animate: true,
                duration: 1.5
            });
            
            // Buscar el marcador correspondiente y mostrar su popup
            const marcador = window.municipioMarcadores.find(m => {
                const popupContent = m.getPopup().getContent();
                return popupContent.includes(nombreMunicipio);
            });
            
            if (marcador) {
                // Agregar clase para resaltar el marcador
                marcador._icon.classList.add('marker-active');
                marcador.openPopup();
                
                // Quitar la clase después de un tiempo
                setTimeout(() => {
                    if (marcador._icon) {
                        marcador._icon.classList.remove('marker-active');
                    }
                }, 3000);
            } else {
                // Si no hay marcador, crear uno temporal con la información
                const municipioData = Object.entries(window.conteoMunicipios)
                    .find(([municipio]) => municipio === nombreMunicipio);
                
                if (municipioData) {
                    const [municipio, cantidad] = municipioData;
                    const porcentaje = (cantidad / window.datos.length * 100).toFixed(1);
                    
                    const tempMarker = L.marker([lat, lng]).addTo(window.map);
                    tempMarker.bindPopup(`
                        <div class="info-box">
                            <div class="info-title">${municipio}</div>
                            <div class="info-content">
                                Registros: <span class="info-value">${cantidad.toLocaleString()}</span><br>
                                Porcentaje: <span class="info-value">${porcentaje}%</span>
                            </div>
                        </div>
                    `).openPopup();
                    
                    // Eliminar el marcador después de un tiempo
                    setTimeout(() => {
                        window.map.removeLayer(tempMarker);
                    }, 5000);
                }
            }
        }
    },
    
    // Enfocar departamento en el mapa
    enfocarDepartamento: function(codigoDepartamento, nombreDepartamento) {
        if (MapConfig.coordsDepartamentos[codigoDepartamento]) {
            const [lat, lng] = MapConfig.coordsDepartamentos[codigoDepartamento];
            
            // Moverse a la ubicación del departamento con animación
            window.map.flyTo([lat, lng], 8, {
                animate: true,
                duration: 1.5
            });
            
            // Buscar el círculo correspondiente y mostrar su tooltip
            const circulo = window.departamentoCirculos.find(c => {
                const tooltipContent = c.getTooltip().getContent();
                return tooltipContent.includes(nombreDepartamento);
            });
            
            if (circulo) {
                // Resaltar el círculo temporalmente
                const originalOptions = {
                    fillOpacity: circulo.options.fillOpacity,
                    weight: circulo.options.weight
                };
                
                circulo.setStyle({
                    fillOpacity: 0.9,
                    weight: 3
                });
                
                circulo.openTooltip();
                
                // Restaurar el estilo original después de un tiempo
                setTimeout(() => {
                    circulo.setStyle(originalOptions);
                }, 3000);
            } else {
                // Si no hay círculo, crear uno temporal con la información
                const deptoData = Object.entries(window.conteoDepartamentos)
                    .find(([codigo]) => codigo === codigoDepartamento);
                
                if (deptoData) {
                    const [codigo, cantidad] = deptoData;
                    const porcentaje = (cantidad / window.datos.length * 100).toFixed(1);
                    
                    const tempCircle = L.circle([lat, lng], {
                        color: '#333',
                        weight: 2,
                        fillColor: '#2980b9',
                        fillOpacity: 0.8,
                        radius: 30000
                    }).addTo(window.map);
                    
                    tempCircle.bindTooltip(`
                        <div class="info-box">
                            <div class="info-title">${nombreDepartamento}</div>
                            <div class="info-content">
                                Registros: <span class="info-value">${cantidad.toLocaleString()}</span><br>
                                Porcentaje: <span class="info-value">${porcentaje}%</span>
                            </div>
                        </div>
                    `, { permanent: true }).openTooltip();
                    
                    // Eliminar el círculo después de un tiempo
                    setTimeout(() => {
                        window.map.removeLayer(tempCircle);
                    }, 5000);
                }
            }
        }
    },
    
    // Configurar evento de carga de archivo
    configurarEventoInputArchivo: function() {
        document.getElementById('file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const texto = event.target.result;
                    const datosProcessed = DataProcessor.procesarDatos(texto);
                    DataProcessor.actualizarUI(datosProcessed);
                };
                reader.readAsText(file);
            }
        });
    },
    
    // Configurar menús desplegables
    configurarMenuDesplegable: function() {
        // Configurar el menú desplegable principal
        this.configurarMenu(
            'lugares-dropdown-btn',
            'lugares-dropdown-content',
            'lugar-search',
            '.lugar-item'
        );
        
        // Configurar el menú desplegable en pantalla completa
        this.configurarMenu(
            'lugares-dropdown-btn-fs',
            'lugares-dropdown-content-fs',
            'lugar-search-fs',
            '.lugar-item'
        );
    },
    
    // Función para configurar un menú desplegable
    configurarMenu: function(btnId, contentId, searchId, itemSelector) {
        const dropdownBtn = document.getElementById(btnId);
        const dropdownContent = document.getElementById(contentId);
        const searchInput = document.getElementById(searchId);
        
        if (!dropdownBtn || !dropdownContent) return;
        
        const dropdownIcon = dropdownBtn.querySelector('.dropdown-icon');
        
        // Toggle del menú desplegable
        dropdownBtn.addEventListener('click', function() {
            dropdownContent.classList.toggle('show');
            if (dropdownIcon) dropdownIcon.classList.toggle('open');
        });
        
        // Cerrar el menú desplegable si se hace clic fuera de él
        document.addEventListener('click', function(event) {
            if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
                dropdownContent.classList.remove('show');
                if (dropdownIcon) dropdownIcon.classList.remove('open');
            }
        });
        
        // Filtrar lugares al escribir en el buscador
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchText = this.value.toLowerCase();
                const items = dropdownContent.querySelectorAll(itemSelector);
                
                items.forEach(item => {
                    const text = item.querySelector('span:first-child').textContent.toLowerCase();
                    if (text.includes(searchText)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    },
    
    // Configurar funcionalidad de pantalla completa
    configurarPantallaCompleta: function() {
        const mapElement = document.getElementById('map');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        // Agregar evento de clic al botón de pantalla completa
        fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
        
        // Agregar soporte para la tecla ESC para salir de pantalla completa
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.estado.enPantallaCompleta) {
                this.toggleFullscreen();
            }
        });
    },
    
    // Activar/desactivar pantalla completa
    toggleFullscreen: function() {
        const mapElement = document.getElementById('map');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const statsPanel = document.getElementById('stats-panel');
        const statsToggle = document.getElementById('stats-toggle');
        
        if (!this.estado.enPantallaCompleta) {
            // Activar pantalla completa
            mapElement.classList.add('map-fullscreen');
            fullscreenBtn.innerHTML = '<span class="fullscreen-exit-icon"></span>Salir';
            
            // Pequeña pausa para asegurar que el panel se muestre correctamente
            setTimeout(() => {
                statsPanel.classList.add('show');
            }, 50);
            this.estado.enPantallaCompleta = true;
            
            // Mostrar el botón para mostrar/ocultar estadísticas y abrir el panel automáticamente
            statsToggle.classList.add('active');
            statsPanel.classList.add('active');
            statsPanel.classList.add('show');
            statsToggle.innerHTML = 'Ocultar';
            
            // Hacer que el botón de estadísticas se atenúe después de un tiempo
            setTimeout(() => {
                statsToggle.classList.add('fade-out');
            }, 3000);
            
            // Restaurar la opacidad al pasar el mouse
            statsToggle.addEventListener('mouseenter', function() {
                this.classList.remove('fade-out');
            });
            
            statsToggle.addEventListener('mouseleave', function() {
                if (statsPanel.classList.contains('show')) {
                    this.classList.add('fade-out');
                }
            });
            
            // Notificar a Leaflet que el tamaño del contenedor ha cambiado
            setTimeout(() => {
                window.map.invalidateSize();
            }, 100);
        } else {
            // Desactivar pantalla completa
            mapElement.classList.remove('map-fullscreen');
            fullscreenBtn.innerHTML = '<span class="fullscreen-icon"></span>Pantalla completa';
            this.estado.enPantallaCompleta = false;
            
            // Ocultar el panel de estadísticas y su botón
            statsToggle.classList.remove('active');
            statsPanel.classList.remove('active');
            statsPanel.classList.remove('show');
            
            // Notificar a Leaflet que el tamaño del contenedor ha cambiado
            setTimeout(() => {
                window.map.invalidateSize();
            }, 100);
        }
    },
    
    // Configurar panel de estadísticas
    configurarPanelEstadisticas: function() {
        const statsToggle = document.getElementById('stats-toggle');
        const statsPanel = document.getElementById('stats-panel');
        const statsClose = document.getElementById('stats-close');
        
        // Agregar evento de clic al botón de estadísticas
        statsToggle.addEventListener('click', this.toggleStatsPanel);
        
        // Agregar evento de clic al botón de cerrar estadísticas
        statsClose.addEventListener('click', this.toggleStatsPanel);
    },
    
    // Mostrar/ocultar panel de estadísticas
    toggleStatsPanel: function() {
        const statsPanel = document.getElementById('stats-panel');
        const statsToggle = document.getElementById('stats-toggle');
        
        statsPanel.classList.toggle('show');
        
        // Cambiar el texto del botón
        if (statsPanel.classList.contains('show')) {
            statsToggle.innerHTML = 'Ocultar';
            setTimeout(() => {
                statsToggle.classList.add('fade-out');
            }, 2000);
        } else {
            statsToggle.innerHTML = 'Estadísticas';
            statsToggle.classList.remove('fade-out');
        }
    }
};