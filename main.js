// Función principal de inicialización
(function() {
    console.log('Inicializando la aplicación del Mapa de Calor de Colombia');
    
    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', inicializarAplicacion);
    
    // Si el DOM ya está cargado, inicializar inmediatamente
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        inicializarAplicacion();
    }
    
    // Función principal de inicialización
    function inicializarAplicacion() {
        console.log('DOM cargado, inicializando componentes...');
        
        // Inicializar controlador de UI
        UIController.inicializar();
        
        // Verificar si hay datos precargados y utilizarlos
        if (window.datosColombiaListo === true) {
            console.log('Datos precargados encontrados, inicializando mapa automáticamente');
            DataProcessor.inicializarDatosPrecargados();
        } else {
            // Si no hay datos precargados, intentar cargar desde archivo
            console.log('No se encontraron datos precargados, intentando cargar desde archivo');
            DataProcessor.cargarArchivo();
        }
    }
})();