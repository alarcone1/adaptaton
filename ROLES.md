# 🎭 Roles y Funcionalidades del Sistema Adaptatón

Este documento detalla los roles de usuario existentes en la plataforma Adaptatón, sus funcionalidades actuales basadas en el código implementado, y una proyección detallada de posibles desarrollos futuros para potenciar el impacto de la herramienta.

---

## 1. 🎓 Estudiante (Student)
El rol principal del sistema. Son los beneficiarios que participan en los retos, generan evidencia y construyen su portafolio.

### Funcionalidades Actuales
- **Dashboard Personal**: 
  - Vista resumen de su progreso con tarjeta "Tu Progreso" y métricas de impacto.
  - Sección **"Mis Cursos"** para acceso rápido a las materias inscritas por cohorte.
- **Gestión Académica (`/student/course/:id`)**:
  - Visualización detallada del syllabus del curso.
  - Estado de actividades (Pendiente, Enviado, Validado).
  - Acceso directo a la carga de evidencia vinculada a una actividad específica.
- **Captura de Evidencia (`/capture`)**:
  - Herramienta offline-first para documentar retos y actividades de curso.
  - Subida de fotografías como prueba de ejecución.
  - Registro automático de geolocalización (GPS).
  - Sincronización automática cuando se recupera la conexión.
- **Feed de Comunidad (`/feed`)**: Visualización de evidencias generadas por sus compañeros (limitado por cohorte para privacidad).
- **Oportunidades (`/opportunities`)**: Acceso a ofertas o beneficios publicados por los aliados (Partners).

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
- **Dashboard de Docente**: Panel de control para seguimiento de cursos asignados (`TeacherCourseManager`).
- **Gestión de Cursos**:
  - **Plan de Estudios**: Visualización y gestión de módulos y actividades.
  - **Asistencia**: Herramienta para tomar lista (Presente, Ausente, Tarde, Excusado) con selectores de fecha.
  - **Estudiantes**: 
    - Listado completo (Roster) de estudiantes inscritos.
    - Buscador en tiempo real y filtros.
    - Acciones de gestión (Eliminar estudiante del curso).
- **Vista de Evidencias**: Acceso total a las evidencias subidas por los estudiantes (mediante políticas RLS `Staff Full Access`).
- **Gestión Académica**: Supervisión del avance de los cohortes asignados.

### 🚀 Futuros Desarrollos
1. **Herramienta de Calificación (Rubrics)**:
   - Interfaz para evaluar evidencias con criterios específicos (1-5 estrellas, comentarios cualitativos).
   - Capacidad de solicitar correcciones ("Rechazar con feedback") a una evidencia.
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
- **Gestión de Leads**: (Visto en esquema de base de datos `leads`) Capacidad de marcar interés en ciertos perfiles.

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
- **Torre de Control (`AdminDashboard`)**: Vista centralizada con KPIs en tiempo real (Usuarios, Recursos, Oportunidades, Cohortes, Evidencias, Impacto).
- **Gestión de Usuarios 360°**: 
  - ABM completo de todos los roles (Estudiantes, Docentes, Aliados, Admins).
  - Asignación de **múltiples cohortes** para roles de staff (Docentes, Partners).
  - Control de matriculación de estudiantes.
- **Gestión de Cohortes**: 
  - Administración de grupos de trabajo (Creación, Edición, Fechas).
  - Matriculación y desvinculación de estudiantes.
- **Arquitecto de Recursos (`ResourceBuilder`)**: 
  - Creación de retos con esquemas de métricas dinámicos.
  - Definición de tipos de datos a capturar (Texto, Foto, GPS, Numérico).
- **Gestor de Oportunidades**: 
  - Publicación de ofertas (Becas, Empleo) segmentadas por tipo de cohorte (Minor/Adult).

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
