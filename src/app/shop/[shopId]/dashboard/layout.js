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
    <div className="flex min-h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideBar shopId={shopId} session={session} />
      </div>
      {/* <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div> */}
      <div className="flex-grow px-6 pb-6 pt-2 md:overflow-y-auto md:px-12 md:pb-12 md:pt-4">
        <DynamicBreadcrumb />
        {children}
      </div>
    </div>
  );
}
