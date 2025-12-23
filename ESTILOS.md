# Guía de Estilos y Diseño - Adaptatón Digital / Panel Admin

Este documento define los estándares visuales y de diseño implementados para el Panel de Administración de Adaptatón Digital. Su objetivo es garantizar la consistencia visual en futuras expansiones.

## 1. Identidad Cromática

La paleta de colores busca transmitir profesionalismo, calma y energía, alineada con la identidad de marca institucional y el concepto de "Frescura Caribeña".

### Colores Principales
*   **Morado Profundo (Primary)**: `#4B3179`
    *   *Uso*: Identidad de marca, encabezados principales, fondos de botones activos, bordes de elementos seleccionados.
*   **Turquesa (Secondary)**: `#42A799`
    *   *Uso*: Acentos, estados de éxito, degradados, bordes laterales de tarjetas de usuarios.
*   **Azul Noche (Text Main)**: `#1E1F3D`
    *   *Uso*: Color principal de texto para párrafos y lectura general.
*   **Azul Oscuro Titulares**: `#1B1B3F`
    *   *Uso Exclusivo*: Títulos de tarjetas (Cards) y encabezados de formularios (Labels).

### Colores de Estado y Módulos
Colores específicos asignados para diferenciar visualmente los tipos de contenido en las tarjetas (Border-Left):
*   **Usuarios**: `#66AD9D` (Verde Turquesa Suave)
*   **Cohortes**: `#D45A4E` (Rojo Ladrillo Suave)
*   **Materias**: `#1B1B3F` (Azul Oscuro)
*   **Oportunidades**: `#E49744` (Naranja Dorado)

## 2. Tipografía

*   **Familia**: `Roboto`, sans-serif.
*   **Jerarquía**:
    *   **Títulos de Página**: `text-3xl font-black` (Color: `#4B3179`).
    *   **Subtítulos de Página**: `text-gray-500`.
    *   **Títulos de Tarjetas**: `text-lg font-bold` (Color: `#1B1B3F`).
    *   **Labels de Formularios**: `text-xs font-bold uppercase tracking-wide` (Color: `#1B1B3F`).
    *   **Cuerpo**: `text-sm font-normal` (Color: `#4B3179` o `#1E1F3D`).

## 3. Componentes UI

### Botones (Buttons)
Todos los botones de acción principal y secundaria siguen un estilo de "Píldora".

*   **Forma**: `rounded-full` (Shape Pill).
*   **Variante Primaria ("Guardar" / "+ Nuevo")**:
    *   *Fondo*: Degradado lineal `linear-gradient(to right, #42A799, #4B3179)`.
    *   *Texto*: Blanco (`text-white`).
    *   *Sombra*: `shadow-lg`, aumenta a `shadow-xl` en hover.
    *   *Efecto Hover*: Escala ligera (`scale-105`).
*   **Variante Secundaria / Outline ("Cancelar")**:
    *   *Borde*: 2px sólido color `#4B3179`.
    *   *Texto*: `#4B3179`.
    *   *Fondo Hover*: `#4B3179` con opacidad 5%.
*   **Estado Deshabilitado (Disabled)**:
    *   *Fondo*: Mantiene el degradado original.
    *   *Overlay*: Capa blanca al 50% de opacidad (`bg-white/50`) para dar efecto "lavado".
    *   *Cursor*: `not-allowed`.
    *   *Tooltip*: Muestra "Completar los campos" en color `#66AD9D` con fondo blanco al hacer hover.

### Componente Modal (Ventanas Emergentes)
Estandarizado para crear, editar y ver detalles.

*   **Contenedor**: Fondo blanco, esquinas redondeadas `rounded-2xl`, sombra profunda `shadow-2xl`.
*   **Animación de Entrada**: `animate-in zoom-in-95 duration-200`.
*   **Backdrop**: Blur desenfocado (`backdrop-blur-md`) con oscurecimiento suave (`bg-black/30`).
*   **Encabezado**:
    *   Icono dinámico (Crear: `Plus`, Editar: `Edit2`) dentro de un contenedor "Squircle" (`rounded-lg`) con fondo `#F3E8FF` (morado muy suave).
*   **Pie de Página (Footer)**:
    *   Botones alineados a la derecha.
    *   Botón de guardar siempre muestra icono (ej. `Save` o floppy disk).

### Tarjetas (Cards)
Utilizadas para listas de elementos en los gestores (Usuarios, Cohortes, etc.).

*   **Contenedor**: Blanco, borde suave, sombra ligera al hover.
*   **Efecto Hover**: Elevación ligera de sombra.
*   **Identificador Visual**: Borde izquierdo sólido de 4px (`border-l-4`) con el color específico del módulo (ver sección Colores de Estado).
*   **Iconos**:
    *   Contenedor con esquinas suaves `rounded-xl`.
    *   *Reposo*: Fondo transparente/suave con icono del color del módulo.
    *   *Hover*: El fondo se llena con el color del módulo y el icono se vuelve blanco (Inversión de color).

## 4. Iconografía y Efectos

*   **Librería**: `lucide-react`.
*   **Estilo**: Línea simple y limpia.
*   **Animaciones Micro**:
    *   Botones crecen levemente al presionar (`active:scale-95`).
    *   Transiciones suaves de color (`transition-colors duration-300`) en todos los elementos interactivos.
    *   Fondos orgánicos con degradados radiales sutiles en el `body`.

---
*Este documento debe ser consultado antes de crear nuevas pantallas para mantener la coherencia visual.*
