import { auth } from "@/lib/auth/auth";
import { ROLE_DEFAULT_PATH } from "@/config/routes";
import type { UserRole } from "@/config/constants";

const PUBLIC_PATHS = ["/", "/login", "/registro", "/recuperar-contrasena", "/verificar-correo"];

function getDefaultPath(role: string): string {
  return ROLE_DEFAULT_PATH[role as UserRole] ?? "/login";
}

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((p) => {
    if (p === "/") return path === "/";
    return path.startsWith(p);
  });
}

export default auth((req) => {
  const { auth: session, nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!session?.user;
  const isPublic = isPublicPath(path);

  if (isPublic) {
    if (isLoggedIn && session.user.role) {
      return Response.redirect(
        new URL(getDefaultPath(session.user.role), nextUrl),
      );
    }
    return;
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return Response.redirect(loginUrl);
  }

  const role = session.user.role;
  if (path.startsWith("/admin") && role !== "admin")
    return Response.redirect(new URL(getDefaultPath(role), nextUrl));
  if (path.startsWith("/repartidor") && role !== "repartidor")
    return Response.redirect(new URL(getDefaultPath(role), nextUrl));
  if (path.startsWith("/cliente") && role !== "cliente")
    return Response.redirect(new URL(getDefaultPath(role), nextUrl));
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
  ],
};
