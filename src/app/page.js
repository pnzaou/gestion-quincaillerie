import { LoginForm } from "@/components/login-form"
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions)

  console.log(session?.user)

  if (session) {
    switch (session?.user?.role) {
      case "admin":
        redirect("/shop");
        break;
      case "comptable":
        redirect("/shop");
        break;
      case "gerant":
        redirect(`/shop/${session?.user?.business}/dashboard`);
        break;
      default:
        redirect("/");
        break;
    }
  }

  return (
    (<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>)
  );
}
