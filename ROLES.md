# 🎭 Roles y Funcionalidades del Sistema Adaptatón

Este documento detalla los roles de usuario existentes en la plataforma Adaptatón, sus funcionalidades actuales basadas en el código implementado, y una proyección detallada de posibles desarrollos futuros para potenciar el impacto de la herramienta.

---

## 1. 🎓 Estudiante (Student)
El rol principal del sistema. Son los beneficiarios que participan en los retos, generan evidencia y construyen su portafolio.

### Funcionalidades Actuales
- **Dashboard Personal**:
  - Vista resumen de su progreso con tarjeta "Tu Progreso" y métricas de impacto acumuladas.
  - Sección **"Mis Cursos"** para acceso rápido a las materias inscritas por cohorte.
- **La Ruta del Aprendiz (`/student/course/:id`)**:
  - **Experiencia de Línea de Tiempo**: Visualización interactiva vertical (`ActivityTimeline`) que reemplaza las listas tradicionales.
  - **Lógica de Bloqueo**: Las actividades futuras aparecen bloqueadas (candado) hasta que se completen los prerrequisitos.
  - **Gestión de Rechazos**: Si una actividad es rechazada por el docente, se crea una ramificación visual ("Branching") que permite un "Nuevo Intento" manteniendo el historial.
- **Captura de Evidencia Robusta (`/student/capture`)**:
  - **Arquitectura Offline-First**: 
    - El "Motor de Sincronización Silenciosa" (`useAutoSync`) descarga automáticamente esquemas y recursos al iniciar sesión.
    - Las evidencias se guardan en cola local (IndexedDB) si no hay conexión.
    - Re-intento automático de subida al recuperar conexión.
  - **Soporte de Reintentos**: Vinculación automática de nuevas evidencias con sus versiones anteriores (rechazadas) mediante `parent_evidence_id`.
  - Herramientas de campo: Geolocalización (GPS) y cámara integrada.
- **Feed de Comunidad (`/student/feed`)**: Visualización de evidencias generadas por sus compañeros (limitado por cohorte para privacidad).
- **Oportunidades (`/student/opportunities`)**: Acceso a ofertas o beneficios publicados por los aliados (Partners).

### 🚀 Futuros Desarrollos
1. **Gamificación Avanzada**:
   - *Sistema de Insignias*: Otorgar badges digitales por hitos (ej. "Primer Reto Complado", "Explorador").
   - *Rachas (Streaks)*: Bonificación por subir evidencia días consecutivos.
   - *Niveles*: Experiencia (XP) que desbloquea avatares o temas visuales.
2. **Portafolio Exportable**:
   - Generación automática de un CV/Hoja de Vida en PDF basado en las habilidades demostradas en los retos.
   - Página pública de perfil ("Talent Card") para compartir en LinkedIn.
3. **Feedback entre Pares**:
   - Posibilidad de dar "kudos" o comentarios constructivos a las evidencias de compañeros de cohorte.

---

## 2. 👩‍🏫 Docente / Facilitador (Teacher)
Encargados de guiar el proceso y validar el aprendizaje de los estudiantes.

### Funcionalidades Actuales
- **Dashboard de Docente**: Panel de control centralizado (`TeacherCourseManager`).
- **Gestión Integral de Cursos**:
  - **Planificación**: Visualización de módulos y asignación de actividades.
  - **Sala de Validación**: Interfaz dedicada para revisar evidencias pendientes.
    - Visualización de medios (fotos/texto).
    - Asignación de puntaje de impacto y retroalimentación escrita.
    - Acciones de Aprobar o Rechazar (que dispara el flujo de reintento en el estudiante).
  - **Calificaciones (Gradebook)**: Matriz completa de estudiantes vs. actividades con estados de entrega.
  - **Asistencia**: Herramienta de pase de lista con opciones (Presente, Ausente, Tarde, Excusado).
  - **Gestión de Estudiantes**: Roster completo con buscador y acciones de gestión.
- **Seguridad**: Acceso total a datos académicos de sus cursos asignados mediante RLS.

### 🚀 Futuros Desarrollos
1. **Rúbricas Avanzadas**:
   - Definición de criterios múltiples y complejos para evaluación.
2. **Analíticas de Progreso**:
   - Gráficos de desempeño grupal e individual.
   - Alertas tempranas para estudiantes en riesgo de deserción o con baja actividad.
3. **Gestión de Cohortes**:
   - Herramientas para mover estudiantes entre grupos.
   - Creación de retos personalizados para su clase específica.

---

## 3. 🤝 Aliado (Partner)
Organizaciones o empresas interesadas en el impacto social o en conectar con talento joven.

### Funcionalidades Actuales
- **Showcase de Talento (`/partner`)**: Vista curada de las mejores evidencias y perfiles.
- **Acceso a Evidencia Validada**: Según políticas de seguridad, solo ven contenido que ha pasado por un filtro de calidad (`status = 'validated'` y `is_highlighted = true`).
- **Gestión de Leads**: (Backend) Capacidad de marcar interés en ciertos perfiles.

### 🚀 Futuros Desarrollos
1. **Pipeline de Contratación**:
   - Tablero estilo Kanban para gestionar candidatos (estudiantes destacados).
   - "Matchmaking" inteligente basado en las habilidades demostradas por los estudiantes vs. necesidades del aliado.
2. **Patrocinio de Retos**:
   - Funcionalidad para que un Partner cree un "Reto Corporativo" con premios específicos.
   - Dashboard de impacto: Ver cuántos estudiantes participaron en su reto y el impacto generado (ej. árboles plantados, horas de código).
3. **Mensajería Directa**:
   - Canal seguro para contactar a estudiantes prometedores (supervisado por docentes/cuidadores si aplica a menores).

---

## 4. 🛠️ Administrador (Admin)
Gestores de la plataforma tecnológica y operativa.

### Funcionalidades Actuales
- **Torre de Control (`AdminDashboard`)**: 
  - KPIs en tiempo real: Usuarios totales, Cohortes activos, Oportunidades, Evidencias globales.
- **Gestión de Usuarios ("People Ops")**: 
  - ABM completo (Crear, Editar, Eliminar) de todos los roles.
  - Asignación de **múltiples cohortes** para roles de staff.
  - Control de acceso y matriculación.
- **Gestión Académica ("Academic Ops")**:
  - **Cohortes (`/admin/cohorts`)**: Administración del ciclo de vida de los grupos (Minors/Adults).
  - **Materias (`/admin/subjects`)**: Catálogo maestro de asignaturas y créditos.
- **Arquitecto de Recursos (`ResourceBuilder`)**: 
  - **Constructor de Esquemas**: Creación dinámica de retos definiendo qué métricas capturar (Texto, Foto, Checkbox, GPS, Numérico).
  - Centralización de la biblioteca de recursos reutilizables.
- **Gestor de Oportunidades**: 
  - Publicación y segmentación de ofertas (Becas, Empleo) para estudiantes.

### 🚀 Futuros Desarrollos
1. **CMS de Contenidos**:
   - Editor visual para crear nuevos Retos/Misiones sin tocar código.
   - Gestión de noticias o blog interno de la plataforma.
2. **Auditoría y Logs**:
   - Historial detallado de acciones sensibles (quién borró qué, quién validó a quién).
3. **Módulo de Reportes**:
   - Generación de reportes de impacto para donantes/directivos (PDF/Excel) con un clic.

---

## 5. 🌍 Público (Public)
Usuarios no autenticados o visitantes generales.

### Funcionalidades Actuales
- **Landing Page**: Información institucional.
- **Mapa de Impacto (`/map`)**: Visualización geoespacial de donde está ocurriendo el cambio.
- **Login/Registro**: Puerta de entrada al sistema seguro.

### 🚀 Futuros Desarrollos
1. **Muro de la Fama Público**:
   - Sección abierta mostrando las historias de éxito más inspiradoras (previa anonimización si es necesario).
2. **Mapa de Calor en Tiempo Real**:
   - Visualización dinámica de actividad (ej. "¡Alguien acaba de completar un reto en Bogotá!").
3. **Donaciones/Voluntariado**:
   - Integración para que el público pueda apoyar micro-proyectos o retos específicos.

---

## Resumen Técnico de Seguridad (Cross-Role)
El sistema utiliza **Row Level Security (RLS)** en Supabase para garantizar que:
- Los **Estudiantes** solo vean su data y la de su cohorte inmediato.
- Los **Partners** solo vean data curada y de alta calidad.
- La información sensible (teléfonos, cédulas) está protegida a nivel de base de datos en vistas seguras (`public_profiles`).
