# Herramienta de Diagnóstico Digital - A1ia Tech MVP

Este proyecto es un MVP (Minimum Viable Product) de una herramienta de diagnóstico digital para Unidades Productivas (UP), desarrollado por A1ia Tech. La herramienta permite a las empresas evaluar su nivel de madurez digital a través de un cuestionario inteligente y recibir un plan de acción personalizado para acelerar su transformación digital.

## Características

*   **Cuestionario Inteligente:** Un cuestionario de 119 preguntas para evaluar la madurez digital en 6 dimensiones clave.
*   **Diagnóstico con IA:** El motor de IA, impulsado por Google Gemini, analiza las respuestas y genera un diagnóstico automático.
*   **Análisis DOFA:** La IA también realiza un análisis DOFA (Debilidades, Oportunidades, Fortalezas y Amenazas).
*   **Plan de Acción Personalizado:** Se generan recomendaciones específicas y un plan de acción basado en las brechas identificadas.
*   **Dashboard Interactivo:** Un panel de control visualiza los resultados del diagnóstico y el progreso.
*   **Biblioteca de Recursos:** Una colección de 28 recursos de formación para ayudar a las empresas a mejorar su madurez digital.
*   **Colaboración Humano-IA:** Los asesores expertos pueden validar y ajustar las recomendaciones de la IA.
*   **Diseño Responsivo:** La interfaz de usuario está optimizada para dispositivos móviles.

## Tecnologías Utilizadas

*   **Backend:**
    *   Python 3.10+
    *   FastAPI
    *   SQLAlchemy
    *   SQLite
    *   Google Gemini
    *   Uvicorn
*   **Frontend:**
    *   HTML5
    *   CSS3
    *   JavaScript

## Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/a1ia-tech/digital-diagnosis-mvp.git
    cd digital-diagnosis-mvp
    ```

2.  **Crear un entorno virtual e instalar dependencias:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **Configurar las variables de entorno:**
    Copie el archivo `.env.example` a `.env` y edítelo si es necesario. El archivo `.env` se crea automáticamente si no existe.
    ```bash
    cp .env.example .env
    ```

## Uso

Para iniciar la aplicación, ejecute el siguiente comando:

```bash
python3 run_local.py
```

La aplicación estará disponible en `http://127.0.0.1:8000`.

## API Endpoints

La documentación de la API está disponible en `http://127.0.0.1:8000/docs` (Swagger UI) o `http://127.0.0.1:8000/redoc` (ReDoc).

Los principales endpoints de la API son:

*   `/api/auth`: Autenticación de usuarios.
*   `/api/cuestionario`: Gestión del cuestionario.
*   `/api/diagnostico`: Generación de diagnósticos. Este conjunto de endpoints se encarga de procesar los datos de los cuestionarios para generar los análisis y diagnósticos.
    *   `GET /test-ia`: Endpoint de prueba para verificar la conexión con el motor de IA (Google Gemini).
    *   `POST /generar-dofa-test`: Endpoint de prueba para generar un análisis DOFA de ejemplo.
    *   `POST /procesar-excel`: Endpoint principal que recibe un archivo Excel con las respuestas del cuestionario, lo procesa, calcula puntajes y utiliza la IA para generar un análisis DOFA completo.
*   `/api/recursos`: Acceso a la biblioteca de recursos.
*   `/api/usuarios`: Gestión de usuarios.

## Usuarios Predeterminados

La base de datos se inicializa con los siguientes usuarios:

*   **Admin:** `admin@a1iatech.com` / `admin123`
*   **Asesor:** `asesor@a1iatech.com` / `asesor123`
*   **UP Demo:** `up@empresa.com` / `up123`

*Última actualización: 4 de Septiembre de 2025*