// Funciones para procesar y analizar datos
const DataProcessor = {
    // Procesar los datos del archivo en formato texto
    procesarDatos: function(texto) {
        const lineas = texto.trim().split('\n');
        const datos = [];
        
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
                
                datos.push({
                    codigo,
                    municipio,
                    codDepartamento
                });
            }
        });
        
        return datos;
    },
    
    // Limpiar el mapa antes de actualizarlo
    limpiarMapa: function() {
        // Remover círculos de departamentos
        window.departamentoCirculos.forEach(circle => window.map.removeLayer(circle));
        window.departamentoCirculos = [];
        
        // Remover marcadores de municipios
        window.municipioMarcadores.forEach(marker => window.map.removeLayer(marker));
        window.municipioMarcadores = [];
    },
    
    // Actualizar la interfaz con los datos procesados
    actualizarUI: function(datos) {
        // Guardar los datos procesados globalmente
        window.datos = datos;
        
        // Limpiar el mapa antes de actualizar
        this.limpiarMapa();
        
        // Calcular conteo por municipio
        window.conteoMunicipios = {};
        datos.forEach(dato => {
            window.conteoMunicipios[dato.municipio] = (window.conteoMunicipios[dato.municipio] || 0) + 1;
        });
        
        // Calcular conteo por departamento
        window.conteoDepartamentos = {};
        datos.forEach(dato => {
            const codDepartamento = dato.codDepartamento;
            
            // Verificar si es un departamento oficial
            if (MapConfig.codigosANombresOficiales[codDepartamento]) {
                window.conteoDepartamentos[codDepartamento] = (window.conteoDepartamentos[codDepartamento] || 0) + 1;
            }
        });
        
        // Convertir a arrays para ordenar
        const municipiosArray = Object.entries(window.conteoMunicipios)
            .map(([municipio, cantidad]) => ({ municipio, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad);
        
        // Crear array de departamentos solo con los departamentos oficiales presentes en los datos
        const departamentosArray = Object.entries(window.conteoDepartamentos)
            .map(([codigo, cantidad]) => {
                const nombreOficial = MapConfig.codigosANombresOficiales[codigo] || `Departamento ${codigo}`;
                const capital = MapConfig.departamentosOficiales[nombreOficial] || '';
                
                return {
                    codigo,
                    departamento: nombreOficial,
                    capital,
                    cantidad
                };
            })
            .sort((a, b) => b.cantidad - a.cantidad);
            
        // Contar departamentos presentes en los datos
        const departamentosPresentes = departamentosArray.length;
        
        // Actualizar los números en las estadísticas
        document.getElementById('total-registros').textContent = datos.length.toLocaleString();
        document.getElementById('total-municipios').textContent = municipiosArray.length.toLocaleString();
        document.getElementById('total-departamentos').textContent = departamentosPresentes;
        
        // Actualizar estadísticas en el panel de pantalla completa
        document.getElementById('total-registros-fs').textContent = datos.length.toLocaleString();
        document.getElementById('total-municipios-fs').textContent = municipiosArray.length.toLocaleString();
        document.getElementById('total-departamentos-fs').textContent = departamentosPresentes;
        
        // Actualizar el contador de departamentos visualizado
        document.getElementById('dept-count').textContent = departamentosPresentes;
        document.getElementById('dept-total').textContent = MapConfig.TOTAL_DEPARTAMENTOS_OFICIALES;
        document.getElementById('dept-count-fs').textContent = departamentosPresentes;
        document.getElementById('dept-total-fs').textContent = MapConfig.TOTAL_DEPARTAMENTOS_OFICIALES;
        
        // Actualizar las estadísticas principales
        if (municipiosArray.length > 0) {
            document.getElementById('stat-principal').textContent = municipiosArray[0].municipio;
            document.getElementById('stat-principal-value').textContent = municipiosArray[0].cantidad.toLocaleString();
        }
        
        if (departamentosArray.length > 0) {
            document.getElementById('stat-depto').textContent = departamentosArray[0].departamento;
            document.getElementById('stat-depto-value').textContent = departamentosArray[0].cantidad.toLocaleString();
        }
        
        // Actualizar la lista de top municipios con elementos clicables
        const topMunicipiosHtml = municipiosArray.slice(0, 10).map((item, index) => `
            <div class="clickable-item" data-tipo="municipio" data-nombre="${item.municipio}">
                <span class="item-name">${index + 1}. ${item.municipio}</span>
                <span class="item-value">${item.cantidad.toLocaleString()}</span>
            </div>
        `).join('');
        
        document.getElementById('top-municipios').innerHTML = topMunicipiosHtml;
        document.getElementById('top-municipios-fs').innerHTML = topMunicipiosHtml;
        
        // Actualizar la lista de top departamentos con elementos clicables
        const topDepartamentosHtml = departamentosArray.slice(0, 5).map((item, index) => `
            <div class="clickable-item" data-tipo="departamento" data-codigo="${item.codigo}" data-nombre="${item.departamento}">
                <span class="item-name">${index + 1}. ${item.departamento}</span>
                <span class="item-value">${item.cantidad.toLocaleString()}</span>
            </div>
        `).join('');
        
        document.getElementById('top-departamentos').innerHTML = topDepartamentosHtml;
        document.getElementById('top-departamentos-fs').innerHTML = topDepartamentosHtml;
        
        // Extraer y actualizar la sección de países extranjeros
        const paisesExtranjeros = ['VENEZUELA', 'COREA DEL SUR'];
        const paisesData = paisesExtranjeros
            .map(pais => {
                const cantidad = window.conteoMunicipios[pais] || 0;
                return { pais, cantidad };
            })
            .filter(item => item.cantidad > 0)
            .sort((a, b) => b.cantidad - a.cantidad);
            
        // Generar HTML para la sección de países
        const paisesHtml = paisesData.length > 0 
            ? paisesData.map((item, index) => `
                <div class="clickable-item pais-item" data-tipo="municipio" data-nombre="${item.pais}">
                    <span class="item-name"><span class="pais-flag">🌍</span> ${item.pais}</span>
                    <span class="item-value">${item.cantidad.toLocaleString()}</span>
                </div>
            `).join('')
            : '<div class="no-data">No se encontraron registros de países extranjeros</div>';
            
        // Actualizar el contenido de la sección de países
        document.getElementById('lista-paises').innerHTML = paisesHtml;
        document.getElementById('lista-paises-fs').innerHTML = paisesHtml;
        
        // Actualizar el menú desplegable de todos los lugares
        const lugaresListHtml = municipiosArray.map((item) => `
            <div class="lugar-item" data-tipo="municipio" data-nombre="${item.municipio}">
                <span>${item.municipio}</span>
                <span class="count">${item.cantidad.toLocaleString()}</span>
            </div>
        `).join('');
        
        document.getElementById('lugares-list').innerHTML = lugaresListHtml;
        document.getElementById('lugares-count').textContent = `Todos los lugares (${municipiosArray.length})`;
        
        // También actualizar el menú de lugares en pantalla completa
        document.getElementById('lugares-list-fs').innerHTML = lugaresListHtml;
        document.getElementById('lugares-count-fs').textContent = `Todos los lugares (${municipiosArray.length})`;
        
        // Crear lista de departamentos para el menú desplegable (solo departamentos presentes)
        const departamentosListHtml = departamentosArray
            .map((item) => {
                // Obtener un color para el departamento basado en la cantidad normalizada
                const normalizedValue = item.cantidad / Math.max(...departamentosArray.map(d => d.cantidad));
                const color = MapConfig.getColor(normalizedValue);
                
                // Incluir la capital si está disponible
                const capitalText = item.capital ? ` (${item.capital})` : '';
                
                return `
                <div class="departamento-item" data-tipo="departamento" data-codigo="${item.codigo}" data-nombre="${item.departamento}">
                    <div class="departamento-color" style="background-color: ${color};"></div>
                    <span>${item.departamento}${capitalText}</span>
                </div>
                `;
            }).join('');
        
        document.getElementById('departamentos-list').innerHTML = departamentosListHtml;
        document.getElementById('departamentos-list-fs').innerHTML = departamentosListHtml;
        
        // Encontrar el valor máximo para normalizar los colores y tamaños
        const maxDeptoValue = Math.max(...departamentosArray.map(d => d.cantidad));
        
        // Crear círculos para departamentos con colores mejorados
        departamentosArray.forEach(depto => {
            if (MapConfig.coordsDepartamentos[depto.codigo]) {
                const [lat, lng] = MapConfig.coordsDepartamentos[depto.codigo];
                
                // Normalizar valor para color
                const colorValue = depto.cantidad / maxDeptoValue;
                const color = MapConfig.getColor(colorValue);
                
                // Tamaño proporcional a la cantidad (mínimo más visible)
                const radio = 20 + (depto.cantidad / maxDeptoValue) * 35;
                
                const circle = L.circle([lat, lng], {
                    color: '#333',
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 0.8,
                    radius: radio * 1000  // Convertir a metros para Leaflet
                }).addTo(window.map);
                
                // Añadir tooltip al círculo
                circle.bindTooltip(`
                    <div class="info-box">
                        <div class="info-title">${depto.departamento}</div>
                        <div class="info-content">
                            Registros: <span class="info-value">${depto.cantidad.toLocaleString()}</span><br>
                            Porcentaje: <span class="info-value">${(depto.cantidad / datos.length * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                `, { permanent: false, direction: 'top' });
                
                window.departamentoCirculos.push(circle);
            }
        });
        
        // Crear marcadores para los top municipios con colores más visibles
        municipiosArray.slice(0, 15).forEach(muni => {
            if (MapConfig.coordsMunicipios[muni.municipio]) {
                const [lat, lng] = MapConfig.coordsMunicipios[muni.municipio];
                
                // Tamaño proporcional a la cantidad (mínimo más visible)
                const tamaño = 8 + (muni.cantidad / municipiosArray[0].cantidad) * 12;
                
                // Crear icono personalizado
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #ff5050; border-radius: 50%; width: ${tamaño}px; height: ${tamaño}px; border: 2px solid white;"></div>`,
                    iconSize: [tamaño, tamaño],
                    iconAnchor: [tamaño/2, tamaño/2]
                });
                
                const marker = L.marker([lat, lng], { icon }).addTo(window.map);
                
                // Añadir popup al marcador
                marker.bindPopup(`
                    <div class="info-box">
                        <div class="info-title">${muni.municipio}</div>
                        <div class="info-content">
                            Registros: <span class="info-value">${muni.cantidad.toLocaleString()}</span><br>
                            Porcentaje: <span class="info-value">${(muni.cantidad / datos.length * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                `);
                
                window.municipioMarcadores.push(marker);
            }
        });
        
        // Crear marcadores para países extranjeros
        paisesExtranjeros.forEach(pais => {
            const paisInfo = municipiosArray.find(m => m.municipio === pais);
            if (paisInfo && MapConfig.coordsMunicipios[pais]) {
                const [lat, lng] = MapConfig.coordsMunicipios[pais];
                
                // Tamaño proporcional a la cantidad (mínimo más visible, pero asegurando que sean destacados)
                const tamaño = Math.max(12, 8 + (paisInfo.cantidad / municipiosArray[0].cantidad) * 12);
                
                // Crear icono personalizado con un color diferente para países
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #f1c40f; border-radius: 50%; width: ${tamaño}px; height: ${tamaño}px; border: 2px solid white;"></div>`,
                    iconSize: [tamaño, tamaño],
                    iconAnchor: [tamaño/2, tamaño/2]
                });
                
                const marker = L.marker([lat, lng], { icon }).addTo(window.map);
                
                // Añadir popup al marcador con información más detallada
                marker.bindPopup(`
                    <div class="info-box">
                        <div class="info-title">${paisInfo.municipio}</div>
                        <div class="info-content">
                            Registros: <span class="info-value">${paisInfo.cantidad.toLocaleString()}</span><br>
                            Porcentaje: <span class="info-value">${(paisInfo.cantidad / datos.length * 100).toFixed(1)}%</span>
                            <br><em>País extranjero</em>
                        </div>
                    </div>
                `);
                
                window.municipioMarcadores.push(marker);
            }
        });
        
        // Añadir eventos a elementos clicables después de crear el HTML
        UIController.configurarEventosClicables();
        
        // Ocultar mensajes de carga
        UIController.ocultarCargando();
        
        console.log('Interfaz actualizada con éxito:', datos.length, 'registros');
    },
    
    // Cargar archivo desde una URL o ruta
    cargarArchivoDesdeURL: async function(ruta) {
        try {
            console.log('Intentando cargar datos desde:', ruta);
            const response = await fetch(ruta);
            
            if (response.ok) {
                const texto = await response.text();
                const datosProcessed = this.procesarDatos(texto);
                this.actualizarUI(datosProcessed);
                console.log('Datos cargados exitosamente desde:', ruta);
                return true;
            }
            return false;
        } catch (e) {
            console.warn('No se pudo cargar desde:', ruta, e);
            return false;
        }
    },
    
    // Cargar y procesar archivo
    cargarArchivo: async function() {
        // Lista de posibles rutas para el archivo Datos.txt
        const posiblesRutas = [
            'Datos.txt',
            './Datos.txt',
            '../Datos.txt',
            'datos/Datos.txt',
            './datos/Datos.txt'
        ];
        
        // Intentar cargar desde cada una de las rutas posibles
        for (const ruta of posiblesRutas) {
            const exito = await this.cargarArchivoDesdeURL(ruta);
            if (exito) return;
        }

        // Si no se pudo cargar, mostrar el selector de archivos
        document.getElementById('file-input-container').style.display = 'block';
        
        // Si hay datos precargados en datos-colombia.js, usarlos
        if (window.datosColombiaTexto) {
            console.log('Usando datos precargados desde datos-colombia.js');
            const datosProcessed = this.procesarDatos(window.datosColombiaTexto);
            this.actualizarUI(datosProcessed);
        } else {
            console.log('No se encontraron datos precargados');
        }
    },
    
    // Inicializar datos usando datos precargados
    inicializarDatosPrecargados: function() {
        if (window.datosColombiaTexto) {
            console.log('Inicializando con datos precargados...');
            const datosProcesados = this.procesarDatos(window.datosColombiaTexto);
            this.actualizarUI(datosProcesados);
            return true;
        } else {
            console.log('No hay datos precargados disponibles');
            return false;
        }
    }
};

// Asignar la función de actualización UI a una variable global para acceso externo
window.actualizarUI = DataProcessor.actualizarUI.bind(DataProcessor);
window.cargarArchivo = DataProcessor.cargarArchivo.bind(DataProcessor);
