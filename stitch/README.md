# Stitch Export

Este directorio contiene las páginas HTML exportadas de Stitch como referencia visual.

Las pantallas fueron diseñadas siguiendo el Material Design 3 system con la paleta
de colores corporativa de FastDelivery (primario coral #FF5F40, superficie clara).

## Mapeo de páginas

| Archivo HTML | Ruta Next.js | Rol |
|---|---|---|
| `login.html` | `/(public)/login` | Público |
| `registro.html` | `/(public)/registro` | Público |
| `recuperarContraseña.html` | `/(public)/recuperar-contrasena` | Público |
| `explorar.html` | `/(dashboard)/cliente/explorar` | Cliente |
| `menuRestaurante.html` | `/(dashboard)/cliente/restaurante/[id]` | Cliente |
| `confirmarPedido.html` | `/(dashboard)/cliente/confirmar` | Cliente |
| `pago.html` | `/(dashboard)/cliente/pago` | Cliente |
| `seguimientoPedido.html` | `/(dashboard)/cliente/tracking/[orderId]` | Cliente |
| `misPedidos.html` | `/(dashboard)/cliente/pedidos` | Cliente |
| `panelAdmin.html` | `/(dashboard)/admin/panel` | Admin |
| `gestionMenu.html` | `/(dashboard)/admin/menu` | Admin |
| `panelRepartidor.html` | `/(dashboard)/repartidor/panel` | Repartidor |
| `centroNotificaciones.html` | `/(dashboard)/notificaciones` | Compartido |
| `configuracion.html` | `/(dashboard)/perfil` | Compartido |

## Reglas de integración

1. Las páginas HTML son solo referencia visual. No se modifican.
2. Los componentes React se construyen en `src/components/` extrayendo
   el markup, estilos y estructura de estas páginas.
3. La lógica de negocio (server actions, validaciones, queries) vive en
   `src/features/` y `src/lib/`, nunca en los componentes presentacionales.
