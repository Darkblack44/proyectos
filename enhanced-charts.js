// enhanced-charts-improved.js - Implementación mejorada de gráficos interactivos
(function() {
    // Verificar si Chart.js está disponible, si no, cargarlo dinámicamente
    if (typeof Chart === 'undefined') {
        console.log('Cargando Chart.js dinámicamente...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js';
        script.onload = initEnhancedCharts;
        document.head.appendChild(script);
    } else {
        initEnhancedCharts();
    }

    // Variables globales
    let datosOriginales = [];
    let chartsContainer = null;
    let chartInstances = {};
    let currentTab = 'departamentos';
    let currentLimit = 10;
    let isVisible = false;
    let showAllDataLabels = false;
    let mapZoomed = false;

    // Función principal de inicialización
    function initEnhancedCharts() {
        console.log('Inicializando gráficos mejorados...');
        
        // 1. Crear contenedor principal si no existe
        createChartsContainer();
        
        // 2. Configurar eventos para cargar datos
        setupDataLoadingEvents();
        
        // 3. Intentar cargar datos iniciales
        loadInitialData();

        // 4. Verificar nivel de zoom del mapa si existe
        checkMapZoomLevel();
    }

    // Verificar nivel de zoom del mapa
    function checkMapZoomLevel() {
        // Buscar instancia de mapa (asumiendo que usa Leaflet)
        if (window.map && typeof window.map.getZoom === 'function') {
            // Escuchar evento de zoom
            window.map.on('zoomend', function() {
                const zoomLevel = window.map.getZoom();
                mapZoomed = zoomLevel > 10; // Considerar zoom > 10 como "zoomed in"
                updateToggleButtonVisibility();
            });
        }
    }

    // Actualizar visibilidad del botón de toggle según zoom
    function updateToggleButtonVisibility() {
        const toggleBtn = chartsContainer.querySelector('.enhanced-toggle-btn');
        if (toggleBtn) {
            if (mapZoomed && !isVisible) {
                toggleBtn.style.opacity = '0.3';
                toggleBtn.style.transform = 'scale(0.8)';
            } else {
                toggleBtn.style.opacity = '1';
                toggleBtn.style.transform = 'scale(1)';
            }
        }
    }

    // Crear el contenedor principal para los gráficos
    function createChartsContainer() {
        // Verificar si ya existe
        if (document.getElementById('enhanced-charts-container')) {
            chartsContainer = document.getElementById('enhanced-charts-container');
            return;
        }
        
        // Crear estructura HTML
        chartsContainer = document.createElement('div');
        chartsContainer.id = 'enhanced-charts-container';
        
        // Agregar estilos
        const styles = document.createElement('style');
        styles.textContent = `
            #enhanced-charts-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .enhanced-toggle-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #2980b9, #3498db);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 12px 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(41, 128, 185, 0.4);
                z-index: 999; /* Reducido para no sobreponerse a controles del mapa */
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .enhanced-toggle-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(41, 128, 185, 0.5);
            }
            
            .enhanced-toggle-btn svg {
                width: 18px;
                height: 18px;
                fill: white;
            }
            
            .enhanced-charts-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.98);
                z-index: 9998;
                transform: translateY(100%);
                transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .enhanced-charts-panel.visible {
                transform: translateY(0);
            }
            
            .enhanced-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                background: linear-gradient(90deg, #f8f9fa, #ffffff);
                border-bottom: 1px solid #e1e4e8;
            }
            
            .enhanced-panel-title {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                color: #2c3e50;
            }
            
            .enhanced-close-btn {
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: #7f8c8d;
                transition: color 0.2s;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .enhanced-close-btn:hover {
                color: #e74c3c;
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .enhanced-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                padding: 15px 30px;
                background-color: #f8f9fa;
                align-items: center;
                justify-content: space-between;
            }
            
            .enhanced-tabs {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
            }
            
            .enhanced-tab-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 50px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                background-color: #e9ecef;
                color: #495057;
            }
            
            .enhanced-tab-btn:hover {
                background-color: #dee2e6;
            }
            
            .enhanced-tab-btn.active {
                background: linear-gradient(135deg, #2980b9, #3498db);
                color: white;
                box-shadow: 0 2px 8px rgba(41, 128, 185, 0.3);
            }
            
            .enhanced-control-buttons {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-left: auto;
            }
            
            .enhanced-limit-selector {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .enhanced-limit-label {
                font-weight: 600;
                color: #495057;
            }
            
            .enhanced-limit-select {
                padding: 8px 15px;
                border: 2px solid #e9ecef;
                border-radius: 50px;
                font-size: 14px;
                background-color: white;
                cursor: pointer;
                transition: border-color 0.2s;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 12px center;
                padding-right: 30px;
            }
            
            .enhanced-limit-select:hover {
                border-color: #ced4da;
            }
            
            .enhanced-limit-select:focus {
                outline: none;
                border-color: #3498db;
            }
            
            .enhanced-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
            }
            
            .enhanced-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #7f8c8d;
                gap: 15px;
            }
            
            .enhanced-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(52, 152, 219, 0.2);
                border-radius: 50%;
                border-top-color: #3498db;
                animation: spin 1s ease-in-out infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .enhanced-chart-container {
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                padding: 20px;
                margin-bottom: 20px;
                height: auto;
                min-height: 400px;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            
            .enhanced-chart-title {
                font-size: 18px;
                font-weight: 700;
                color: #2c3e50;
                margin: 0 0 5px 0;
                text-align: center;
            }
            
            .enhanced-chart-description {
                font-size: 14px;
                color: #7f8c8d;
                margin: 0 0 20px 0;
                text-align: center;
            }
            
            .enhanced-chart-wrapper {
                flex: 1;
                position: relative;
                min-height: 300px;
            }
            
            .enhanced-chart-actions {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                gap: 5px;
                z-index: 10;
            }
            
            .enhanced-color-btn, 
            .enhanced-label-btn {
                background: linear-gradient(135deg, #2980b9, #3498db);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 5px 10px;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }
            
            .enhanced-color-btn:hover,
            .enhanced-label-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
            
            .enhanced-data-grid {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                font-size: 13px;
            }
            
            .enhanced-data-grid th {
                background-color: #f8f9fa;
                padding: 8px;
                text-align: left;
                border: 1px solid #e9ecef;
                color: #495057;
                font-weight: 600;
            }
            
            .enhanced-data-grid td {
                padding: 8px;
                border: 1px solid #e9ecef;
            }
            
            .enhanced-data-grid tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .enhanced-data-grid tr:hover {
                background-color: #e9ecef;
            }
            
            .enhanced-grid-container {
                max-height: 200px;
                overflow-y: auto;
                margin-top: 20px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
            }
            
            .enhanced-chart-row {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .enhanced-chart-col {
                flex: 1;
                min-width: 0;
            }
            
            .enhanced-insights {
                padding: 15px;
                background-color: #ebf5fb;
                border-radius: 8px;
                margin-top: 15px;
                color: #2c3e50;
                font-size: 14px;
            }
            
            .enhanced-insights-title {
                font-weight: 700;
                margin-bottom: 10px;
            }
            
            .enhanced-insights-list {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            
            .enhanced-insights-list li {
                margin-bottom: 8px;
                padding-left: 20px;
                position: relative;
            }
            
            .enhanced-insights-list li:before {
                content: '';
                position: absolute;
                left: 0;
                top: 6px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #3498db;
            }
            
            .enhanced-footer {
                padding: 15px;
                text-align: center;
                background-color: #f8f9fa;
                color: #7f8c8d;
                font-size: 13px;
                border-top: 1px solid #e9ecef;
            }
            
            .enhanced-show-all-btn {
                background: linear-gradient(135deg, #16a085, #2ecc71);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 8px 15px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(22, 160, 133, 0.3);
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .enhanced-show-all-btn svg {
                width: 14px;
                height: 14px;
                fill: white;
            }
            
            .enhanced-show-all-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(22, 160, 133, 0.4);
            }
            
            .enhanced-show-all-btn.active {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
            }
            
            /* Estilo para etiquetas flotantes en gráficos */
            .enhanced-floating-label {
                position: absolute;
                padding: 4px 8px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
                pointer-events: none;
                z-index: 1000;
                white-space: nowrap;
            }
            
            /* Mejoras responsivas adicionales */
            @media (max-width: 1200px) {
                .enhanced-chart-row {
                    flex-direction: column;
                }
                
                .enhanced-chart-col {
                    width: 100%;
                }
            }
            
            @media (max-width: 992px) {
                .enhanced-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .enhanced-tabs {
                    justify-content: center;
                    margin-bottom: 10px;
                }
                
                .enhanced-control-buttons {
                    margin-left: 0;
                    justify-content: center;
                }
            }
            
            @media (max-width: 768px) {
                .enhanced-panel-header {
                    padding: 15px;
                }
                
                .enhanced-panel-title {
                    font-size: 20px;
                }
                
                .enhanced-controls {
                    padding: 10px 15px;
                }
                
                .enhanced-tabs {
                    width: 100%;
                    justify-content: space-between;
                }
                
                .enhanced-tab-btn {
                    padding: 8px 15px;
                    font-size: 13px;
                    flex: 1;
                    text-align: center;
                }
                
                .enhanced-limit-selector {
                    width: 100%;
                    justify-content: space-between;
                    margin-top: 10px;
                }
                
                .enhanced-chart-actions {
                    top: 5px;
                    right: 5px;
                }
                
                .enhanced-color-btn, 
                .enhanced-label-btn {
                    padding: 4px 8px;
                    font-size: 11px;
                }
                
                .enhanced-toggle-btn {
                    padding: 10px 15px;
                    font-size: 14px;
                    bottom: 15px;
                    right: 15px;
                }
            }
            
            @media (max-width: 576px) {
                .enhanced-content {
                    padding: 10px;
                }
                
                .enhanced-chart-container {
                    padding: 15px;
                    min-height: 350px;
                }
                
                .enhanced-chart-title {
                    font-size: 16px;
                }
                
                .enhanced-chart-description {
                    font-size: 12px;
                    margin-bottom: 15px;
                }
                
                .enhanced-chart-wrapper {
                    min-height: 250px;
                }
            }
            
            /* Optimización para leyendas en pantallas pequeñas */
            @media (max-width: 768px) {
                .legend-container {
                    max-height: 150px;
                    overflow-y: auto;
                    margin-top: 10px;
                    padding: 5px;
                    border-top: 1px solid #e9ecef;
                }
                
                .responsive-legend {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 8px;
                }
                
                .responsive-legend-item {
                    display: flex;
                    align-items: center;
                    font-size: 11px;
                    margin-right: 8px;
                }
                
                .responsive-legend-color {
                    width: 10px;
                    height: 10px;
                    margin-right: 4px;
                    border-radius: 2px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        
        // Agregar estructura HTML
        chartsContainer.innerHTML = `
            <button class="enhanced-toggle-btn">
                <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                Mostrar Gráficas
            </button>
            
            <div class="enhanced-charts-panel">
                <div class="enhanced-panel-header">
                    <h2 class="enhanced-panel-title">Dashboard</h2>
                    <button class="enhanced-close-btn">&times;</button>
                </div>
                
                <div class="enhanced-controls">
                    <div class="enhanced-tabs">
                        <button class="enhanced-tab-btn active" data-tab="departamentos">Por Departamentos</button>
                        <button class="enhanced-tab-btn" data-tab="generales">Por Municipios</button>
                        <button class="enhanced-tab-btn" data-tab="paises">Por Países</button>
                    </div>
                    
                    <div class="enhanced-control-buttons">
                        <div class="enhanced-limit-selector">
                            <label class="enhanced-limit-label">Mostrar:</label>
                            <select class="enhanced-limit-select">
                                <option value="5">Top 5</option>
                                <option value="10" selected>Top 10</option>
                                <option value="15">Top 15</option>
                                <option value="20">Top 20</option>
                                <option value="25">Top 25</option>
                                <option value="30">Top 30</option>
                                <option value="50">Top 50</option>
                            </select>
                        </div>
                        
                        <button class="enhanced-show-all-btn" id="show-all-values-btn">
                            <svg viewBox="0 0 24 24"><path d="M4 19h16v2H4v-2zm5-4h11v2H9v-2zm-5-4h16v2H4v-2zm5-4h11v2H9V7zm-5-4h16v2H4V3z"/></svg>
                            Mostrar Valores
                        </button>
                    </div>
                </div>
                
                <div class="enhanced-content">
                    <div class="enhanced-loading">
                        <div class="enhanced-spinner"></div>
                        <p>Cargando datos...</p>
                    </div>
                </div>
                
                <div class="enhanced-footer">
                    Dashboard
                </div>
            </div>
        `;
        
        document.body.appendChild(chartsContainer);
        
        // Configurar eventos UI
        setupUIEvents();
    }

    // Configurar eventos de la interfaz de usuario
    function setupUIEvents() {
        const toggleBtn = chartsContainer.querySelector('.enhanced-toggle-btn');
        const closeBtn = chartsContainer.querySelector('.enhanced-close-btn');
        const panel = chartsContainer.querySelector('.enhanced-charts-panel');
        const tabBtns = chartsContainer.querySelectorAll('.enhanced-tab-btn');
        const limitSelect = chartsContainer.querySelector('.enhanced-limit-select');
        const showAllBtn = chartsContainer.querySelector('.enhanced-show-all-btn');
        
        // Evento para mostrar/ocultar panel
        toggleBtn.addEventListener('click', function() {
            isVisible = !isVisible;
            panel.classList.toggle('visible', isVisible);
            toggleBtn.innerHTML = isVisible ? 
                `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> Ocultar Gráficas` : 
                `<svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg> Mostrar Gráficas`;
            
            if (isVisible && datosOriginales.length === 0) {
                // Si no hay datos cargados, intentar cargarlos
                loadInitialData();
            } else if (isVisible) {
                // Si ya hay datos, actualizar gráficos
                updateCharts();
            }
            
            // Actualizar visibilidad del botón según zoom
            updateToggleButtonVisibility();
        });
        
        // Evento para cerrar panel
        closeBtn.addEventListener('click', function() {
            isVisible = false;
            panel.classList.remove('visible');
            toggleBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg> Mostrar Gráficas`;
            
            // Actualizar visibilidad del botón según zoom
            updateToggleButtonVisibility();
        });
        
        // Eventos para cambio de pestaña
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentTab = this.dataset.tab;
                updateCharts();
            });
        });
        
        // Evento para cambio de límite
        limitSelect.addEventListener('change', function() {
            currentLimit = parseInt(this.value);
            updateCharts();
        });
        
        // Evento para mostrar todos los valores
        showAllBtn.addEventListener('click', function() {
            showAllDataLabels = !showAllDataLabels;
            this.classList.toggle('active', showAllDataLabels);
            
            // Actualizar texto e icono del botón
            if (showAllDataLabels) {
                this.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg> Ocultar Valores`;
                this.setAttribute('title', 'Ocultar valores en las gráficas');
            } else {
                this.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 19h16v2H4v-2zm5-4h11v2H9v-2zm-5-4h16v2H4v-2zm5-4h11v2H9V7zm-5-4h16v2H4V3z"/></svg> Mostrar Valores`;
                this.setAttribute('title', 'Mostrar valores en las gráficas');
            }
            
            // Actualizar todos los botones con la misma clase
            document.querySelectorAll('.enhanced-show-all-btn').forEach(btn => {
                if (btn !== this) {
                    btn.classList.toggle('active', showAllDataLabels);
                    btn.innerHTML = showAllDataLabels ? 
                        `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg> Ocultar Valores` : 
                        `<svg viewBox="0 0 24 24"><path d="M4 19h16v2H4v-2zm5-4h11v2H9v-2zm-5-4h16v2H4v-2zm5-4h11v2H9V7zm-5-4h16v2H4V3z"/></svg> Mostrar Valores`;
                }
            });
            
            // Regenerar los gráficos para aplicar cambios
            updateCharts();
            
            // Mostrar etiquetas manualmente si es necesario como fallback
            if (showAllDataLabels) {
                setTimeout(function() {
                    showAllLabelsManually();
                }, 300);
            } else {
                // Eliminar etiquetas manuales
                document.querySelectorAll('.enhanced-floating-label').forEach(label => {
                    label.remove();
                });
            }
        });
        
        // Función para mostrar etiquetas manualmente como fallback
        function showAllLabelsManually() {
            // Primero eliminar cualquier etiqueta existente
            document.querySelectorAll('.enhanced-floating-label').forEach(label => {
                label.remove();
            });
            
            if (!showAllDataLabels) return;
            
            // Recorrer todas las instancias de gráficos
            Object.entries(chartInstances).forEach(([key, chart]) => {
                if (!chart || !chart.data || !chart.data.datasets) return;
                
                // Obtener el contenedor del gráfico
                const canvas = chart.canvas;
                if (!canvas) return;
                
                const chartContainer = canvas.parentElement;
                if (!chartContainer) return;
                
                // Para cada conjunto de datos
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    if (!dataset.data) return;
                    
                    const meta = chart.getDatasetMeta(datasetIndex);
                    if (!meta || meta.hidden) return;
                    
                    // Para cada punto de datos
                    meta.data.forEach((element, index) => {
                        // Usar return en lugar de continue
                        if (!element || !element.getCenterPoint) return;
                        
                        try {
                            // Obtener posición del elemento
                            const position = element.getCenterPoint();
                            if (!position) return;
                            
                            // Obtener valor y formatear
                            const value = dataset.data[index];
                            if (value === undefined || value === null) return;
                            
                            let label = '';
                            
                            // Formatear según tipo de gráfico
                            if (chart.config.type === 'pie' || chart.config.type === 'doughnut') {
                                const chartLabel = chart.data.labels[index];
                                const total = dataset.data.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                
                                if (percentage > 3) {
                                    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
                                    label = `${chartLabel}: ${formattedValue} (${percentage}%)`;
                                } else {
                                    label = `${percentage}%`;
                                }
                            } else {
                                label = typeof value === 'number' ? value.toLocaleString() : value;
                            }
                            
                            // Crear etiqueta flotante
                            const labelElement = document.createElement('div');
                            labelElement.className = 'enhanced-floating-label';
                            labelElement.textContent = label;
                            
                            // Posicionar la etiqueta
                            labelElement.style.left = (position.x + canvas.offsetLeft) + 'px';
                            labelElement.style.top = (position.y + canvas.offsetTop - 20) + 'px';
                            
                            // Agregar al contenedor
                            chartContainer.appendChild(labelElement);
                        } catch (error) {
                            console.warn('Error al mostrar etiqueta manual:', error);
                        }
                    });
                });
            });
        }
        
        // Evento para tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isVisible) {
                isVisible = false;
                panel.classList.remove('visible');
                toggleBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg> Mostrar Gráficas`;
                
                // Actualizar visibilidad del botón según zoom
                updateToggleButtonVisibility();
            }
        });
    }

    // Configurar eventos para carga de datos
    function setupDataLoadingEvents() {
        // Escuchar cambios en el selector de archivos
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        processRawData(event.target.result);
                    };
                    reader.readAsText(file);
                }
            });
        }
        
        // Sobreescribir la función de actualización UI original
        const originalActualizarUI = window.actualizarUI;
        if (typeof originalActualizarUI === 'function') {
            window.actualizarUI = function(datos) {
                // Llamar a la función original primero
                originalActualizarUI(datos);
                
                // Actualizar nuestros datos también
                datosOriginales = datos;
                
                // Actualizar gráficos si son visibles
                if (isVisible) {
                    updateCharts();
                }
            };
        }
    }

    // Cargar datos iniciales
    function loadInitialData() {
        const contentDiv = chartsContainer.querySelector('.enhanced-content');
        contentDiv.innerHTML = `
            <div class="enhanced-loading">
                <div class="enhanced-spinner"></div>
                <p>Cargando datos...</p>
            </div>
        `;
        
        // Si ya hay datos cargados en la aplicación, usarlos
        if (window.datos && window.datos.length > 0) {
            console.log('Usando datos ya cargados en la aplicación');
            datosOriginales = window.datos;
            updateCharts();
            return;
        }
        
        // Intentar cargar datos desde servidor/archivo
        tryLoadDataFromSources();
    }

    // Intentar cargar datos desde varias fuentes
    async function tryLoadDataFromSources() {
        try {
            // 0. Prioridad máxima: Usar datos embebidos en datos-colombia.js
            if (window.datosColombiaTexto) {
                console.log('Usando datos precargados de datos-colombia.js');
                processRawData(window.datosColombiaTexto);
                return;
            }
            
            // 1. Intentar usar window.fs.readFile si está disponible
            if (window.fs && typeof window.fs.readFile === 'function') {
                try {
                    console.log('Intentando cargar datos con window.fs.readFile');
                    const fileContent = await window.fs.readFile('Datos.txt', { encoding: 'utf8' });
                    if (fileContent) {
                        processRawData(fileContent);
                        return;
                    }
                } catch (error) {
                    console.warn('Error al cargar con window.fs.readFile:', error);
                }
            }
            
            // 2. Intentar fetch desde varias rutas posibles
            const posiblesRutas = [
                'Datos.txt',
                './Datos.txt',
                '../Datos.txt',
                'datos/Datos.txt',
                './datos/Datos.txt'
            ];
            
            for (const ruta of posiblesRutas) {
                try {
                    console.log('Intentando cargar desde:', ruta);
                    const response = await fetch(ruta);
                    
                    if (response.ok) {
                        const texto = await response.text();
                        processRawData(texto);
                        console.log('Datos cargados exitosamente desde:', ruta);
                        return;
                    }
                } catch (e) {
                    console.warn('No se pudo cargar desde:', ruta);
                }
            }
            
            // 3. Intentar usar otros datos embebidos si existen
            if (window.datosColombiaEmbebidos) {
                console.log('Usando datos embebidos alternos');
                processRawData(window.datosColombiaEmbebidos);
                return;
            }
            
            // 4. Usar datos de demostración como último recurso
            console.log('Usando datos de demostración');
            processRawData(`25245\tEL COLEGIO
        5045\tAPARTADO
        25290\tFUSAGASUGA
        25290\tFUSAGASUGA
        25290\tFUSAGASUGA
        25290\tFUSAGASUGA
        11001\tBOGOTA D.C.`);
            
        } catch (error) {
            console.error('Error al intentar cargar datos:', error);
            showError('No se pudieron cargar los datos. Por favor, intente cargar el archivo manualmente.');
        }
    }

    // Procesar datos crudos
    function processRawData(texto) {
        try {
            const lineas = texto.trim().split('\n');
            const processed = [];
            
            lineas.forEach(linea => {
                if (!linea.trim()) return;
                
                const partes = linea.trim().split('\t');
                if (partes.length >= 2 && partes[0].trim() && partes[1].trim()) {
                    let codigo = partes[0].trim();
                    const municipio = partes[1].trim();
                    
                    // Manejar casos donde el código no es numérico
                    if (!/^\d+$/.test(codigo) && codigo.length > 0) {
                        const numeros = codigo.match(/\d+/);
                        if (numeros) {
                            codigo = numeros[0];
                        } else {
                            codigo = "99999";  // código no identificado
                        }
                    }
                    
                    // Extraer código de departamento (primeros 2 dígitos)
                    const codDepartamento = codigo.length >= 2 ? codigo.substring(0, 2) : '99';
                    
                    processed.push({
                        codigo,
                        municipio,
                        codDepartamento
                    });
                }
            });
            
            datosOriginales = processed;
            
            // Si el panel está visible, actualizar gráficos
            if (isVisible) {
                updateCharts();
            }
        } catch (error) {
            console.error('Error al procesar datos:', error);
            showError('Ocurrió un error al procesar los datos. Formato incorrecto.');
        }
    }

    // Mostrar error en el contenedor
    function showError(message) {
        const contentDiv = chartsContainer.querySelector('.enhanced-content');
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #e74c3c;">
                <svg viewBox="0 0 24 24" width="48" height="48" style="margin-bottom: 15px;">
                    <path fill="#e74c3c" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h3 style="margin-bottom: 10px; color: #e74c3c;">Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Actualizar gráficos basados en la pestaña actual y límite
    function updateCharts() {
        if (datosOriginales.length === 0) {
            console.warn('No hay datos para mostrar gráficos');
            return;
        }
        
        // Obtener contenedor y limpiar gráficos anteriores
        const contentDiv = chartsContainer.querySelector('.enhanced-content');
        contentDiv.innerHTML = '';
        Object.values(chartInstances).forEach(chart => chart.destroy());
        chartInstances = {};
        
        // Actualizar estado del botón de mostrar valores
        const showAllBtn = chartsContainer.querySelector('#show-all-values-btn');
        if (showAllBtn) {
            showAllBtn.classList.toggle('active', showAllDataLabels);
            showAllBtn.innerHTML = showAllDataLabels ? 
                `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg> Ocultar Valores` : 
                `<svg viewBox="0 0 24 24"><path d="M4 19h16v2H4v-2zm5-4h11v2H9v-2zm-5-4h16v2H4v-2zm5-4h11v2H9V7zm-5-4h16v2H4V3z"/></svg> Mostrar Valores`;
        }
        
        // Preparar datos según la pestaña activa
        let processedData;
        switch (currentTab) {
            case 'departamentos':
                processedData = processDepartmentData();
                renderDepartmentCharts(contentDiv, processedData);
                break;
            case 'generales':
                processedData = processMunicipalityData();
                renderMunicipalityCharts(contentDiv, processedData);
                break;
            case 'paises':
                processedData = processCountryData();
                renderCountryCharts(contentDiv, processedData);
                break;
            default:
                processedData = processDepartmentData();
                renderDepartmentCharts(contentDiv, processedData);
        }
    }

    // Generar colores aleatorios
    function generateRandomColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * 200) + 55; // Evitar colores muy oscuros
            const g = Math.floor(Math.random() * 200) + 55;
            const b = Math.floor(Math.random() * 200) + 55;
            colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
        return colors;
    }

    // Procesar datos para pestaña de departamentos
    function processDepartmentData() {
        const codigosANombresOficiales = {
            '91': 'Amazonas', '05': 'Antioquia', '81': 'Arauca',
            '08': 'Atlántico', '13': 'Bolívar', '15': 'Boyacá',
            '17': 'Caldas', '18': 'Caquetá', '85': 'Casanare',
            '19': 'Cauca', '20': 'Cesar', '27': 'Chocó',
            '23': 'Córdoba', '25': 'Cundinamarca', '94': 'Guainía',
            '95': 'Guaviare', '41': 'Huila', '44': 'La Guajira',
            '47': 'Magdalena', '50': 'Meta', '52': 'Nariño',
            '54': 'Norte de Santander', '86': 'Putumayo', '63': 'Quindío',
            '66': 'Risaralda', '88': 'San Andrés', '68': 'Santander',
            '70': 'Sucre', '73': 'Tolima', '76': 'Valle del Cauca',
            '97': 'Vaupés', '99': 'Vichada', '11': 'Bogotá D.C.'
        };
        
        // Contar departamentos
        const conteo = {};
        datosOriginales.forEach(dato => {
            const codDepartamento = dato.codDepartamento;
            conteo[codDepartamento] = (conteo[codDepartamento] || 0) + 1;
        });
        
        // Convertir a array y ordenar
        const departamentos = Object.entries(conteo)
            .map(([codigo, cantidad]) => ({
                codigo,
                nombre: codigosANombresOficiales[codigo] || `Departamento ${codigo}`,
                cantidad
            }))
            .sort((a, b) => b.cantidad - a.cantidad);
            
        // Calcular porcentajes y estadísticas
        const total = departamentos.reduce((sum, d) => sum + d.cantidad, 0);
        departamentos.forEach(d => {
            d.porcentaje = (d.cantidad / total) * 100;
        });
        
        // Calcular estadísticas adicionales
        const promedio = total / departamentos.length;
        const mediana = calcularMediana(departamentos.map(d => d.cantidad));
        const max = Math.max(...departamentos.map(d => d.cantidad));
        const min = Math.min(...departamentos.map(d => d.cantidad));
        
        return {
            departamentos: departamentos.slice(0, currentLimit),
            todos: departamentos,
            total,
            stats: {
                total,
                promedio,
                mediana,
                max,
                min,
                numDepartamentos: departamentos.length
            }
        };
    }

    // Procesar datos para pestaña de municipios
    function processMunicipalityData() {
        // Contar municipios
        const conteo = {};
        datosOriginales.forEach(dato => {
            conteo[dato.municipio] = (conteo[dato.municipio] || 0) + 1;
        });
        
        // Convertir a array y ordenar
        const municipios = Object.entries(conteo)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad);
            
        // Calcular porcentajes y estadísticas
        const total = municipios.reduce((sum, m) => sum + m.cantidad, 0);
        municipios.forEach(m => {
            m.porcentaje = (m.cantidad / total) * 100;
        });
        
        // Calcular estadísticas adicionales
        const promedio = total / municipios.length;
        const mediana = calcularMediana(municipios.map(m => m.cantidad));
        const max = Math.max(...municipios.map(m => m.cantidad));
        const min = Math.min(...municipios.map(m => m.cantidad));
        
        // Agrupar municipios por frecuencia
        const frecuencia = {
            alto: 0,
            medio: 0,
            bajo: 0
        };
        
        municipios.forEach(m => {
            if (m.cantidad >= promedio * 1.5) frecuencia.alto++;
            else if (m.cantidad >= promedio * 0.5) frecuencia.medio++;
            else frecuencia.bajo++;
        });
        
        return {
            municipios: municipios.slice(0, currentLimit),
            todos: municipios,
            total,
            stats: {
                total,
                promedio,
                mediana,
                max,
                min,
                numMunicipios: municipios.length,
                frecuencia
            }
        };
    }

    // Procesar datos para pestaña de países
    function processCountryData() {
        // Contar países
        const conteo = {
            'Colombia': 0,
            'Venezuela': 0,
            'Corea del Sur': 0,
            'Otros': 0
        };
        
        datosOriginales.forEach(dato => {
            if (dato.codigo === '862') conteo['Venezuela']++;
            else if (dato.codigo === '410') conteo['Corea del Sur']++;
            else if (/^\d+$/.test(dato.codigo)) conteo['Colombia']++;
            else conteo['Otros']++;
        });
        
        // Convertir a array
        const paises = Object.entries(conteo)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .filter(p => p.cantidad > 0)
            .sort((a, b) => b.cantidad - a.cantidad);
            
        // Calcular porcentajes
        const total = paises.reduce((sum, p) => sum + p.cantidad, 0);
        paises.forEach(p => {
            p.porcentaje = (p.cantidad / total) * 100;
        });
        
        // Array para gráfico de líneas - ordenado de menor a mayor
        const paisesPorCantidad = [...paises].sort((a, b) => a.cantidad - b.cantidad);
        
        return {
            paises,
            paisesPorCantidad,
            total
        };
    }

    // Renderizar gráficos para pestaña de departamentos
    function renderDepartmentCharts(container, data) {
        // Crear layout
        container.innerHTML = `
            <div class="enhanced-chart-row">
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Distribución por Departamentos</h3>
                        <p class="enhanced-chart-description">
                            Top ${currentLimit} departamentos con mayor número de registros (${data.stats.numDepartamentos} departamentos en total)
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="departamentos-bar-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="departamentos-bar-chart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Distribución Porcentual</h3>
                        <p class="enhanced-chart-description">
                            Porcentaje de registros por departamento (Total: ${data.total.toLocaleString()} registros)
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="departamentos-pie-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="departamentos-pie-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="enhanced-chart-row">
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Comparativa de Cantidades</h3>
                        <p class="enhanced-chart-description">
                            Visualización de la distribución de registros en escala horizontal
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="departamentos-horizontal-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="departamentos-horizontal-chart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Análisis y Estadísticas</h3>
                        <p class="enhanced-chart-description">
                            Información detallada sobre la distribución de registros
                        </p>
                        
                        <div class="enhanced-insights">
                            <h4 class="enhanced-insights-title">Datos generales</h4>
                            <ul class="enhanced-insights-list">
                                <li>Total de registros: <strong>${data.total.toLocaleString()}</strong></li>
                                <li>Departamentos con registros: <strong>${data.stats.numDepartamentos}</strong></li>
                                <li>Promedio de registros por departamento: <strong>${Math.round(data.stats.promedio).toLocaleString()}</strong></li>
                                <li>Mediana de registros: <strong>${data.stats.mediana.toLocaleString()}</strong></li>
                                <li>Departamento con más registros: <strong>${data.departamentos[0].nombre} (${data.departamentos[0].cantidad.toLocaleString()})</strong></li>
                                <li>Concentración en top 3: <strong>${(data.departamentos.slice(0, 3).reduce((sum, d) => sum + d.porcentaje, 0)).toFixed(1)}%</strong></li>
                            </ul>
                        </div>
                        
                        <div class="enhanced-grid-container">
                            <table class="enhanced-data-grid">
                                <thead>
                                    <tr>
                                        <th>Departamento</th>
                                        <th>Registros</th>
                                        <th>Porcentaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.departamentos.map((item, index) => `
                                        <tr>
                                            <td>${item.nombre}</td>
                                            <td>${item.cantidad.toLocaleString()}</td>
                                            <td>${item.porcentaje.toFixed(1)}%</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configuración común de etiquetas para todos los gráficos
        const commonPlugins = {
            datalabels: {
                display: function(context) {
                    return showAllDataLabels;
                },
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 4,
                padding: 6,
                font: {
                    weight: 'bold',
                    size: 11
                },
                formatter: function(value, context) {
                    // Adaptar el formato según el tipo de gráfico
                    if (context.chart.config.type === 'pie' || context.chart.config.type === 'doughnut') {
                        const label = context.chart.data.labels[context.dataIndex];
                        const shortLabel = label.length > 10 ? label.substring(0, 10) + '...' : label;
                        const dataValue = context.chart.data.datasets[0].data[context.dataIndex];
                        
                        // Mostrar porcentaje para gráficos circulares
                        if (typeof dataValue === 'number') {
                            if (dataValue < 1) {
                                return `${shortLabel}: ${dataValue.toFixed(1)}%`;
                            } else {
                                // Si es una cantidad, verificar si es porcentaje o valor absoluto
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = (dataValue / total * 100).toFixed(1);
                                
                                if (dataValue > 1000) {
                                    return `${shortLabel}: ${Math.round(dataValue).toLocaleString()} (${percentage}%)`;
                                } else {
                                    return `${shortLabel}: ${dataValue} (${percentage}%)`;
                                }
                            }
                        }
                        return `${shortLabel}: ${dataValue}`;
                    } else {
                        // Para gráficos de barras y otros, mostrar solo el valor
                        if (typeof value === 'number') {
                            if (value > 1000) {
                                return value.toLocaleString();
                            } else {
                                return value;
                            }
                        }
                        return value;
                    }
                },
                anchor: function(context) {
                    // Cambiar el anclaje dependiendo del tipo de gráfico
                    if (context.chart.config.type === 'pie' || context.chart.config.type === 'doughnut') {
                        return 'end';
                    } else if (context.chart.config.type === 'bar') {
                        return 'end';
                    } else if (context.chart.config.type === 'line') {
                        return 'center';
                    }
                    return 'center';
                },
                align: function(context) {
                    // Alinear según el tipo de gráfico
                    if (context.chart.config.type === 'pie' || context.chart.config.type === 'doughnut') {
                        return 'end';
                    } else if (context.chart.config.type === 'bar') {
                        return 'start';
                    }
                    return 'center';
                },
                offset: 8,
                // Evitar superposición de etiquetas
                overlap: false
            }
        };
        
        // Crear gráfico de barras
        const barCtx = document.getElementById('departamentos-bar-chart').getContext('2d');
        chartInstances.barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: data.departamentos.map(d => d.nombre),
                datasets: [{
                    label: 'Cantidad de Registros',
                    data: data.departamentos.map(d => d.cantidad),
                    backgroundColor: generateColorGradient('#3498db', '#2c3e50', data.departamentos.length),
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / data.total * 100).toFixed(1);
                                return `Registros: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                    // Configuración específica para etiquetas en barras
                    datalabels: {
                        ...commonPlugins.datalabels,
                        formatter: function(value, context) {
                            // Mostrar cantidad y porcentaje para barras
                            const percentage = (value / data.total * 100).toFixed(1);
                            if (value > 1000) {
                                return `${Math.round(value).toLocaleString()} (${percentage}%)`;
                            }
                            return `${value} (${percentage}%)`;
                        },
                        // Posicionar las etiquetas dentro de las barras para barras grandes
                        // y fuera para barras pequeñas
                        anchor: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value > data.stats.promedio ? 'center' : 'end';
                        },
                        align: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value > data.stats.promedio ? 'center' : 'start';
                        },
                        color: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value > data.stats.promedio ? '#fff' : '#000';
                        },
                        backgroundColor: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value > data.stats.promedio ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
                        },
                        offset: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value > data.stats.promedio ? 0 : 8;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: function(context) {
                                    // Ajustar tamaño de fuente según cantidad de etiquetas
                                    const width = context.chart.width;
                                    const size = Math.floor(width / data.departamentos.length);
                                    return Math.min(Math.max(size, 8), 12);
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // Crear gráfico de torta
        const pieCtx = document.getElementById('departamentos-pie-chart').getContext('2d');
        chartInstances.pieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: data.departamentos.map(d => d.nombre),
                datasets: [{
                    data: data.departamentos.map(d => d.porcentaje),
                    backgroundColor: generateColorGradient('#3498db', '#2c3e50', data.departamentos.length),
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = data.departamentos[context.dataIndex].cantidad;
                                const percentage = context.raw.toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        position: function(context) {
                            // Ajustar posición de leyenda según tamaño de pantalla
                            const width = context.chart.width;
                            return width < 600 ? 'bottom' : 'right';
                        },
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    },
                    // Configuración específica para etiquetas en gráfico de torta
                    datalabels: {
                        ...commonPlugins.datalabels,
                        formatter: function(value, context) {
                            // Para sectores grandes, mostrar el nombre y porcentaje
                            // Para sectores pequeños, solo mostrar porcentaje
                            const label = context.chart.data.labels[context.dataIndex];
                            const shortLabel = label.length > 10 ? label.substring(0, 10) + '...' : label;
                            const cantidad = data.departamentos[context.dataIndex].cantidad;
                            
                            if (value >= 5) { // Sectores con más del 5%
                                return `${shortLabel}: ${cantidad.toLocaleString()} (${value.toFixed(1)}%)`;
                            } else if (value >= 1) { // Sectores entre 1% y 5%
                                return `${shortLabel}: ${value.toFixed(1)}%`;
                            }
                            return `${value.toFixed(1)}%`; // Sectores muy pequeños
                        },
                        // Ajustar posición según el tamaño del sector
                        anchor: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value < 3 ? 'end' : 'center'; // Si es menor al 3%, colocar fuera
                        },
                        align: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value < 3 ? 'end' : 'center'; // Si es menor al 3%, alinear afuera
                        },
                        offset: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value < 3 ? 20 : 0; // Si es menor al 3%, dar offset
                        },
                        // Líneas de conexión para etiquetas externas
                        textAlign: 'center',
                        display: function(context) {
                            // Solo mostrar etiquetas cuando el botón está activado
                            // Y para sectores relevantes (por encima del 0.5%)
                            return showAllDataLabels && context.dataset.data[context.dataIndex] > 0.5;
                        },
                        clamp: true, // Evitar que etiquetas salgan del canvas
                        // Texto más pequeño para sectores pequeños
                        font: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return {
                                weight: 'bold',
                                size: value < 3 ? 9 : 11
                            };
                        }
                    }
                }
            }
        });
        
        // Crear gráfico horizontal
        const horizontalCtx = document.getElementById('departamentos-horizontal-chart').getContext('2d');
        chartInstances.horizontalChart = new Chart(horizontalCtx, {
            type: 'bar',
            data: {
                labels: data.departamentos.map(d => d.nombre),
                datasets: [{
                    label: 'Cantidad de Registros',
                    data: data.departamentos.map(d => d.cantidad),
                    backgroundColor: generateColorGradient('#3498db', '#2c3e50', data.departamentos.length),
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / data.total * 100).toFixed(1);
                                return `Registros: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                size: function(context) {
                                    // Ajustar tamaño de fuente según cantidad de etiquetas
                                    const height = context.chart.height;
                                    const size = Math.floor(height / data.departamentos.length);
                                    return Math.min(Math.max(size, 8), 12);
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // Configurar eventos para botones de colores aleatorios
        const colorBtns = container.querySelectorAll('.enhanced-color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const chartId = this.dataset.chart;
                const chart = chartInstances[getChartInstanceKey(chartId)];
                if (chart) {
                    const randomColors = generateRandomColors(data.departamentos.length);
                    chart.data.datasets[0].backgroundColor = randomColors;
                    chart.update();
                }
            });
        });
    }

    // Renderizar gráficos para pestaña de municipios
    function renderMunicipalityCharts(container, data) {
        // Crear layout
        container.innerHTML = `
            <div class="enhanced-chart-row">
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Distribución por Municipios</h3>
                        <p class="enhanced-chart-description">
                            Top ${currentLimit} municipios con mayor número de registros (${data.stats.numMunicipios} municipios en total)
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="municipios-bar-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="municipios-bar-chart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Comparación Porcentual</h3>
                        <p class="enhanced-chart-description">
                            Distribución de registros como porcentaje del total (${data.total.toLocaleString()} registros)
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="municipios-pie-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="municipios-pie-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="enhanced-chart-row">
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Concentración por Municipio</h3>
                        <p class="enhanced-chart-description">
                            Distribución acumulada de registros por municipio
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="municipios-line-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="municipios-line-chart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Análisis y Estadísticas</h3>
                        <p class="enhanced-chart-description">
                            Información detallada sobre la distribución de registros por municipio
                        </p>
                        
                        <div class="enhanced-insights">
                            <h4 class="enhanced-insights-title">Datos generales</h4>
                            <ul class="enhanced-insights-list">
                                <li>Total de registros: <strong>${data.total.toLocaleString()}</strong></li>
                                <li>Municipios con registros: <strong>${data.stats.numMunicipios}</strong></li>
                                <li>Promedio de registros por municipio: <strong>${Math.round(data.stats.promedio).toLocaleString()}</strong></li>
                                <li>Municipios con alta concentración: <strong>${data.stats.frecuencia.alto}</strong> municipios</li>
                                <li>Municipio con más registros: <strong>${data.municipios[0].nombre} (${data.municipios[0].cantidad.toLocaleString()})</strong></li>
                                <li>Concentración en top 5: <strong>${(data.municipios.slice(0, 5).reduce((sum, m) => sum + m.porcentaje, 0)).toFixed(1)}%</strong></li>
                            </ul>
                        </div>
                        
                        <div class="enhanced-grid-container">
                            <table class="enhanced-data-grid">
                                <thead>
                                    <tr>
                                        <th>Municipio</th>
                                        <th>Registros</th>
                                        <th>Porcentaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.municipios.map((item, index) => `
                                        <tr>
                                            <td>${item.nombre}</td>
                                            <td>${item.cantidad.toLocaleString()}</td>
                                            <td>${item.porcentaje.toFixed(1)}%</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configuración común de etiquetas para todos los gráficos
        const commonPlugins = {
            datalabels: {
                display: function(context) {
                    return showAllDataLabels;
                },
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 4,
                padding: 4,
                font: {
                    weight: 'bold',
                    size: 11
                },
                formatter: function(value, context) {
                    return value.toLocaleString();
                }
            }
        };
        
        // Crear gráfico de barras
        const barCtx = document.getElementById('municipios-bar-chart').getContext('2d');
        chartInstances.municipiosBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: data.municipios.map(m => m.nombre),
                datasets: [{
                    label: 'Cantidad de Registros',
                    data: data.municipios.map(m => m.cantidad),
                    backgroundColor: generateColorGradient('#16a085', '#1abc9c', data.municipios.length),
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / data.total * 100).toFixed(1);
                                return `Registros: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: function(context) {
                                    // Ajustar tamaño de fuente según cantidad de etiquetas
                                    const width = context.chart.width;
                                    const size = Math.floor(width / data.municipios.length);
                                    return Math.min(Math.max(size, 8), 11);
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // Crear gráfico de torta
        const pieCtx = document.getElementById('municipios-pie-chart').getContext('2d');
        chartInstances.municipiosPieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: data.municipios.map(m => m.nombre),
                datasets: [{
                    data: data.municipios.map(m => m.porcentaje),
                    backgroundColor: generateColorGradient('#16a085', '#1abc9c', data.municipios.length),
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = data.municipios[context.dataIndex].cantidad;
                                const percentage = context.raw.toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        position: function(context) {
                            // Ajustar posición de leyenda según tamaño de pantalla
                            const width = context.chart.width;
                            return width < 600 ? 'bottom' : 'right';
                        },
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
        
        // Crear gráfico de línea (acumulativo)
        const lineCtx = document.getElementById('municipios-line-chart').getContext('2d');
        
        // Calcular valores acumulados
        const acumulados = [];
        let acumulado = 0;
        data.municipios.forEach(m => {
            acumulado += m.cantidad;
            acumulados.push(acumulado);
        });
        
        // Calcular porcentajes acumulados
        const porcentajesAcumulados = acumulados.map(a => (a / data.total) * 100);
        
        chartInstances.municipiosLineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: data.municipios.map(m => m.nombre),
                datasets: [
                    {
                        label: 'Registros Acumulados',
                        data: acumulados,
                        borderColor: '#16a085',
                        backgroundColor: 'rgba(22, 160, 133, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Porcentaje Acumulado',
                        data: porcentajesAcumulados,
                        borderColor: '#e74c3c',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Registros acumulados: ${context.raw.toLocaleString()}`;
                                } else {
                                    return `Porcentaje acumulado: ${context.raw.toFixed(1)}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: function(context) {
                                    // Ajustar tamaño de fuente según cantidad de etiquetas
                                    const width = context.chart.width;
                                    const size = Math.floor(width / data.municipios.length);
                                    return Math.min(Math.max(size, 8), 11);
                                }
                            },
                            callback: function(value, index, values) {
                                // Mostrar menos etiquetas en pantallas pequeñas
                                const ctx = this.chart.ctx;
                                const width = ctx.canvas.width;
                                if (width < 500) {
                                    return index % Math.ceil(data.municipios.length / 6) === 0 ? 
                                        data.municipios[index].nombre : '';
                                } else if (width < 768) {
                                    return index % Math.ceil(data.municipios.length / 10) === 0 ?
                                        data.municipios[index].nombre : '';
                                }
                                return data.municipios[index].nombre;
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Registros'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Porcentaje'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
        
        // Configurar eventos para botones de colores aleatorios
        const colorBtns = container.querySelectorAll('.enhanced-color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const chartId = this.dataset.chart;
                const chart = chartInstances[getChartInstanceKey(chartId)];
                if (chart) {
                    const randomColors = generateRandomColors(data.municipios.length);
                    
                    if (chartId === 'municipios-line-chart') {
                        // Para gráfico de línea, cambiar colores de líneas
                        chart.data.datasets[0].borderColor = getRandomColor();
                        chart.data.datasets[0].backgroundColor = getRandomColorWithOpacity();
                        chart.data.datasets[1].borderColor = getRandomColor();
                    } else {
                        // Para otros gráficos
                        chart.data.datasets[0].backgroundColor = randomColors;
                    }
                    
                    chart.update();
                }
            });
        });
    }

    // Renderizar gráficos para pestaña de países
    function renderCountryCharts(container, data) {
        // Crear layout
        container.innerHTML = `
            <div class="enhanced-chart-row">
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Distribución por Países</h3>
                        <p class="enhanced-chart-description">
                            Distribución de registros por países (Total: ${data.total.toLocaleString()} registros)
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="paises-pie-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="paises-pie-chart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Comparativa entre Países</h3>
                        <p class="enhanced-chart-description">
                            Cantidad de registros por país
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="paises-bar-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="paises-bar-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="enhanced-chart-row">
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Tendencia por País</h3>
                        <p class="enhanced-chart-description">
                            Distribución ordenada de menor a mayor
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="paises-trend-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper">
                            <canvas id="paises-trend-chart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Análisis y Estadísticas</h3>
                        <p class="enhanced-chart-description">
                            Información detallada sobre la distribución de registros por país
                        </p>
                        
                        <div class="enhanced-insights">
                            <h4 class="enhanced-insights-title">Datos generales</h4>
                            <ul class="enhanced-insights-list">
                                <li>Total de registros: <strong>${data.total.toLocaleString()}</strong></li>
                                <li>Países detectados: <strong>${data.paises.length}</strong></li>
                                <li>País con más registros: <strong>${data.paises[0].nombre} (${data.paises[0].cantidad.toLocaleString()})</strong></li>
                                <li>Concentración en Colombia: <strong>${(data.paises.find(p => p.nombre === 'Colombia')?.porcentaje || 0).toFixed(1)}%</strong></li>
                            </ul>
                        </div>
                        
                        <div class="enhanced-grid-container">
                            <table class="enhanced-data-grid">
                                <thead>
                                    <tr>
                                        <th>País</th>
                                        <th>Registros</th>
                                        <th>Porcentaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.paises.map((item, index) => `
                                        <tr>
                                            <td>${item.nombre}</td>
                                            <td>${item.cantidad.toLocaleString()}</td>
                                            <td>${item.porcentaje.toFixed(1)}%</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="enhanced-chart-row">
                <div class="enhanced-chart-col">
                    <div class="enhanced-chart-container">
                        <h3 class="enhanced-chart-title">Distribución Geográfica</h3>
                        <p class="enhanced-chart-description">
                            Visualización de la distribución global de registros
                        </p>
                        <div class="enhanced-chart-actions">
                            <button class="enhanced-color-btn" data-chart="paises-polar-chart">
                                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/></svg>
                                Colores
                            </button>
                        </div>
                        <div class="enhanced-chart-wrapper" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                            <div style="width: 100%; max-width: 300px; text-align: center; margin-top: 20px;">
                                <div class="large-percentage" style="font-size: 36px; font-weight: bold; color: #3498db; margin-bottom: 10px;">${(data.paises.find(p => p.nombre === 'Colombia')?.porcentaje || 0).toFixed(1)}%</div>
                                <div style="font-size: 16px; margin-bottom: 30px;">Registros de Colombia</div>
                            </div>
                            
                            <div style="width: 100%; margin-top: 10px;">
                                <canvas id="paises-polar-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configuración común de etiquetas para todos los gráficos
        const commonPlugins = {
            datalabels: {
                display: function(context) {
                    return showAllDataLabels;
                },
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 4,
                padding: 4,
                font: {
                    weight: 'bold',
                    size: 11
                },
                formatter: function(value, context) {
                    return value.toLocaleString();
                }
            }
        };
        
        // Colores por defecto para países
        const defaultColors = [
            '#3498db',
            '#e74c3c',
            '#f1c40f',
            '#9b59b6',
            '#1abc9c'
        ];
        
        // Crear gráfico de torta
        const pieCtx = document.getElementById('paises-pie-chart').getContext('2d');
        chartInstances.paisesPieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: data.paises.map(p => p.nombre),
                datasets: [{
                    data: data.paises.map(p => p.cantidad),
                    backgroundColor: defaultColors,
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / data.total * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        position: function(context) {
                            // Ajustar posición de leyenda según tamaño de pantalla
                            const width = context.chart.width;
                            return width < 600 ? 'bottom' : 'right';
                        }
                    }
                }
            }
        });
        
        // Crear gráfico de barras
        const barCtx = document.getElementById('paises-bar-chart').getContext('2d');
        chartInstances.paisesBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: data.paises.map(p => p.nombre),
                datasets: [{
                    label: 'Cantidad de Registros',
                    data: data.paises.map(p => p.cantidad),
                    backgroundColor: defaultColors,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / data.total * 100).toFixed(1);
                                return `Registros: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        
        // Crear gráfico de línea para tendencia (nueva característica)
        const trendCtx = document.getElementById('paises-trend-chart').getContext('2d');
        chartInstances.paisesTrendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: data.paisesPorCantidad.map(p => p.nombre),
                datasets: [{
                    label: 'Registros por País',
                    data: data.paisesPorCantidad.map(p => p.cantidad),
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: '#3498db',
                    borderWidth: 3,
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: '#2980b9',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / data.total * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        
        // Crear gráfico polar
        const polarCtx = document.getElementById('paises-polar-chart').getContext('2d');
        chartInstances.paisesPolarChart = new Chart(polarCtx, {
            type: 'polarArea',
            data: {
                labels: data.paises.map(p => p.nombre),
                datasets: [{
                    data: data.paises.map(p => p.cantidad),
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(231, 76, 60, 0.7)',
                        'rgba(241, 196, 15, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(26, 188, 156, 0.7)'
                    ],
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / data.total * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
        
        // Configurar eventos para botones de colores aleatorios
        const colorBtns = container.querySelectorAll('.enhanced-color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const chartId = this.dataset.chart;
                const chart = chartInstances[getChartInstanceKey(chartId)];
                if (chart) {
                    if (chartId === 'paises-trend-chart') {
                        // Para gráfico de tendencia
                        const newColor = getRandomColor();
                        chart.data.datasets[0].borderColor = newColor;
                        chart.data.datasets[0].backgroundColor = getRandomColorWithOpacity(newColor);
                        chart.data.datasets[0].pointBackgroundColor = getDarkerColor(newColor);
                        chart.update();
                    } else {
                        // Para otros gráficos
                        const randomColors = generateRandomColors(data.paises.length);
                        chart.data.datasets[0].backgroundColor = randomColors;
                        chart.update();
                    }
                }
            });
        });
    }

    // Funciones de utilidad

    // Obtener clave de instancia de gráfico desde ID
    function getChartInstanceKey(chartId) {
        // Mapear ID de elementos a claves de instancias de gráfico
        const mapping = {
            'departamentos-bar-chart': 'barChart',
            'departamentos-pie-chart': 'pieChart',
            'departamentos-horizontal-chart': 'horizontalChart',
            'municipios-bar-chart': 'municipiosBarChart',
            'municipios-pie-chart': 'municipiosPieChart',
            'municipios-line-chart': 'municipiosLineChart',
            'paises-pie-chart': 'paisesPieChart',
            'paises-bar-chart': 'paisesBarChart',
            'paises-trend-chart': 'paisesTrendChart',
            'paises-polar-chart': 'paisesPolarChart'
        };
        
        return mapping[chartId] || chartId;
    }

    // Calcular la mediana de un array de números
    function calcularMediana(numeros) {
        const sortedNumbers = [...numeros].sort((a, b) => a - b);
        const middle = Math.floor(sortedNumbers.length / 2);
        
        if (sortedNumbers.length % 2 === 0) {
            return (sortedNumbers[middle - 1] + sortedNumbers[middle]) / 2;
        } else {
            return sortedNumbers[middle];
        }
    }

    // Generar gradiente de colores
    function generateColorGradient(startColor, endColor, steps) {
        const start = hexToRgb(startColor);
        const end = hexToRgb(endColor);
        const colors = [];
        
        for (let i = 0; i < steps; i++) {
            const r = Math.round(start.r + (end.r - start.r) * (i / (steps - 1)));
            const g = Math.round(start.g + (end.g - start.g) * (i / (steps - 1)));
            const b = Math.round(start.b + (end.b - start.b) * (i / (steps - 1)));
            
            colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
        
        return colors;
    }

    // Convertir color hexadecimal a RGB
    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    // Generar color aleatorio
    function getRandomColor() {
        const r = Math.floor(Math.random() * 200) + 55;
        const g = Math.floor(Math.random() * 200) + 55;
        const b = Math.floor(Math.random() * 200) + 55;
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Generar color aleatorio con opacidad
    function getRandomColorWithOpacity(baseColor) {
        if (baseColor) {
            // Extraer componentes RGB
            const match = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                const r = parseInt(match[1]);
                const g = parseInt(match[2]);
                const b = parseInt(match[3]);
                return `rgba(${r}, ${g}, ${b}, 0.2)`;
            }
        }
        
        const r = Math.floor(Math.random() * 200) + 55;
        const g = Math.floor(Math.random() * 200) + 55;
        const b = Math.floor(Math.random() * 200) + 55;
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    
    // Obtener color más oscuro
    function getDarkerColor(baseColor) {
        // Extraer componentes RGB
        const match = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = Math.max(0, parseInt(match[1]) - 40);
            const g = Math.max(0, parseInt(match[2]) - 40);
            const b = Math.max(0, parseInt(match[3]) - 40);
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        return baseColor;
    }
})();
