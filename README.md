
# 🚚 FastDelivery — Plataforma de domicilios colaborativa

Plataforma web integral que conecta **clientes**, **restaurantes (admin)** y **repartidores** en un ecosistema colaborativo para la gestión completa de pedidos a domicilio. Automatiza el flujo desde la exploración de restaurantes, creación de pedidos, aceptación del admin y pago del cliente, hasta la asignación del repartidor y validación de la entrega mediante token de compra.

---

## 📋 Tabla de contenido

- [Objetivo general](#objetivo-general)
- [Problematica o necesidad abordada](#problematica-o-necesidad-abordada)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Demostracion del funcionamiento](#demostracion-del-funcionamiento)
- [Componentes importantes del codigo](#componentes-importantes-del-codigo)
- [Herramientas y tecnologias](#herramientas-y-tecnologias)
- [Conclusiones y mejoras futuras](#conclusiones-y-mejoras-futuras)

---

## 🎯 Objetivo general

Desarrollar una plataforma web escalable y segura que permita la interacción entre tres roles —cliente, administrador de restaurante y repartidor— automatizando el ciclo completo de un pedido a domicilio: desde la exploración del menú y creación del pedido, pasando por la aceptación del restaurante y el pago del cliente, hasta la asignación del repartidor y la validación de la entrega mediante un token de compra único.

---

## 🔍 Problemática o necesidad abordada

| Problema | Solucion implementada |
|----------|-----------------------|
| Restaurantes sin plataforma propia de domicilios | Cada admin puede registrar su negocio, gestionar su menú y recibir pedidos en una interfaz web unificada |
| Falta de trazabilidad en las entregas | Token de compra único generado al momento del pago, validado por el repartidor al entregar el pedido |
| Repartidores sin visibilidad de pedidos disponibles | Panel con pedidos pendientes, sistema de aceptación/rechazo y bloqueo automático de disponibilidad |
| Comunicación fragmentada entre los actores | Notificaciones automáticas con polling cada 30 segundos para admin, cliente y repartidor en cada cambio de estado |
| Seguridad en pagos no verificados | El pago solo se habilita después de que el admin acepta el pedido; sin aceptación no hay cobro |
| Cuentas sin verificacion de identidad | Registro con verificación de correo electrónico vía Nodemailer + Gmail SMTP; el usuario no puede iniciar sesión sin verificar |

---

## ⚙️ Funcionalidades implementadas

### Autenticacion y seguridad de cuentas

| Funcionalidad | Descripcion |
|---------------|-------------|
| Registro con verificacion de email | Al registrarse se envía un enlace de verificación al correo. Solo se puede iniciar sesión tras verificar la cuenta |
| Recuperacion de contrasena | Solicitud por correo con token de un solo uso y expiración de 1 hora |
| Cambio de contrasena | Desde el área de Configuración, requiriendo la contraseña actual para validar la identidad |
| Eliminacion de cuenta | Soft-delete con anonimización del email y limpieza de datos vinculados (restaurante, platos, direcciones, notificaciones) |
| Roles protegidos por middleware | Middleware `proxy.ts` que valida el rol (`cliente`, `admin`, `repartidor`) y redirige según permisos |
| Notificaciones en tiempo real | Polling cada 30 segundos con badge de conteo de no leídas en el Topbar |

### Flujo de pedidos — 6 estados

```
RECIBIDO ──admin acceptOrder──→ ACEPTADO ──cliente payOrder──→ EN_PREPARACION ──repartidor acceptDelivery──→ EN_CAMINO ──repartidor con token──→ ENTREGADO
    │                              │                              │                                              │
    └──admin rejectOrder──→ CANCELADO  ←──admin──┘   ←──admin──┘                         ←──admin/repartidor──┘
```

| Estado | Quien actua | Accion |
|--------|-------------|--------|
| `RECIBIDO` | Admin | Aceptar o rechazar el pedido |
| `ACEPTADO` | Cliente | Realizar el pago (se habilita botón **Pagar pedido**) |
| `EN_PREPARACION` | Repartidor | Ver pedido disponible en el panel y aceptarlo |
| `EN_CAMINO` | Repartidor | Ingresar el token de compra que el cliente le proporcionó y marcar como entregado |
| `ENTREGADO` | Cliente | Calificar el pedido con estrellas y reseña |
| `CANCELADO` | Admin | Cancelar en cualquier momento desde el panel de pedidos |

### Panel del cliente (7 paginas)

| Pagina | Funcionalidad |
|--------|---------------|
| Explorar restaurantes | Cards con nombre, categoría, rating, tiempo estimado y pedido mínimo |
| Ver restaurante | Menú de platos con precios, agregar al carrito |
| Carrito de compras | Persistido en localStorage, cambiar cantidades, eliminar productos |
| Confirmar pedido | Seleccionar dirección de entrega, observaciones, método de pago |
| Tracking del pedido | Timeline visual de estados, botón de pago, token de compra con copiar, reseña |
| Mis pedidos | Lista con cantidad de productos y total |
| Pago | Pantalla de resultado del pago |

### Panel del administrador (4 paginas)

| Pagina | Funcionalidad |
|--------|---------------|
| Panel (Dashboard) | KPIs: platos activos, pedidos hoy, pendientes, calificación promedio |
| Mi negocio | Crear y editar restaurante (nombre, descripción, categoría, dirección, tiempo estimado) |
| Menu | CRUD de platos: crear, editar, activar/desactivar, eliminar |
| Pedidos | Ver, aceptar, rechazar pedidos con detalle del cliente, productos y total |

### Panel del repartidor (3 paginas)

| Pagina | Funcionalidad |
|--------|---------------|
| Panel (Dashboard) | Pedidos disponibles, badge de notificaciones, entrega activa, historial |
| Disponibilidad | Toggle para activar/desactivar recepción de pedidos |
| Entrega | Detalle completo del pedido (restaurante, cliente, dirección, productos), botón de aceptar, campo para token de compra |

---

## 🎬 Demostracion del funcionamiento

### Flujo completo de un pedido

```
 1. Cliente: explora restaurantes → selecciona Burger House
 2. Cliente: añade platos al carrito → confirma pedido → RECIBIDO
 3. Admin:  recibe notificación → ve pedido en el panel → lo ACEPTA
 4. Cliente: tracking muestra "Aceptado" + botón [Pagar pedido]
 5. Cliente: paga → se genera el token de compra → EN_PREPARACION
 6. Admin:   recibe notificación "Pedido pagado"
 7. Repartidor: recibe notificación → activa disponibilidad → ve pedido
 8. Repartidor: revisa detalles → acepta → EN_CAMINO (bloqueado para otros pedidos)
 9. Repartidor: ingresa el token que el cliente le compartió → valida → ENTREGADO
10. Admin:   recibe notificación "Pedido entregado"
11. Cliente: tracking muestra "Entregado" → califica con estrellas
```

---

## 📁 Componentes importantes del codigo

### Arquitectura de archivos

```
src/
├── app/
│   ├── (dashboard)/                  # 17 paginas protegidas
│   │   ├── cliente/                  #   7 paginas (explorar, pedidos, tracking, carrito, etc.)
│   │   ├── admin/                    #   4 paginas (panel, mi-negocio, menu, pedidos)
│   │   └── repartidor/               #   3 paginas (panel, disponibilidad, entrega)
│   │   ├── configuracion/            #   1 pagina (notificaciones, contrasena, eliminar cuenta)
│   │   ├── notificaciones/           #   1 pagina
│   │   └── perfil/                   #   1 pagina (info + direcciones)
│   ├── (public)/                     # 4 paginas publicas (login, registro, recuperar, verificar)
│   └── api/auth/
│       ├── [...nextauth]/            # NextAuth.js route handler
│       └── register/route.ts         # API de registro
├── features/                         # 7 archivos de server actions (logica de negocio)
│   ├── auth.auth.actions.ts          #   auth: changePassword, deleteAccount, verifyEmail
│   ├── orders.actions.ts             #   orders: createOrder, payOrder, getUserOrders
│   ├── menu.actions.ts               #   menu: acceptOrder, rejectOrder, CRUD dishes
│   ├── repartidor.actions.ts         #   repartidor: acceptDelivery, rejectDelivery, updateDeliveryStatus
│   ├── reviews.actions.ts            #   reviews: createReview, checkCanReview
│   ├── notifications.actions.ts      #   notifications: getUnreadCount, markAsRead
│   └── addresses.actions.ts          #   addresses: CRUD de direcciones
├── components/
│   ├── ui/                           # 13 componentes reutilizables
│   │   ├── Button, Input, Select     #   Formularios
│   │   ├── Modal, ConfirmModal       #   Modales
│   │   ├── Toast                     #   Notificaciones toast
│   │   ├── Card, Badge, OrderCard    #   Visualizacion de datos
│   │   ├── Timeline                  #   Timeline de estados
│   │   └── EmptyState, PageLoading   #   Estados vacios/carga
│   ├── layout/                       # Sidebar, Topbar (navegacion)
│   └── auth/                         # RegisterForm, RoleSelector
├── lib/
│   ├── auth/                         # NextAuth config + JWT/session callbacks
│   ├── db/                           # Neon Postgres + Drizzle ORM connection
│   ├── email.ts                      # Nodemailer SMTP (Gmail)
│   ├── validations/index.ts          # 13 schemas Zod
│   ├── logger.ts                     # Logger estructurado
│   └── utils.ts                      # formatCurrency, cn, formatDate
├── config/
│   ├── routes.ts                     # 14 rutas configurables por rol
│   └── constants.ts                  # Enums, labels, colores, limites
├── types/
│   ├── index.ts                      # 10 interfaces (User, Order, Restaurant, etc.)
│   └── next-auth.d.ts                # Augmentation de Session/JWT
├── drizzle/
│   ├── schema.ts                     # 12 tablas, 5 enums, 10 relaciones
│   └── migrations/                   # 3 migraciones SQL
└── proxy.ts                          # Middleware de autorizacion por rol
```

### Server Actions destacadas

| Archivo | Funcion | Rol | Descripcion |
|---------|---------|-----|-------------|
| `orders.actions.ts` | `createOrder()` | Cliente | Crea pedido (RECIBIDO), notifica al admin y al cliente |
| `orders.actions.ts` | `payOrder()` | Cliente | Transicion ACEPTADO → EN_PREPARACION, genera token de compra, crea pago mock, notifica admin + repartidores |
| `menu.actions.ts` | `acceptOrder()` / `rejectOrder()` | Admin | Admin acepta (RECIBIDO→ACEPTADO) o rechaza (→CANCELADO) un pedido |
| `menu.actions.ts` | `createRestaurant()` / `updateRestaurant()` | Admin | CRUD del restaurante y sus platos |
| `repartidor.actions.ts` | `acceptDelivery()` | Repartidor | EN_PREPARACION→EN_CAMINO, asigna repartidor, bloquea disponibilidad |
| `repartidor.actions.ts` | `rejectDelivery()` | Repartidor | Registra rechazo en `order_rejections` (pedido sigue disponible para otros) |
| `repartidor.actions.ts` | `updateDeliveryStatus()` | Repartidor | EN_CAMINO→ENTREGADO, valida token de compra, desbloquea disponibilidad, notifica admin |
| `auth.actions.ts` | `changePassword()` | Todos | Cambia contrasena validando la actual |
| `auth.actions.ts` | `deleteAccount()` | Todos | Soft-delete con anonimizacion, limpia datos vinculados segun rol |
| `auth.actions.ts` | `verifyEmail()` / `requestPasswordReset()` | Todos | Verifica correo con token, solicita reseteo de contrasena |
| `reviews.actions.ts` | `createReview()` | Cliente | Crea reseña, recalcula y actualiza `avgRating` del restaurante |

### Base de datos — 12 tablas

| Tabla | Columnas | Descripcion |
|-------|----------|-------------|
| `users` | 16 | Usuarios con roles, verificacion, soft-delete |
| `restaurants` | 17 | Restaurantes con adminId, categoria, rating |
| `dishes` | 10 | Platos con precio, activo, soft-delete |
| `orders` | 15 | Pedidos con estados, token de compra |
| `order_items` | 7 | Productos de cada pedido |
| `payments` | 7 | Pagos realizados |
| `reviews` | 7 | Resenas con rating 1-5 |
| `notifications` | 8 | Notificaciones por usuario |
| `addresses` | 8 | Direcciones de usuario |
| `order_status_log` | 6 | Auditoria de cambios de estado |
| `repartidor_availability` | 4 | Disponibilidad de repartidores |
| `order_rejections` | 4 | Pedidos rechazados por repartidor |

---

## 🛠️ Herramientas y tecnologias

### Stack principal

| Categoria | Tecnologia | Version |
|-----------|------------|---------|
| **Framework** | Next.js (App Router + Turbopack) | 16.2.6 |
| **Libreria UI** | React | 19.2.4 |
| **Lenguaje** | TypeScript | 5.x |
| **Estilos** | Tailwind CSS | v4 |
| **Iconos** | Material Symbols (Google) | 0.44.10 |
| **Autenticacion** | NextAuth.js (Auth.js v5) | 5.0.0-beta.31 |
| **Base de datos** | Neon Serverless Postgres | 17 |
| **ORM** | Drizzle ORM | 0.45.2 |
| **Validacion** | Zod | 4.4.3 |
| **Hashing** | bcryptjs | 3.0.3 |
| **Email** | Nodemailer (Gmail SMTP) | 7.0.13 |
| **CLI BD** | Drizzle Kit | 0.31.10 |
| **Linter** | ESLint + Prettier | 9.x / 3.8.3 |

### Metricas del proyecto

| Metrica | Valor |
|---------|-------|
| Paginas totales | **22** |
| Roles de usuario | **3** (cliente, admin, repartidor) |
| Estados de pedido | **6** |
| Tablas en base de datos | **12** |
| Columnas totales | **108** |
| Enums en BD | **5** |
| Relaciones en BD | **10** |
| Archivos de server actions | **7** |
| Funciones exportadas | ~**35** |
| Componentes UI personalizados | **13** |
| Schemas de validacion (Zod) | **13** |
| Tipos de notificacion | **10** |
| Categorias de restaurante | **10** |
| Rutas navegables | **14** |
| Dependencias de produccion | **11** |

### Scripts disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para produccion
npm start            # Iniciar servidor de produccion
npm run lint         # Ejecutar ESLint
npm run format       # Formatear codigo con Prettier
npx drizzle-kit generate   # Generar migracion
npx drizzle-kit push       # Aplicar migracion a BD
npx tsx scripts/seed.ts    # Ejecutar seed de datos
```

---

## ✅ Conclusiones y mejoras futuras

### Conclusiones

1. **Arquitectura full-stack moderna**: Se implementó una plataforma completa con separación clara de 3 roles y un flujo de pedidos de 6 estados, utilizando Next.js 16 con App Router y Server Actions para mantener la lógica de negocio del lado del servidor.

2. **Seguridad en multiples capas**: El sistema cuenta con verificación de email al registro, recuperación de contraseña con tokens expirables, middleware de autorización por rol, soft-delete de cuentas y validación de entregas mediante token de compra.

3. **Notificaciones automatizadas**: El mecanismo de polling cada 30 segundos mantiene a los 3 actores informados en tiempo real sobre cada cambio de estado del pedido, mejorando la comunicación sin depender de WebSockets.

4. **Token de compra como validacion de entrega**: El token único generado al pagar y validado por el repartidor al entregar agrega una capa de seguridad que garantiza que el pedido llega al cliente correcto.

5. **Base de datos relacional optimizada**: Con 12 tablas, 5 enums, 10 relaciones y más de 20 índices, el esquema cubre todas las necesidades del dominio sin redundancia, manteniendo la integridad referencial.

6. **Experiencia de usuario consistente**: Los componentes UI personalizados con Tailwind CSS v4 y Material Symbols ofrecen una interfaz limpia, responsiva y accesible, siguiendo el sistema de diseño Material Design 3.

### Posibles mejoras futuras

| Mejora | Descripcion |
|--------|-------------|
| **Pasarela de pago real** | Integrar Stripe, MercadoPago o PayU para procesar pagos reales en reemplazo del mock actual |
| **WebSockets en tiempo real** | Reemplazar el polling de notificaciones por WebSockets (Pusher, Socket.io) para actualizaciones instantáneas |
| **Geolocalizacion en vivo** | Tracking GPS del repartidor en tiempo real con mapa interactivo para el cliente |
| **Fotos de platos** | Integrar el componente `FileUpload` ya existente para subir imágenes al menú |
| **Dashboard analitico para admin** | Gráficos de ventas, pedidos por período, platos más vendidos, ingresos |
| **Filtros avanzados en explorar** | Búsqueda por precio, rating mínimo, tiempo de entrega, distancia |
| **Internacionalizacion (i18n)** | Soporte multi-idioma (inglés/español) |
| **Tests automatizados** | Tests unitarios con Vitest + tests E2E con Playwright |
| **PWA (Progressive Web App)** | Instalación en dispositivos móviles (el `manifest.json` ya existe) |
| **Modo oscuro** | Tema oscuro aprovechando las variables de Tailwind v4 |

---

## 🚀 Inicio rapido

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd fastdelivery-web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL de Neon, AUTH_SECRET y SMTP_USER/PASS

# 4. Aplicar migraciones a la base de datos
npx drizzle-kit push

# 5. (Opcional) Poblar con datos de ejemplo
npx tsx scripts/seed.ts

# 6. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 📝 Licencia

Proyecto desarrollado con fines académicos y de presentación. **FastDelivery** &copy; 2026.
