document.addEventListener('DOMContentLoaded', function () {
    var apiUrl = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
    var mapContainer = document.getElementById('map');
    var loader = document.getElementById('loader');

    // Función para inicializar el mapa
    window.inicializarMapa = function () {
        // Intentar obtener la ubicación del usuario
        loader.style.display = 'block';

        navigator.geolocation.getCurrentPosition(
            function (position) {
                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;

                // Si se obtiene la ubicación, centrar el mapa en la posición del usuario
                centrarMapaEnUsuario(userLat, userLng);
            },
            function (error) {
                console.error('Error al obtener la ubicación del usuario:', error);

                // Si hay un error, centrar el mapa en una ubicación predeterminada
                centrarMapaEnUsuario(40.416775, -3.703790); // Coordenadas de Madrid, España
            }
        );
    };

    // Función para centrar el mapa en una ubicación específica
    function centrarMapaEnUsuario(latitud, longitud) {
        var myMap = new google.maps.Map(mapContainer, {
            center: { lat: latitud, lng: longitud },
            zoom: 12 // Puedes ajustar el nivel de zoom según tus necesidades
        });

        // Realizar la solicitud a la API
        fetch(apiUrl)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('No se pudo obtener la información');
                }
                return response.json();
            })
            .then(function (data) {
                loader.style.display = 'none';
                // Agregar marcadores al mapa
                agregarMarcadores(myMap, data);
            })
            .catch(function (error) {
                console.error('Error al obtener datos:', error);
                loader.style.display = 'none';
            });
    }

    // Función para agregar marcadores al mapa
    function agregarMarcadores(mapa, estaciones) {
        for (var i = 0; i < estaciones.ListaEESSPrecio.length; i++) {
            var estacion = estaciones.ListaEESSPrecio[i];
            var latitud = parseFloat(estacion.Latitud.replace(',', '.'));
            var longitud = parseFloat(estacion['Longitud (WGS84)'].replace(',', '.'));

            // Renombrar el campo 'Longitud (WGS84)' a 'Longitud'
            estacion.Longitud = estacion['Longitud (WGS84)'];
            delete estacion['Longitud (WGS84)'];

            // Asegurarse de que latitud y longitud sean válidas
            if (!isNaN(latitud) && !isNaN(longitud)) {
                agregarMarcador(mapa, estacion, latitud, longitud);
            }
        }
    }

    // Función para agregar un marcador individual
    function agregarMarcador(mapa, estacion, latitud, longitud) {
        var marker = new google.maps.Marker({
            position: { lat: latitud, lng: longitud },
            map: mapa,
            title: estacion.rotulo,
            
        });

        var precioGasolina95E5 = estacion['Precio Gasolina 95 E5'];
        var precioGasolina98E5 = estacion['Precio Gasolina 98 E5'];
        var precioGasoleoA = estacion['Precio Gasoleo A'];
        var precioGasoleoB = estacion['Precio Gasoleo B'];

        // Agregar información del marcador (puedes personalizar esto según tus necesidades)
        var contentString = `
            <div>
                <h3>${estacion.Rótulo}</h3>
                <p>${estacion.Horario}</p>
                <p>Precio Gasolina 95: ${precioGasolina95E5}</p>
                <p>Precio Gasolina 98: ${precioGasolina98E5}</p>
                <p>Precio Gasoleo A: ${precioGasoleoA}</p>
                <p>Precio Gasoleo B: ${precioGasoleoB}</p>
            </div>
        `;

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        // Utilizar una función anónima para cerrar el ámbito de 'marker'
        marker.addListener('click', function () {
            infowindow.open(mapa, marker);
        });
    }
});
