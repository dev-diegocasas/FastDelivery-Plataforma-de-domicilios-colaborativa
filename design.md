# Sistema de Diseño — FastDelivery

## Tabla de Contenido

1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Design Tokens](#design-tokens)
3. [Tipografía](#tipografía)
4. [Espaciado y Layout](#espaciado-y-layout)
5. [Componentes UI](#componentes-ui)
6. [Estrategia Responsive](#estrategia-responsive)
7. [Patrones por Dispositivo](#patrones-por-dispositivo)
8. [Guía de Implementación](#guía-de-implementación)

---

## Filosofía de Diseño

FastDelivery sigue los principios de **Material Design 3** con un enfoque **mobile-first** para todas las vistas. La paleta de colores, tipografía y espaciado están definidos como tokens CSS en Tailwind v4, garantizando coherencia visual entre todos los componentes y roles de usuario.

### Principios Clave

| Principio | Aplicación |
|-----------|------------|
| **Mobile-first** | Todo componente se diseña primero para móvil (0-639px), luego se mejora con breakpoints superiores |
| **Progressive Enhancement** | Las funcionalidades se añaden a medida que crece el espacio disponible |
| **Touch-friendly** | Targets táctiles mínimos de 44px (WCAG 2.5.5) en todos los controles interactivos |
| **Contenido centrado** | `max-w-container-max-width: 1440px` con márgenes laterales automáticos |
| **Jerarquía clara** | Tres niveles de elevación: surface, surface-container, surface-container-lowest |
| **Estados siempre visibles** | Loading, empty, error y success tienen componentes dedicados |

---

## Design Tokens

### Paleta de Color (Material Design 3)

#### Colores de Superficie

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#f7f9fb` | Fondo de la aplicación |
| `--color-surface` | `#f7f9fb` | Superficie principal (sidebar, header) |
| `--color-surface-container` | `#eceef0` | Contenedores elevados (cards secundarias) |
| `--color-surface-container-low` | `#f2f4f6` | Contenedores semi-elevados |
| `--color-surface-container-lowest` | `#ffffff` | Contenedores al nivel más alto (cards principales, formularios) |
| `--color-surface-container-high` | `#e6e8ea` | Contenedores elevados (modales) |
| `--color-on-surface` | `#191c1e` | Texto e iconos sobre superficies |
| `--color-on-surface-variant` | `#5a413b` | Texto secundario, labels |

#### Colores Primarios

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary` | `#b3290f` | Color principal (enlaces, iconos activos) |
| `--color-primary-container` | `#ff5f40` | Fondo de botones primarios |
| `--color-on-primary` | `#ffffff` | Texto sobre `primary` |
| `--color-on-primary-container` | `#5f0a00` | Texto sobre `primary-container` |

#### Colores Secundarios y Terciarios

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-secondary` | `#565e74` | Elementos secundarios |
| `--color-secondary-container` | `#dae2fd` | Fondo de chips, badges informativos |
| `--color-tertiary` | `#505f76` | Elementos terciarios |

#### Colores de Estado

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-error` | `#ba1a1a` | Texto de error, bordes de error |
| `--color-error-container` | `#ffdad6` | Fondo de mensajes de error |
| `--color-on-error-container` | `#93000a` | Texto sobre error-container |

#### Colores de Borde y Contorno

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-outline` | `#8e706a` | Bordes de inputs enfocados |
| `--color-outline-variant` | `#e3beb7` | Bordes por defecto, separadores |

### Radio de Borde

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-DEFAULT` | `2px` | Bordes sutiles (chips, badges) |
| `--radius-lg` | `4px` | Bordes estándar (inputs, selects) |
| `--radius-xl` | `8px` | Bordes de cards, modales, botones |
| `--radius-full` | `12px` | Bordes completamente redondeados |

### Espaciado

| Token | Valor | Uso |
|-------|-------|-----|
| `--spacing-unit` | `4px` | Unidad base de espaciado |
| `--spacing-density-compact` | `8px` | Espaciado reducido (móvil, listas densas) |
| `--spacing-density-comfortable` | `16px` | Espaciado estándar |
| `--spacing-gutter` | `24px` | Espaciado entre columnas |
| `--spacing-margin-desktop` | `32px` | Márgenes laterales en desktop |
| `--spacing-sidebar-width` | `260px` | Ancho del sidebar |
| `--spacing-container-max-width` | `1440px` | Ancho máximo del contenido principal |

### Safe Area (móviles con notch)

| Token | Valor |
|-------|-------|
| `--spacing-safe-top` | `env(safe-area-inset-top, 0px)` |
| `--spacing-safe-bottom` | `env(safe-area-inset-bottom, 0px)` |
| `--spacing-safe-left` | `env(safe-area-inset-left, 0px)` |
| `--spacing-safe-right` | `env(safe-area-inset-right, 0px)` |

---

## Tipografía

### Familias

| Token | Font Stack |
|-------|-----------|
| Todas las categorías | `Inter, sans-serif` |

La familia Inter se usa para todos los niveles tipográficos. La distinción se logra mediante peso (`font-weight`) y tamaño.

### Escala Base (Desktop, >=1024px)

| Clase Tailwind | Tamaño | Peso | Uso |
|----------------|--------|------|-----|
| `text-display-lg` | 2.5rem (40px) | Bold 700 | Hero titles (landing) |
| `text-display-md` | 2rem (32px) | Bold 700 | Títulos de página |
| `text-headline-lg` | 1.75rem (28px) | Bold 700 | Títulos de sección principal |
| `text-headline-md` | 1.5rem (24px) | Bold 700 | Títulos de card |
| `text-title-lg` | 1.25rem (20px) | Semibold 600 | Botones, títulos secundarios |
| `text-body-lg` | 1rem (16px) | Regular 400 | Texto de cuerpo grande |
| `text-body-md` | 0.875rem (14px) | Regular 400 | Texto de cuerpo estándar |
| `text-body-sm` | 0.75rem (12px) | Regular 400 | Texto secundario |
| `text-label-md` | 0.75rem (12px) | Medium 500 | Labels de formularios (uppercase) |
| `text-label-sm` | 0.625rem (10px) | Medium 500 | Labels pequeños |

### Escala Responsive (usando `clamp()`)

| Clase | Móvil (320px) | Tablet (768px) | Desktop (1024px+) |
|-------|---------------|----------------|-------------------|
| `text-responsive-display` | 1.75rem | 2.25rem | 2.5rem |
| `text-responsive-headline` | 1.25rem | 1.5rem | 1.75rem |
| `text-responsive-title` | 1rem | 1.125rem | 1.25rem |
| `text-responsive-body` | 0.875rem | 1rem | 1rem |
| `text-responsive-label` | 0.75rem | 0.75rem | 0.875rem |

---

## Estrategia Responsive

### Breakpoints

| Prefijo | Ancho | Dispositivo | Layout |
|---------|-------|-------------|--------|
| _Default_ | 0-639px | Móvil | 1 columna, sidebar off-canvas, cards apiladas, bottom sheet modals |
| `sm:` | 640-767px | Móvil grande / Tablet portrait | 2 columnas en grids, nombre de usuario visible, tablas parciales |
| `md:` | 768-1023px | Tablet landscape | Tablas completas, 2-3 columnas, sidebar opcional |
| `lg:` | 1024-1279px | Desktop pequeño | Sidebar estático, 3-4 columnas, padding ampliado, modales centrados |
| `xl:` | 1280-1535px | Desktop grande | 4+ columnas, máximo aprovechamiento del espacio |
| `2xl:` | 1536px+ | Desktop extra grande | Mismo que xl con márgenes laterales máximos |

### Estrategia Mobile-First

Todo componente se escribe con estilos base para móvil (sin prefijo) y se sobrescribe con prefijos para breakpoints superiores:

```tsx
// Correcto (mobile-first)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Incorrecto (desktop-first) — NO USAR
<div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4">
```

### Container Responsive

Todas las páginas deben envolverse en un contenedor que:
- Centre el contenido horizontalmente (`mx-auto`)
- Tenga padding lateral responsive (`px-4 sm:px-6 lg:px-8`)
- Limite el ancho máximo (`max-w-container-max-width`)

Esto se implementa mediante el componente `ResponsiveContainer`.

---

## Patrones por Dispositivo

### Móvil (0-639px)

| Elemento | Comportamiento |
|----------|---------------|
| **Sidebar** | Off-canvas: oculto por defecto, se despliega con botón hamburguesa + overlay con opacidad |
| **Header** | Logo + hamburguesa + icono notificaciones. Sin nombre de usuario ni breadcrumbs |
| **Tablas** | Reemplazadas por cards apiladas con información clave expandible |
| **Modales** | Ocupan casi toda la pantalla (bottom sheet), borde superior redondeado |
| **Formularios** | Campos en columna única, botones `w-full`, labels siempre visibles |
| **Grids** | 1 columna |
| **Touch targets** | Mínimo 44px de altura en botones e inputs |
| **Tipografía** | Escala reducida (~15% menor que desktop) |
| **Navegación** | Single-tap: al navegar, el sidebar se cierra automáticamente |

### Tablet (640-1023px)

| Elemento | Comportamiento |
|----------|---------------|
| **Sidebar** | Opcional: puede estar colapsado (íconos) o visible (texto + íconos) |
| **Header** | Logo + hamburguesa + nombre de usuario abreviado + notificaciones |
| **Tablas** | Visibles completas con scroll horizontal si es necesario |
| **Modales** | Centrados con `max-w-md` o `max-w-lg` |
| **Formularios** | Campos en 2 columnas donde sea lógico |
| **Grids** | 2 columnas para cards, 3-4 para KPIs |
| **Tipografía** | Escala intermedia |

### Desktop (1024px+)

| Elemento | Comportamiento |
|----------|---------------|
| **Sidebar** | Siempre visible, estático, ancho fijo de 260px |
| **Header** | Logo + breadcrumbs + nombre de usuario completo + notificaciones |
| **Tablas** | Completas con todas las columnas visibles |
| **Modales** | Centrados con `max-w-lg` o `max-w-2xl` |
| **Formularios** | Campos en 2-3 columnas, labels a la izquierda opcional |
| **Grids** | 3-4 columnas para cards, 4-6 para KPIs |
| **Contenido** | Centrado con `max-w-[1440px]`, padding lateral de 32px |
| **Tipografía** | Escala completa original |

---

## Componentes UI

### Jerarquía de Componentes

```
ResponsiveContainer          ← Wrapper de layout responsive
├── PageHeader               ← Título + breadcrumbs + acciones
├── Layout
│   ├── Sidebar              ← Navegación principal
│   └── Topbar               ← Header superior
├── UI (genéricos)
│   ├── Button               ← Acciones (variantes: primary, secondary, outline, ghost, danger)
│   ├── Input                ← Campos de texto con icono y toggle de contraseña
│   ├── Select               ← Dropdown de selección
│   ├── Modal / ConfirmModal ← Diálogos modales (sm, md, lg, full)
│   ├── Card                 ← Cards de datos (variantes: RestaurantCard, DishCard, OrderCard)
│   ├── Badge                ← Etiquetas de estado (OrderStatusBadge, OpenBadge)
│   ├── Chip / ChipGroup     ← Chips de filtro/categoría
│   ├── Table                ← Tabla con modo desktop/mobile dual
│   ├── Timeline             ← Línea de tiempo de estados
│   ├── Toast                ← Notificaciones toast
│   ├── Loading              ← Spinner, Skeleton, PageLoading
│   ├── EmptyState           ← Estado vacío con icono y acción
│   └── FileUpload           ← Upload de archivos con drag & drop
└── Específicos
    ├── LoginForm            ← Formulario de inicio de sesión
    ├── RegisterForm         ← Formulario de registro
    └── RoleSelector         ← Selector de rol (3 opciones)
```

### Reglas de Componentes

1. **Todo componente acepta `className`** para extensibilidad
2. **Usar `cn()`** para combinar clases condicionales
3. **No usar estilos inline** — usar clases de Tailwind
4. **Props de variante** (`variant`, `size`) con valores predefinidos, no strings libres
5. **Estados**: todo componente debe contemplar `disabled`, `loading`, `error`
6. **Accesibilidad**: roles ARIA, labels, focus visibles

---

## Guía de Implementación

### Orden de Ejecución del Plan Responsive

#### Fase 1 — Fundación
1. Añadir tokens responsive a `globals.css` (safe-area, tipografía responsive, touch-target)
2. Crear `src/hooks/useBreakpoint.ts`
3. Crear `src/lib/responsive.ts`
4. Crear componente `ResponsiveContainer`
5. Adaptar `Sidebar.tsx` (safe-area insets, animaciones)
6. Adaptar `Topbar.tsx` (elementos condicionales por breakpoint)

#### Fase 2 — Componentes UI Genéricos
7. `Button.tsx` — prop `fullWidth`, touch targets 44px
8. `Input.tsx` / `Select.tsx` — altura responsive, touch-friendly
9. `Modal.tsx` — bottom sheet en móvil, centrado en desktop
10. `Card.tsx` — layouts responsive en RestaurantCard, DishCard, OrderCard
11. `Table.tsx` — patrón dual mejorado
12. `Timeline.tsx` — orientación responsive (vertical/horizontal)
13. `Toast.tsx` — posición full-width en móvil, esquina en desktop
14. `Loading.tsx` — skeletons con grid responsive
15. `EmptyState.tsx` — iconos y padding responsive
16. `FileUpload.tsx` — altura adaptable

#### Fase 3 — Páginas de Autenticación
17. `LoginForm.tsx` — card `w-full` con `max-w-[440px]` solo en `sm:`
18. `RegisterForm.tsx` — card `w-full` con `max-w-[520px]` solo en `sm:`
19. `recuperar-contrasena/page.tsx` — formulario responsive
20. `verificar-correo/page.tsx` — estados responsive
21. `(public)/layout.tsx` — padding responsive

#### Fase 4 — Dashboard Admin
22. `admin/panel/page.tsx` — KPIs y acciones responsive
23. `admin/pedidos/page.tsx` — filtros colapsables, cards móviles
24. `admin/menu/page.tsx` — grid de platos responsive
25. `admin/mi-negocio/page.tsx` — formulario con campos adaptativos

#### Fase 5 — Dashboard Cliente
26. `cliente/explorar/page.tsx` — chips con flechas, skeleton grid
27. `cliente/restaurante/[id]/page.tsx` — layout de detalle responsive
28. `cliente/carrito/page.tsx` — checkout sticky en móvil
29. `cliente/confirmar/page.tsx` — métodos de pago responsive
30. `cliente/tracking/[orderId]/page.tsx` — timeline adaptativo
31. `cliente/pedidos/page.tsx` — cards expandibles

#### Fase 6 — Dashboard Repartidor + Compartidas
32. `repartidor/panel/page.tsx` — KPIs responsive, entrega activa
33. `repartidor/entrega/[orderId]/page.tsx` — detalle con mapa responsive
34. `repartidor/disponibilidad/page.tsx` — toggle centrado
35. `perfil/page.tsx` — direcciones en grid
36. `configuracion/page.tsx` — secciones con separación visual
37. `notificaciones/page.tsx` — lista agrupada
38. `(dashboard)/layout.tsx` — padding responsive

#### Fase 7 — Componentes Nuevos
39. `PageHeader` — encabezado con breadcrumbs y acciones
40. `FilterBar` — filtros colapsables en móvil
41. `AdaptiveGrid` — grid configurable por breakpoint

### Resultado Esperado

| Dispositivo | Columnas Grid | Sidebar | Tablas | Modales | Formularios | Touch Targets |
|-------------|---------------|---------|--------|---------|-------------|---------------|
| Móvil (<640px) | 1 | Off-canvas | Cards | Bottom sheet | 1 col, full-width | 44px+ |
| Tablet (640-1023px) | 2 | Opcional | Completas | Centrados md/lg | 2 col donde aplique | 40px+ |
| Desktop (>=1024px) | 3-4 | Estático 260px | Completas | Centrados lg/2xl | 2-3 col, labels laterales | 36px+ |

---

## Estados y Manejo de Errores

Todo componente debe contemplar estos estados visuales:

| Estado | Componente | Descripción |
|--------|-----------|-------------|
| **Loading** | `LoadingSpinner`, `PageLoading`, `Skeleton`, `CardSkeleton`, `TableSkeleton` | Indicador de carga mientras se obtienen datos |
| **Empty** | `EmptyState` | Mensaje amigable cuando no hay datos, con icono y acción opcional |
| **Error** | Banner `bg-error-container` con `text-on-error-container` | Mensaje de error con posibilidad de reintentar |
| **Success** | Banner verde o toast | Confirmación de operación exitosa |
| **Disabled** | `opacity-60 cursor-not-allowed` | Elementos no interactuables |
