# =============================================================================
# ARCHIVO: app_ruta.py (Versión Limpia y Corregida)
# =============================================================================
import streamlit as st
import pandas as pd
import requests
from openrouteservice import Client
from openrouteservice.exceptions import ApiError

# --- Configuración de la Página ---
# Esto debe ser lo primero que ejecuta streamlit
st.set_page_config(
    page_title="Planificador de Rutas EV",
    page_icon="⚡",
    layout="wide"
)

# --- Estilos CSS personalizados para tooltips ---
st.markdown("""
<style>
/* Estilos para tooltips personalizados */
.tooltip {
    position: relative;
    display: inline-block;
}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 280px;
    background-color: #f8f9fa;
    color: #333;
    text-align: left;
    border-radius: 6px;
    padding: 8px 12px;
    position: absolute;
    z-index: 9999;
    top: 125%;
    left: 50%;
    margin-left: -140px;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 12px;
    line-height: 1.4;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    white-space: normal;
}

.tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}

/* Iconos de ayuda más elegantes */
.help-icon {
    color: #6c757d;
    font-size: 16px;
    cursor: help;
    transition: color 0.2s;
}

.help-icon:hover {
    color: #495057;
}
</style>
""", unsafe_allow_html=True)

# --- TUS API KEYS (REEMPLAZA ESTO) ---
# Pega tus claves entre las comillas
ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQ1NzAxMzkzNDZiOTRjNDI5MTc4Y2M2MDYyMjY2Y2Q3IiwiaCI6Im11cm11cjY0In0="
OCM_API_KEY = "61def497-130b-4abf-aea3-4940cc606295" # ¡¡CORREGIDO!! (Quité el "API Key: ")

# =============================================================================
# Funciones "Helpers" (La Lógica Matemática)
# =============================================================================

def haversine_distance(coords1, coords2):
    """Calcula la distancia en metros entre dos coordenadas {lat, lng}."""
    import math
    
    def to_rad(x):
        return x * math.pi / 180

    lat1, lon1 = coords1['lat'], coords1['lng']
    lat2, lon2 = coords2['lat'], coords2['lng']
    R = 6371000  # Radio de la Tierra en metros

    dLat = to_rad(lat2 - lat1)
    dLon = to_rad(lon2 - lon1)
    a = (math.sin(dLat / 2) * math.sin(dLat / 2) +
         math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) *
         math.sin(dLon / 2) * math.sin(dLon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_point_at_distance(coordenadas, distancia_objetivo_metros):
    """Encuentra la coordenada más cercana a la distancia objetivo en una lista de coordenadas."""
    distancia_acumulada = 0
    
    for i in range(len(coordenadas) - 1):
        punto_a = coordenadas[i]
        punto_b = coordenadas[i + 1]
        
        distancia_segmento = haversine_distance(punto_a, punto_b)
        
        if distancia_acumulada + distancia_segmento >= distancia_objetivo_metros:
            # Para simplificar, devolvemos el final de este segmento (puntoB)
            return punto_b
        
        distancia_acumulada += distancia_segmento
        
    # Si la distancia es mayor que la ruta, devuelve el penúltimo punto
    return coordenadas[-2] if len(coordenadas) > 1 else coordenadas[0]

# =============================================================================
# Funciones "APIs" (Los Mensajeros)
# =============================================================================

# Usamos un "cache" para no llamar a las APIs innecesariamente si los datos no cambian
@st.cache_data(ttl="1h") # Guarda el resultado por 1 hora
def get_ors_client():
    """Inicializa el cliente de OpenRouteService."""
    return Client(key=ORS_API_KEY)

@st.cache_data(ttl="1h")
def get_coordenadas_ors(_client, nombre_ciudad, coords_destino_final=None):
    """
    Convierte un nombre de ciudad en coordenadas {lat, lng}, priorizando 'locality'.
    """
    try:
        params = {
            'text': nombre_ciudad,
            'country': 'COL',
            'layers': ['locality'], # Prioridad 1: Ciudad/Pueblo
            'size': 1
        }

        if coords_destino_final:
            params['boundary_circle'] = {
                "lat_lon": [coords_destino_final['lat'], coords_destino_final['lng']],
                "radius": 500 # Radio en km
            }

        geocode_result = _client.pelias_search(**params)

        feature_encontrada = None
        if geocode_result and 'features' in geocode_result and geocode_result['features']:
            feature_encontrada = geocode_result['features'][0]
        else:
            # Si no encontró 'locality', busca en otras capas como último recurso
            # Quitamos el st.write de aquí
            params.pop('layers', None) 
            geocode_result = _client.pelias_search(**params)

            if geocode_result and 'features' in geocode_result and geocode_result['features']:
                feature_encontrada = geocode_result['features'][0]

        if not feature_encontrada:
            st.error(f"Error: No se encontraron coordenadas para '{nombre_ciudad}'.")
            return None

        # Devuelve [lng, lat] del resultado encontrado
        coords = feature_encontrada['geometry']['coordinates']
        # Quitamos el st.write de aquí
        return {'lat': coords[1], 'lng': coords[0]}

    except ApiError as e:
        st.error(f"Error de API (ORS Geocoding) para '{nombre_ciudad}': {e}")
        return None
    except Exception as e: 
        st.error(f"Error inesperado en get_coordenadas_ors: {e}")
        # Quitamos el st.write de aquí
        return None

@st.cache_data(ttl="1h")
def get_directions_ors(_client, coords_origen, coords_destino):
    """Obtiene la ruta completa, distancia y lista de coordenadas."""
    try:
        # Formato ORS: [lng, lat]
        ruta_request = {
            'coordinates': [
                [coords_origen['lng'], coords_origen['lat']],
                [coords_destino['lng'], coords_destino['lat']]
            ],
            'profile': 'driving-car',
            'format': 'geojson',
            'instructions': False # No necesitamos instrucciones paso a paso
        }

        ruta_result = _client.directions(**ruta_request)

        # Verificamos que la respuesta de la API sea válida y contenga una ruta
        if (not ruta_result or 
            'features' not in ruta_result or 
            not ruta_result['features'] or
            'properties' not in ruta_result['features'][0] or
            'summary' not in ruta_result['features'][0]['properties'] or
            'distance' not in ruta_result['features'][0]['properties']['summary']):

            # Si no hay ruta, registramos el error y devolvemos None
            st.error(f"Error: No se pudo encontrar una ruta entre las coordenadas {coords_origen} y {coords_destino}.")
            return None

        distancia_total_metros = ruta_result['features'][0]['properties']['summary']['distance']
        # Lista de coordenadas [lng, lat]
        geometria = ruta_result['features'][0]['geometry']['coordinates']

        # Convertimos a [{lat, lng}]
        polilinea_decodificada = [{'lat': p[1], 'lng': p[0]} for p in geometria]

        return {
            'distancia_total_metros': distancia_total_metros,
            'polilinea_decodificada': polilinea_decodificada
        }
    except ApiError as e:
        #st.error(f"Error de API (ORS Directions): {e}")
        return None
    except requests.exceptions.RequestException as e:
        st.error(f"Error de Red (ORS Directions): {e}")
        return None

@st.cache_data(ttl="1h")
def get_ciudad_cercana_ors(_client, lat, lng):
    """Encuentra el lugar habitable más cercano (preferiblemente localidad)."""
    try:
        #st.write(f"--- Buscando lugar cerca de {lat:.5f}, {lng:.5f} ---") # DEBUG
        reverse_result = _client.pelias_reverse(point=(lng, lat)) # Busca cualquier capa

        if not reverse_result or 'features' not in reverse_result or not reverse_result['features']:
             st.write("ORS Reverse API no devolvió nada.") # DEBUG
             return {'nombre': "Punto en la ruta", 'lat': lat, 'lng': lng}

        # --- NUEVA LÓGICA ---
        # Priorizamos encontrar una 'locality' (ciudad/pueblo)
        feature_encontrada = None
        for feature in reverse_result['features']:
            if feature.get('properties', {}).get('layer') == 'locality':
                feature_encontrada = feature
                break # Encontramos una localidad, es la mejor opción

        # Si no encontramos 'locality', tomamos el primer resultado (puede ser county, etc.)
        if not feature_encontrada:
            feature_encontrada = reverse_result['features'][0]
        # --- FIN NUEVA LÓGICA ---

        nombre_lugar = feature_encontrada['properties']['label']
        coords = feature_encontrada['geometry']['coordinates']
        #st.write(f"Lugar encontrado: {nombre_lugar}") # DEBUG
        return {'nombre': nombre_lugar, 'lat': coords[1], 'lng': coords[0]}

    except ApiError as e:
        st.error(f"Error de API (ORS Reverse Geocoding): {e}")
        st.write(e) # DEBUG
        return {'nombre': "Error de Geocodificación", 'lat': lat, 'lng': lng}
    except Exception as e:
        st.error(f"Error inesperado en get_ciudad_cercana_ors: {e}")
        st.write(e) # DEBUG
        return {'nombre': "Error Inesperado", 'lat': lat, 'lng': lng}

    except ApiError as e:
        st.error(f"Error de API (ORS Reverse Geocoding): {e}")
        # Muestra el error específico
        st.write(e) # DEBUG
        return {'ciudad': "Error de Geocodificación", 'lat': lat, 'lng': lng}
    except Exception as e:
        st.error(f"Error inesperado en get_ciudad_cercana_ors: {e}")
        st.write(e) # DEBUG
        return {'ciudad': "Error Inesperado", 'lat': lat, 'lng': lng}

@st.cache_data(ttl="1h")
def buscar_cargadores_ocm(lat, lng):
    """Busca cargadores de EV en OpenChargeMap cerca de coordenadas."""
    try:
        url = "https://api.openchargemap.io/v3/poi/"

        params = {
            'output': 'json',
            'latitude': lat,
            'longitude': lng,
            'distance': 25, # Radio de 25 km
            'distanceunit': 'km',
            'maxresults': 10
        }
        headers = {
            'X-API-Key': OCM_API_KEY
        }
        respuesta = requests.get(url, params=params, headers=headers, timeout=10)

        if respuesta.status_code != 200:
            return f"Error OCM ({respuesta.status_code})"

        json_data = respuesta.json()

        if not json_data or len(json_data) == 0:
            return "Carga Lenta (Hotel/110V)"

        return f"{len(json_data)} cargador(es) [OCM] encontrado(s)"
    except requests.exceptions.RequestException as e:
        st.error(f"Error de Red (OCM): {e}")
        return "Error de búsqueda (OCM)"

def encontrar_punto_cercano_con_carga(_client, coords_base, distancia_maxima_km):
    """Encuentra un punto cercano habitable con opciones de carga."""
    try:
        # Buscar en un radio alrededor del punto base
        radio_busqueda = min(distancia_maxima_km / 2, 50)  # Máximo 50km de radio

        # Generar puntos candidatos en direcciones cardinales
        direcciones = [
            (0, radio_busqueda),      # Norte
            (radio_busqueda, 0),      # Este
            (0, -radio_busqueda),     # Sur
            (-radio_busqueda, 0),     # Oeste
            (radio_busqueda/1.414, radio_busqueda/1.414),   # Noreste
            (radio_busqueda/1.414, -radio_busqueda/1.414),  # Sureste
            (-radio_busqueda/1.414, -radio_busqueda/1.414), # Suroeste
            (-radio_busqueda/1.414, radio_busqueda/1.414),  # Noroeste
        ]

        puntos_candidatos = []
        for dx, dy in direcciones:
            # Convertir km a grados aproximados (1 grado ≈ 111 km)
            dlat = dy / 111.0
            dlng = dx / (111.0 * math.cos(math.radians(coords_base['lat'])))

            punto_candidato = {
                'lat': coords_base['lat'] + dlat,
                'lng': coords_base['lng'] + dlng
            }
            puntos_candidatos.append(punto_candidato)

        # Evaluar cada punto candidato
        mejor_punto = None
        mejor_distancia = float('inf')

        for punto in puntos_candidatos:
            # Verificar que esté dentro de la distancia máxima desde el punto base
            distancia_a_base = haversine_distance(coords_base, punto)
            if distancia_a_base > distancia_maxima_km * 1000:  # Convertir km a metros
                continue

            # Buscar lugar habitable cercano
            lugar_cercano = get_ciudad_cercana_ors(_client, punto['lat'], punto['lng'])

            if lugar_cercano['nombre'] != "Punto en la ruta":
                # Verificar opciones de carga
                opciones_carga = buscar_cargadores_ocm(punto['lat'], punto['lng'])

                # Si tiene cargadores o al menos opciones de carga lenta, es candidato
                if "Error" not in opciones_carga:
                    # Calcular distancia real al punto base
                    coords_lugar = {'lat': lugar_cercano['lat'], 'lng': lugar_cercano['lng']}
                    distancia_real = haversine_distance(coords_base, coords_lugar)

                    # Verificar que el viaje de ida y vuelta sea posible
                    distancia_total_ida_vuelta = distancia_real * 2
                    if distancia_total_ida_vuelta <= distancia_maxima_km * 1000:
                        # Es un buen candidato - seleccionar el más cercano
                        if distancia_real < mejor_distancia:
                            mejor_distancia = distancia_real
                            mejor_punto = {
                                'nombre': lugar_cercano['nombre'],
                                'lat': lugar_cercano['lat'],
                                'lng': lugar_cercano['lng'],
                                'distancia_km': distancia_real / 1000,
                                'carga': opciones_carga
                            }

        return mejor_punto

    except Exception as e:
        st.error(f"Error al buscar punto cercano: {e}")
        return None

# =============================================================================
# APLICACIÓN WEB (Streamlit)
# =============================================================================

# --- Título ---
st.title("⚡ Planificador de Rutas EV (Colombia)")
st.write("Calcula tu ruta por etapas basada en una distancia diaria máxima.")

# --- Inicializar el Cliente de API ---
# Esto solo se ejecuta una vez gracias al cache
client_ors = get_ors_client()

# --- Entradas del Usuario (Sidebar) ---
with st.sidebar:
    st.header("Parámetros del Viaje")

    # Valores de ejemplo para facilitar las pruebas
    origen_default = "Bogotá, CU, Colombia"
    destino_default = "Cartagena, BO, Colombia"
    dist_default = 200
    buffer_default = 20 # Porcentaje por defecto

    col1, col2 = st.columns([10, 1])
    with col1:
        origen_ciudad = st.text_input(
            "Ciudad de Origen:",
            value=origen_default,
            key="origen" # Llave única
        )
    with col2:
        st.markdown('<div class="tooltip" style="text-align: center; margin-top: 5px;"><span class="help-icon">ⓘ</span><span class="tooltiptext">Ingresa el nombre completo de la ciudad de partida.<br>Ejemplo: Bogotá, Cundinamarca, Colombia.<br>El sistema buscará automáticamente las coordenadas.</span></div>', unsafe_allow_html=True)

    col3, col4 = st.columns([10, 1])
    with col3:
        destino_ciudad = st.text_input(
            "Ciudad de Destino:",
            value=destino_default,
            key="destino" # Llave única
        )
    with col4:
        st.markdown('<div class="tooltip" style="text-align: center; margin-top: 5px;"><span class="help-icon">ⓘ</span><span class="tooltiptext">Ingresa el nombre completo de la ciudad de llegada.<br>Ejemplo: Cartagena, Bolívar, Colombia.<br>El sistema buscará automáticamente las coordenadas.</span></div>', unsafe_allow_html=True)
    col5, col6 = st.columns([10, 1])
    with col5:
        max_dist_km = st.number_input(
            "Distancia Máxima por Día (km):",
            min_value=50,
            max_value=1000,
            value=dist_default,
            step=50,
            key="distancia" # Llave única
        )
    with col6:
        st.markdown('<div class="tooltip" style="text-align: center; margin-top: 5px;"><span class="help-icon">ⓘ</span><span class="tooltiptext">Distancia máxima que deseas recorrer en un día.<br>Valores bajos (50-150km) requieren más holgura para encontrar paradas.<br>Valores altos (400-1000km) permiten menos flexibilidad.</span></div>', unsafe_allow_html=True)

    # Calcular buffer recomendado automáticamente
    if max_dist_km < 150:
        buffer_recomendado = 40
    elif max_dist_km < 250:
        buffer_recomendado = 30
    elif max_dist_km < 400:
        buffer_recomendado = 25
    else:
        buffer_recomendado = 20

    # --- ¡NUEVO CAMPO! ---
    col7, col8 = st.columns([10, 1])
    with col7:
        buffer_percent = st.number_input(
            f"Porcentaje de Holgura (%): [Auto: {buffer_recomendado}%]",
            min_value=10,
            max_value=50,
            value=buffer_recomendado,  # Usar valor recomendado por defecto
            step=5,
            key="buffer"
        )
    with col8:
        st.markdown('<div class="tooltip" style="text-align: center; margin-top: 5px;"><span class="help-icon">ⓘ</span><span class="tooltiptext">Porcentaje de flexibilidad para buscar paradas.<br>40% = buscar ±40km alrededor del punto ideal.<br>Más holgura = más opciones de parada, pero posibles rutas más largas.</span></div>', unsafe_allow_html=True)
    # --- FIN DE NUEVO CAMPO ---

    # El botón para iniciar el cálculo
    boton_generar = st.button(
        "Generar Ruta",
        type="primary",
        use_container_width=True,
        key="generar" # Llave única
    )


# --- Lógica Principal (Se ejecuta al presionar el botón) ---

# Usamos st.session_state para guardar las coordenadas confirmadas
if 'coords_origen_confirmadas' not in st.session_state:
    st.session_state.coords_origen_confirmadas = None
if 'coords_destino_confirmadas' not in st.session_state:
    st.session_state.coords_destino_confirmadas = None
if 'calculando_ruta' not in st.session_state:
    st.session_state.calculando_ruta = False

# Placeholders para mostrar opciones de clarificación
origen_options_placeholder = st.empty()
destino_options_placeholder = st.empty()

# --- Lógica Principal (Separada en Fases) ---

# Estados de la sesión para manejar el flujo
if 'fase' not in st.session_state:
    st.session_state.fase = 'inicio' # inicio, confirmar_origen, confirmar_destino, calcular, terminado
if 'coords_origen' not in st.session_state:
    st.session_state.coords_origen = None
if 'coords_destino' not in st.session_state:
    st.session_state.coords_destino = None
if 'opciones_origen' not in st.session_state:
    st.session_state.opciones_origen = None
if 'opciones_destino' not in st.session_state:
    st.session_state.opciones_destino = None

# Placeholders para widgets dinámicos
origen_options_placeholder = st.empty()
destino_options_placeholder = st.empty()
resultado_placeholder = st.empty()

# --- Lógica del Botón Principal ---
if boton_generar:
    # Reiniciar todo al presionar el botón
    st.session_state.fase = 'confirmar_origen'
    st.session_state.coords_origen = None
    st.session_state.coords_destino = None
    st.session_state.opciones_origen = None
    st.session_state.opciones_destino = None
    resultado_placeholder.empty() # Limpiar resultados anteriores
    origen_options_placeholder.empty()
    destino_options_placeholder.empty()

    if not origen_ciudad or not destino_ciudad:
        st.error("Por favor, introduce un origen y un destino.")
        st.session_state.fase = 'inicio'
    elif ORS_API_KEY.startswith("PEGA_TU") or OCM_API_KEY.startswith("PEGA_TU"):
        st.error("¡ERROR! Por favor, añade tus API keys en las líneas 16 y 17 del script `app_ruta.py`.")
        st.session_state.fase = 'inicio'


# --- FASE 1: Confirmar Origen ---
if st.session_state.fase == 'confirmar_origen':
    resultado_origen = get_coordenadas_ors(client_ors, origen_ciudad)
    
    if isinstance(resultado_origen, list): # Hay ambigüedad
        st.session_state.opciones_origen = resultado_origen
        st.session_state.fase = 'esperar_seleccion_origen'
        st.rerun() # Volver a ejecutar para mostrar opciones
        
    elif isinstance(resultado_origen, dict): # Sin ambigüedad
         st.session_state.coords_origen = resultado_origen
         st.session_state.fase = 'confirmar_destino' # Pasar a la siguiente fase
         st.rerun() # Volver a ejecutar para confirmar destino
    else: # Error
         st.error(f"No se pudo determinar el origen para '{origen_ciudad}'.")
         st.session_state.fase = 'inicio'

# --- FASE 1.5: Esperar Selección Origen ---
if st.session_state.fase == 'esperar_seleccion_origen':
    with origen_options_placeholder.container():
        st.subheader(f"Selecciona el Origen correcto para '{origen_ciudad}':")
        opciones_labels = [opt['label'] for opt in st.session_state.opciones_origen]
        
        # Usamos un índice guardado para evitar reseteos
        if 'origen_idx' not in st.session_state:
            st.session_state.origen_idx = None

        seleccion_idx = st.radio("Opciones de Origen:", options=range(len(opciones_labels)), 
                                 format_func=lambda i: opciones_labels[i], 
                                 key="select_origen", index=st.session_state.origen_idx)

        if seleccion_idx is not None and seleccion_idx != st.session_state.origen_idx:
            st.session_state.origen_idx = seleccion_idx # Guardar selección
            opt_seleccionada = st.session_state.opciones_origen[seleccion_idx]
            st.session_state.coords_origen = {'lat': opt_seleccionada['lat'], 'lng': opt_seleccionada['lng']}
            st.success(f"Origen confirmado: {opt_seleccionada['label']}")
            origen_options_placeholder.empty()
            st.session_state.fase = 'confirmar_destino' # Pasar a la siguiente fase
            st.rerun()

# --- FASE 2: Confirmar Destino ---
if st.session_state.fase == 'confirmar_destino':
     resultado_destino = get_coordenadas_ors(client_ors, destino_ciudad)

     if isinstance(resultado_destino, list): # Hay ambigüedad
         st.session_state.opciones_destino = resultado_destino
         st.session_state.fase = 'esperar_seleccion_destino'
         st.rerun() # Volver a ejecutar para mostrar opciones
         
     elif isinstance(resultado_destino, dict): # Sin ambigüedad
          st.session_state.coords_destino = resultado_destino
          st.session_state.fase = 'calcular' # ¡Listo para calcular!
          st.rerun() # Volver a ejecutar para calcular
     else: # Error
          st.error(f"No se pudo determinar el destino para '{destino_ciudad}'.")
          st.session_state.fase = 'inicio'

# --- FASE 2.5: Esperar Selección Destino ---
if st.session_state.fase == 'esperar_seleccion_destino':
    with destino_options_placeholder.container():
        st.subheader(f"Selecciona el Destino correcto para '{destino_ciudad}':")
        opciones_labels = [opt['label'] for opt in st.session_state.opciones_destino]
        
        if 'destino_idx' not in st.session_state:
            st.session_state.destino_idx = None
            
        seleccion_idx = st.radio("Opciones de Destino:", options=range(len(opciones_labels)),
                                 format_func=lambda i: opciones_labels[i],
                                 key="select_destino", index=st.session_state.destino_idx)

        if seleccion_idx is not None and seleccion_idx != st.session_state.destino_idx:
            st.session_state.destino_idx = seleccion_idx # Guardar selección
            opt_seleccionada = st.session_state.opciones_destino[seleccion_idx]
            st.session_state.coords_destino = {'lat': opt_seleccionada['lat'], 'lng': opt_seleccionada['lng']}
            st.success(f"Destino confirmado: {opt_seleccionada['label']}")
            destino_options_placeholder.empty()
            st.session_state.fase = 'calcular' # ¡Listo para calcular!
            st.rerun()


# --- FASE 3: Calcular Ruta ---
if st.session_state.fase == 'calcular':
    # Recuperamos las coordenadas confirmadas
    coords_punto_actual = st.session_state.coords_origen
    coords_destino_final = st.session_state.coords_destino
    punto_actual_nombre = origen_ciudad # Nombre original para la tabla

    max_dist_metros = max_dist_km * 1000
    # El buffer ya está optimizado por el cálculo automático, pero mantenemos validación mínima
    buffer_percent_adjusted = max(buffer_percent, 15)  # Mínimo absoluto de 15%
    buffer = buffer_percent_adjusted / 100.0
    etapas_lista = []
    dia = 1
    progreso_placeholder = st.empty()

    with st.spinner("Calculando ruta... Esto puede tardar unos segundos..."):
        # Bucle principal (igual que antes)
        while True:
            progreso_placeholder.text(f"Día {dia}: Calculando desde {punto_actual_nombre}...")

            # 1. Obtener la ruta restante
            ruta_restante = get_directions_ors(client_ors, coords_punto_actual, coords_destino_final)

            if not ruta_restante:
                st.error(f"Se detiene el cálculo.")
                break

            distancia_total_restante = ruta_restante['distancia_total_metros']

            # 2. Comprobar si es la última etapa
            limite_etapa = max_dist_metros * (1 + buffer)
            if distancia_total_restante <= limite_etapa:
                progreso_placeholder.text(f"Día {dia}: Última etapa hacia {destino_ciudad}...")

                dist_km = distancia_total_restante / 1000
                carga = buscar_cargadores_ocm(coords_destino_final['lat'], coords_destino_final['lng'])

                etapas_lista.append({
                    "Etapa (Día)": dia,
                    "Tramo (Ruta)": f"{punto_actual_nombre} -> {destino_ciudad}",
                    "Distancia (km)": f"{dist_km:.1f}",
                    "Ciudad de Parada": destino_ciudad,
                    "Latitud": f"{coords_destino_final['lat']:.5f}",
                    "Longitud": f"{coords_destino_final['lng']:.5f}",
                    "Opciones de Carga": carga
                })

                break # Fin del viaje

            else:
                # 3. No es la última etapa. Segmentar.
                coordenadas_ruta = ruta_restante['polilinea_decodificada']

                parada_encontrada = False
                parada_nombre_final = ""
                parada_coords_finales = {}
                tramo_valido = None

                # Ajustar el rango de búsqueda basado en la distancia diaria
                if max_dist_km < 200:
                    steps = int(buffer * 15)  # Más pasos para distancias cortas
                else:
                    steps = int(buffer * 10)

                check_percentages = [1.0]
                for i in range(1, steps + 1):
                     check_percentages.append(1.0 + (i * 0.1))
                     check_percentages.append(1.0 - (i * 0.1))

                for percent in check_percentages:
                    distancia_intento = max_dist_metros * percent
                    if distancia_intento <= 0 or distancia_intento > distancia_total_restante:
                        continue

                    progreso_placeholder.text(f"Día {dia}: Buscando parada habitable cerca de {distancia_intento/1000:.0f} km...")

                    punto_intermedio_coords = find_point_at_distance(coordenadas_ruta, distancia_intento)
                    parada_tentativa = get_ciudad_cercana_ors(client_ors, punto_intermedio_coords['lat'], punto_intermedio_coords['lng'])

                    if (parada_tentativa['nombre'] != "Punto en la ruta" and
                        parada_tentativa['nombre'].lower() != punto_actual_nombre.lower()):

                        coords_parada_ruteable = get_coordenadas_ors(client_ors, parada_tentativa['nombre'])

                        if coords_parada_ruteable:
                            progreso_placeholder.text(f"Día {dia}: Validando ruta hacia {parada_tentativa['nombre']}...")
                            tramo_intento = get_directions_ors(client_ors, coords_punto_actual, coords_parada_ruteable)

                            if tramo_intento:
                                distancia_tramo = tramo_intento['distancia_total_metros']
                                if distancia_tramo <= limite_etapa:
                                    parada_encontrada = True
                                    parada_nombre_final = parada_tentativa['nombre']
                                    parada_coords_finales = coords_parada_ruteable
                                    tramo_valido = tramo_intento
                                    break
                            #else:
                            #    st.write(f"Parada '{parada_tentativa['nombre']}' descartada (no ruteable). Probando otra distancia...")
                        #else:
                        #    st.write(f"Nombre encontrado ({parada_tentativa['nombre']}) pero sin coordenadas ruteables. Probando otra distancia...")

                if not parada_encontrada:
                    st.warning(f"Día {dia}: No se pudo encontrar ninguna localidad habitable y ruteable en la holgura de {buffer_percent_adjusted}%. La ruta se detiene.")
                    break

                dist_km = tramo_valido['distancia_total_metros'] / 1000
                carga = buscar_cargadores_ocm(parada_coords_finales['lat'], parada_coords_finales['lng'])

                etapas_lista.append({
                    "Etapa (Día)": dia,
                    "Tramo (Ruta)": f"{punto_actual_nombre} -> {parada_nombre_final}",
                    "Distancia (km)": f"{dist_km:.1f}",
                    "Ciudad de Parada": parada_nombre_final,
                    "Latitud": f"{parada_coords_finales['lat']:.5f}",
                    "Longitud": f"{parada_coords_finales['lng']:.5f}",
                    "Opciones de Carga": carga
                })

                # 4. Preparar el siguiente bucle
                punto_actual_nombre = parada_nombre_final
                coords_punto_actual = parada_coords_finales
                dia += 1

            # Salvaguarda para bucles infinitos
            if dia > 30:
                st.error("Se superaron las 30 etapas. Deteniendo el cálculo.")
                break
    
    # --- Mostrar Resultados (al final del cálculo) ---
    with resultado_placeholder.container(): # Mostrar en el placeholder definido al inicio
        if etapas_lista:
            progreso_placeholder.empty() 
            st.success(f"¡Ruta generada con {len(etapas_lista)} etapa(s)!")
            
            df_resultados = pd.DataFrame(etapas_lista)
            columnas_ordenadas = ["Etapa (Día)", "Tramo (Ruta)", "Distancia (km)", "Ciudad de Parada", "Latitud", "Longitud", "Opciones de Carga"]

            # Agregar columna de checkboxes para selección
            df_display = df_resultados[columnas_ordenadas].copy()
            df_display.insert(0, "Seleccionar", False)  # Agregar columna de checkboxes al inicio

            # Mostrar tabla de resultados
            st.dataframe(df_resultados[columnas_ordenadas], use_container_width=True)
            
            # Generar enlace Google Maps con coordenadas específicas para evitar ambigüedades
            paradas_para_mapa = []
            for idx, row in df_resultados.iterrows():
                # Usar coordenadas específicas en lugar de nombres de ciudades
                lat = float(row["Latitud"])
                lng = float(row["Longitud"])
                paradas_para_mapa.append(f"{lat:.6f},{lng:.6f}")

            # Agregar coordenadas del origen al inicio
            coords_origen = st.session_state.coords_origen
            paradas_para_mapa.insert(0, f"{coords_origen['lat']:.6f},{coords_origen['lng']:.6f}")

            # Botones para acciones
            col_mapa, col_csv = st.columns(2)

            with col_mapa:
                if st.button(
                    "🗺️ Ver Ruta Completa en Google Maps",
                    use_container_width=True,
                    key="ver_mapa"
                ):
                    # Abrir el enlace en una nueva pestaña usando JavaScript
                    st.markdown(f'<meta http-equiv="refresh" content="0; url={url_google_maps}">', unsafe_allow_html=True)
                    st.success("Abriendo Google Maps...")

            with col_csv:
                @st.cache_data
                def convertir_df_a_csv(df):
                    return df.to_csv(index=False).encode('utf-8')
                csv = convertir_df_a_csv(df_resultados[columnas_ordenadas])
                st.download_button(
                    label="📥 Descargar Ruta como CSV",
                    data=csv,
                    file_name="Mi_Ruta_EV.csv",
                    mime="text/csv",
                    use_container_width=True,
                    key="download_csv" # Añadir key única
                )

            # Información adicional
            st.divider()
            st.subheader("📋 Información Adicional")

            # Enlaces de interés
            col_peajes, col_routeplanner, col_plugshare = st.columns(3)

            with col_peajes:
                peajes_url = "https://plc.mintransporte.gov.co/Estad%C3%ADsticas/Carga-Modo-Terrestre/Peajes"
                st.markdown(f'[🛣️ Mapa de Peajes]({peajes_url})')

            with col_routeplanner:
                routeplanner_url = "https://abetterrouteplanner.com/"
                st.markdown(f'[🚗 Better Route Planner]({routeplanner_url})')

            with col_plugshare:
                plugshare_url = "https://www.plugshare.com/"
                st.markdown(f'[🔌 PlugShare]({plugshare_url})')

    # Indicar que el cálculo terminó
    st.session_state.fase = 'terminado'