// Configuración global del mapa y datos geográficos
const MapConfig = {
    // Datos de Colombia - Contorno principal simplificado
    colombiaCoords: [
        [-77.4, 8.7], [-76.8, 8.9], [-76.2, 9.3], [-75.6, 9.6], [-75.0, 10.0], 
        [-74.8, 10.5], [-74.3, 10.8], [-74.0, 11.1], [-73.3, 11.3], [-72.9, 11.5],
        [-72.5, 11.8], [-72.0, 12.2], [-71.6, 12.1], [-71.2, 11.8],
        [-70.8, 11.4], [-70.3, 11.0], [-70.2, 10.7], [-70.1, 10.1], [-70.0, 9.5],
        [-69.8, 9.0], [-69.5, 8.5], [-69.8, 8.0], [-70.0, 7.5], [-70.2, 7.0],
        [-70.5, 6.5], [-70.8, 6.0], [-70.9, 5.5], [-71.0, 5.0], [-71.3, 4.5],
        [-71.2, 4.0], [-71.0, 3.5], [-70.5, 3.0], [-70.0, 2.5], [-69.5, 2.0],
        [-69.0, 1.5], [-69.2, 1.0], [-69.5, 0.5], [-69.8, 0.0], [-70.1, -0.5],
        [-70.5, -1.0], [-70.8, -1.5], [-71.2, -2.0], [-71.5, -2.5], [-72.0, -3.0],
        [-72.5, -3.5], [-73.0, -3.8], [-73.5, -3.9], [-74.0, -4.0],
        [-74.5, -3.8], [-75.0, -3.5], [-75.5, -3.0], [-76.0, -2.5], [-76.5, -2.0],
        [-77.0, -1.5], [-77.5, -1.0], [-78.0, -0.5], [-78.5, 0.0], [-78.8, 0.5],
        [-79.0, 1.0], [-79.2, 1.5], [-79.1, 2.0],
        [-79.0, 2.5], [-78.8, 3.0], [-78.5, 3.5], [-78.2, 4.0], [-78.0, 4.5],
        [-77.8, 5.0], [-77.6, 5.5], [-77.4, 6.0], [-77.2, 6.5], [-77.3, 7.0],
        [-77.4, 7.5], [-77.5, 8.0], [-77.4, 8.5], [-77.4, 8.7]
    ],

    // Lista de departamentos oficiales de Colombia con sus capitales
    departamentosOficiales: {
        'Amazonas': 'Leticia',
        'Antioquia': 'Medellín',
        'Arauca': 'Arauca',
        'Atlántico': 'Barranquilla',
        'Bolívar': 'Cartagena',
        'Boyacá': 'Tunja',
        'Caldas': 'Manizales',
        'Caquetá': 'Florencia',
        'Casanare': 'Yopal',
        'Cauca': 'Popayán',
        'Cesar': 'Valledupar',
        'Chocó': 'Quibdó',
        'Córdoba': 'Montería',
        'Cundinamarca': 'Bogotá',
        'Guainía': 'Inírida',
        'Guaviare': 'San José del Guaviare',
        'Huila': 'Neiva',
        'La Guajira': 'Riohacha',
        'Magdalena': 'Santa Marta',
        'Meta': 'Villavicencio',
        'Nariño': 'Pasto',
        'Norte de Santander': 'Cúcuta',
        'Putumayo': 'Mocoa',
        'Quindío': 'Armenia',
        'Risaralda': 'Pereira',
        'San Andrés y Providencia': 'San Andrés',
        'Santander': 'Bucaramanga',
        'Sucre': 'Sincelejo',
        'Tolima': 'Ibagué',
        'Valle del Cauca': 'Cali',
        'Vaupés': 'Mitú',
        'Vichada': 'Puerto Carreño'
    },
    
    // Mapeo inverso de códigos DANE a nombres oficiales de departamentos
    codigosANombresOficiales: {
        '91': 'Amazonas',
        '05': 'Antioquia',
        '81': 'Arauca',
        '08': 'Atlántico',
        '13': 'Bolívar',
        '15': 'Boyacá',
        '17': 'Caldas',
        '18': 'Caquetá',
        '85': 'Casanare',
        '19': 'Cauca',
        '20': 'Cesar',
        '27': 'Chocó',
        '23': 'Córdoba',
        '25': 'Cundinamarca',
        '94': 'Guainía',
        '95': 'Guaviare',
        '41': 'Huila',
        '44': 'La Guajira',
        '47': 'Magdalena',
        '50': 'Meta',
        '52': 'Nariño',
        '54': 'Norte de Santander',
        '86': 'Putumayo',
        '63': 'Quindío',
        '66': 'Risaralda',
        '88': 'San Andrés y Providencia',
        '68': 'Santander',
        '70': 'Sucre',
        '73': 'Tolima',
        '76': 'Valle del Cauca',
        '97': 'Vaupés',
        '99': 'Vichada'
    },

    // Coordenadas de los principales departamentos (centroides aproximados)
    coordsDepartamentos: {
        '05': [6.9, -75.5],  // Antioquia
        '08': [10.6, -74.9],  // Atlántico
        '11': [4.6, -74.1],  // Bogotá D.C.
        '13': [9.7, -75.0],  // Bolívar
        '15': [5.8, -73.0],  // Boyacá
        '17': [5.3, -75.4],  // Caldas
        '18': [1.3, -75.5],  // Caquetá
        '19': [2.5, -76.8],  // Cauca
        '20': [9.3, -73.5],  // Cesar
        '23': [8.7, -75.9],  // Córdoba
        '25': [5.0, -74.0],  // Cundinamarca
        '27': [6.0, -77.0],  // Chocó
        '41': [2.5, -75.3],  // Huila
        '44': [11.5, -72.8],  // La Guajira
        '47': [10.3, -74.1],  // Magdalena
        '50': [3.8, -73.0],  // Meta
        '52': [1.2, -77.5],  // Nariño
        '54': [7.9, -72.8],  // Norte de Santander
        '63': [4.5, -75.7],  // Quindío
        '66': [5.0, -76.0],  // Risaralda
        '68': [6.9, -73.1],  // Santander
        '70': [9.3, -75.1],  // Sucre
        '73': [4.0, -75.2],  // Tolima
        '76': [3.8, -76.5],  // Valle del Cauca
        '81': [6.6, -71.0],  // Arauca
        '85': [5.3, -72.3],  // Casanare
        '86': [0.7, -76.5],  // Putumayo
        '91': [-1.0, -71.5],  // Amazonas
        '94': [2.1, -69.5],  // Guainía
        '95': [2.3, -72.3],  // Guaviare
        '97': [0.5, -70.5],  // Vaupés
        '99': [5.0, -69.0]   // Vichada
    },

    // Coordenadas de los principales municipios
    coordsMunicipios: {
        'BOGOTA D.C.': [4.65, -74.08],
        'FUSAGASUGA': [4.34, -74.36],
        'ARBELAEZ': [4.27, -74.41],
        'SILVANIA': [4.40, -74.38],
        'PASCA': [4.31, -74.30],
        'SAN BERNARDO': [4.18, -74.42],
        'GIRARDOT': [4.30, -74.80],
        'SOACHA': [4.58, -74.21],
        'GRANADA': [4.52, -74.35],
        'PANDI': [4.19, -74.49],
        'TIBACUY': [4.35, -74.45],
        'VENECIA': [4.08, -74.47],
        'CABRERA': [3.98, -74.48],
        'VIOTA': [4.44, -74.52],
        'LA MESA': [4.63, -74.46],
        'SIBATE': [4.49, -74.26],
        'MADRID': [4.73, -74.27],
        'FACATATIVA': [4.81, -74.35],
        'ZIPAQUIRA': [5.02, -74.00],
        'MEDELLIN': [6.25, -75.56],
        'CALI': [3.45, -76.53],
        'BARRANQUILLA': [10.96, -74.78],
        'BUCARAMANGA': [7.12, -73.12],
        'CARTAGENA': [10.39, -75.51],
        'IBAGUE': [4.43, -75.23],
        'NEIVA': [2.93, -75.28],
        'VILLAVICENCIO': [4.15, -73.63],
        'PEREIRA': [4.81, -75.69],
        'SANTA MARTA': [11.24, -74.20],
        'TUNJA': [5.54, -73.36],
        'PASTO': [1.21, -77.28],
        'CUCUTA': [7.89, -72.50],
        'MONTERIA': [8.75, -75.88],
        'FLORENCIA': [1.61, -75.60],
        'EL COLEGIO': [4.58, -74.44],
        'APARTADO': [7.88, -76.63]
    },
    
    // Función para obtener color según valor normalizado
    getColor: function(value) {
        // Escala de azules optimizada para visualización
        if (value < 0.1) {
            return '#9ecae1'; // Valor mínimo que sigue siendo visible
        } else if (value < 0.3) {
            return '#6baed6';
        } else if (value < 0.5) {
            return '#4292c6';
        } else if (value < 0.7) {
            return '#2171b5';
        } else if (value < 0.9) {
            return '#08519c';
        } else {
            return '#084594';
        }
    },
    
    // Constantes
    TOTAL_DEPARTAMENTOS_OFICIALES: 32,
    INICIO_LATITUD: 4.5709,
    INICIO_LONGITUD: -74.2973,
    INICIO_ZOOM: 6
};

// Inicializar el mapa
window.map = L.map('map').setView([MapConfig.INICIO_LATITUD, MapConfig.INICIO_LONGITUD], MapConfig.INICIO_ZOOM);

// Añadir capa base de CartoDB (más limpia y profesional)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(window.map);

// Crear contorno de Colombia
window.colombiaPolygon = L.polygon(MapConfig.colombiaCoords, {
    color: '#2980b9',
    weight: 2,
    fillColor: '#ecf0f1',
    fillOpacity: 0.3
}).addTo(window.map);

// Crear colecciones para almacenar elementos del mapa
window.departamentoCirculos = [];
window.municipioMarcadores = [];

// Variables globales para datos
window.conteoMunicipios = {};
window.conteoDepartamentos = {};
window.datos = [];