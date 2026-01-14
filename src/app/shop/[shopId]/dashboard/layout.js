import DynamicBreadcrumb from "@/components/dashbord/Dynamic-breadcrumb";
import SideBar from "@/components/dashbord/Sidebar";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Layout({ children, params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const { shopId } = await params;
  
  return (
    <div className="flex min-h-screen">
      <SideBar shopId={shopId} session={session} />
      
      <div className="flex-1 overflow-x-hidden">
        <div className="px-6 pb-6 pt-2 md:px-12 md:pb-12 md:pt-4">
          <DynamicBreadcrumb />
          {children}
        </div>
      </div>
    </div>
  );
}