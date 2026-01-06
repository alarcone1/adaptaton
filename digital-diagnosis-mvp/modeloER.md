erDiagram
    USUARIOS {
        int id PK
        string email UK
        string password_hash
        string nombre
        string rol
        boolean activo
        datetime fecha_creacion
        datetime fecha_ultimo_acceso
        string sector
        string tamano_empresa
    }

    DIMENSIONES {
        int id PK
        string nombre
        string descripcion
        int orden
        boolean activa
    }

    SUBDIMENSIONES {
        int id PK
        int dimension_id FK
        string nombre
        string descripcion
        int orden
        boolean activa
    }

    PREGUNTAS {
        int id PK
        string codigo
        int subdimension_id FK
        string texto_pregunta
        json opciones_respuesta
        int peso
        boolean activa
        int orden
    }

    DIAGNOSTICOS {
        int id PK
        int up_id FK
        int asesor_id FK
        datetime fecha_inicio
        datetime fecha_finalizacion
        string estado
        float puntaje_global
        json puntajes_dimensiones
        json analisis_dofa
        json recomendaciones
    }

    RESPUESTAS {
        int id PK
        int diagnostico_id FK
        int pregunta_id FK
        string respuesta_seleccionada
        int valor_calculado
        datetime fecha_respuesta
    }

    RECURSOS {
        int id PK
        string titulo
        string descripcion
        string categoria
        string tipo
        string url
        json dimensiones_relacionadas
        json nivel_madurez
        boolean activo
        datetime fecha_creacion
    }

    ASIGNACIONES_ASESOR {
        int id PK
        int asesor_id FK
        int up_id FK
        datetime fecha_asignacion
        boolean activa
        string notas
    }

    SEGUIMIENTO_RECURSOS {
        int id PK
        int diagnostico_id FK
        int recurso_id FK
        int up_id FK
        string estado
        datetime fecha_asignacion
        datetime fecha_inicio
        datetime fecha_completado
        float progreso_porcentaje
        string comentarios
    }

    %% Relaciones principales
    USUARIOS ||--o{ DIAGNOSTICOS : "UP realiza"
    USUARIOS ||--o{ DIAGNOSTICOS : "Asesor gestiona"
    USUARIOS ||--o{ ASIGNACIONES_ASESOR : "UP asignada"
    USUARIOS ||--o{ ASIGNACIONES_ASESOR : "Asesor tiene"
    
    DIMENSIONES ||--o{ SUBDIMENSIONES : "contiene"
    SUBDIMENSIONES ||--o{ PREGUNTAS : "tiene"
    
    DIAGNOSTICOS ||--o{ RESPUESTAS : "incluye"
    PREGUNTAS ||--o{ RESPUESTAS : "respondida"
    
    DIAGNOSTICOS ||--o{ SEGUIMIENTO_RECURSOS : "asigna"
    RECURSOS ||--o{ SEGUIMIENTO_RECURSOS : "usado en"
    USUARIOS ||--o{ SEGUIMIENTO_RECURSOS : "UP progresa"