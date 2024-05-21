import AuthForm from "@/components/auth-form";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }) {
  const { session } = await verifyAuth();
  console.log(session);
  if (session) {
    redirect("/training");
  }
  const formMode = searchParams.mode || "login";
  return <AuthForm mode={formMode} />;
}
