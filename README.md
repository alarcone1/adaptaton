# 🚀 Adaptatón Digital

**Plataforma Integral de Gestión Educativa y Retos de Impacto**

Adaptatón Digital es una solución tecnológica diseñada para conectar el talento joven con oportunidades reales a través de un modelo de aprendizaje basado en retos. La plataforma orquesta la interacción entre estudiantes, docentes, aliados (empresas) y administradores, facilitando la creación de cohortes, la validación de evidencias y la construcción de portafolios de talento verificados.

---

## 🌟 Características Principales

La plataforma se divide en 4 módulos especializados, cada uno con una interfaz y funcionalidades adaptadas al rol del usuario:

### 1. 🛠️ Torre de Control (Admin)
Gestión centralizada del ecosistema.
- **Dashboard en Tiempo Real**: KPIs de usuarios, cohortes y actividad reciente.
- **Gestión Académica**: Creación de materias, cohortes (grupos) y asignación de docentes.
- **Arquitecto de Recursos**: Constructor de retos dinámicos con métricas personalizadas.
- **Gestor de Oportunidades**: Publicación de becas y empleos para estudiantes.

### 2. 🎓 La Ruta del Aprendiz (Estudiante)
Experiencia gamificada para el desarrollo de talento.
- **Timeline Interactivo**: Visualización clara del progreso del curso y actividades pendientes.
- **Portafolio de Evidencias**: Captura de retos con soporte multimedia (fotos/texto) y geolocalización.
- **Modo Offline**: Sincronización automática de evidencias cuando se recupera la conexión.
- **Muro de Comunidad**: Feed social para ver los logros de los compañeros de cohorte.

### 3. 👩‍🏫 Panel Docente (Teacher)
Herramientas para facilitar y validar el aprendizaje.
- **Sala de Validación**: Interfaz optimizada para aprobar o rechazar evidencias con retroalimentación.
- **Gradebook**: Matriz de calificaciones y seguimiento de asistencia.
- **Gestión de Cursos**: Control total sobre las actividades y estudiantes asignados.

### 4. 🤝 Vitrina de Talento (Partner)
Conexión con el sector productivo.
- **Showcase**: Exploración de talentos destacados basada en evidencias reales.
- **Gestión de Intereses**: Marcado de candidatos potenciales (Leads).

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando tecnologías modernas para garantizar rendimiento, escalabilidad y una excelente experiencia de usuario:

*   **Frontend**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
*   **Estilos**: [TailwindCSS](https://tailwindcss.com/) (Diseño "mobile-first")
*   **Base de Datos & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
*   **Iconografía**: [Lucide React](https://lucide.dev/)
*   **Mapas**: [Leaflet](https://leafletjs.com/)
*   **Almacenamiento Local**: [IndexedDB](https://developer.mozilla.org/es/docs/Web/API/IndexedDB_API) (para soporte offline)

---

## 🚀 Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu entorno local:

### Prerrequisitos
*   Node.js (v18 o superior)
*   npm o yarn

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/alarcone1/adaptaton.git
    cd adaptaton
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto basándote en el siguiente esquema:

    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
    ```

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Abrir en el navegador:**
    La aplicación estará disponible en `http://localhost:5173`.

---

## 📚 Documentación Adicional

Para profundizar en la estructura y diseño del proyecto, consulta los siguientes documentos internos:

*   [**ROLES.md**](./ROLES.md): Definición detallada de los roles de usuario, permisos y funcionalidades proyectadas.
*   [**ESTILOS.md**](./ESTILOS.md): Guía de estilos, palenta de colores, tipografía y uso de componentes.

---

## 🔒 Seguridad

El sistema implementa **Row Level Security (RLS)** de PostgreSQL para garantizar que:
*   Los estudiantes solo ven su propia data y la de su cohorte.
*   Los docentes solo acceden a los cursos asignados.
*   Los datos sensibles están protegidos a nivel de base de datos.

---

© 2024 Adaptatón Digital. Todos los derechos reservados.
