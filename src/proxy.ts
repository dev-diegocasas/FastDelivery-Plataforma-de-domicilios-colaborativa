import { auth } from "@/lib/auth/auth";
import { ROLE_DEFAULT_PATH } from "@/config/routes";
import type { UserRole } from "@/config/constants";

const PUBLIC_PATHS = ["/login", "/registro", "/recuperar-contrasena", "/verificar-correo"];

export default auth((req) => {
  const { auth: session, nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!session?.user;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (isPublic) {
    if (isLoggedIn && session.user.role) {
      return Response.redirect(
        new URL(ROLE_DEFAULT_PATH[session.user.role as UserRole] ?? "/", nextUrl),
      );
    }
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  const role = session.user.role;
  if (path.startsWith("/admin") && role !== "admin")
    return Response.redirect(new URL("/", nextUrl));
  if (path.startsWith("/repartidor") && role !== "repartidor")
    return Response.redirect(new URL("/", nextUrl));
  if (path.startsWith("/cliente") && role !== "cliente")
    return Response.redirect(new URL("/", nextUrl));
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
  ],
};
