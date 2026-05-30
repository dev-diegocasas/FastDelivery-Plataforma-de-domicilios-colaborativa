import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ROLE_DEFAULT_PATH } from "@/config/routes";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(ROLE_DEFAULT_PATH[session.user.role] ?? "/login");
}
