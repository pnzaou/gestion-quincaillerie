import UserTable from "@/components/dashbord/User-table";
import authOptions from "@/lib/auth";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import { Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const Page = async ({ searchParams }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }
  const { cookie, host, protocol } = await preparingServerSideRequest();

  const { page, search } = await searchParams;
  const page1 = page || 1;
  const search1 = search || "";

  const rep = await fetch(
    `${protocol}://${host}/api/user?page=${page1}&limit=5&search=${search1}`,
    {
      headers: { Cookie: cookie },
    }
  );
  const { data, totalPages, currentPage } = await rep.json();

  return (
    <div className="flow-root md:flex md:flex-col md:items-center md:justify-center md:h-screen">
      <div className="mb-6 flex items-center gap-2">
        <div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1166D4]/10 mb-4">
            <Users className="w-8 h-8 text-[#1166D4]" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Utilisateurs
          </h1>
          <p className="mt-2 text-sm text-gray-500">Gestion des utilisateurs</p>
        </div>
      </div>

      <UserTable
        initialUsers={data}
        initialTotalPages={totalPages}
        currentPage={currentPage}
        search={search1}
      />
    </div>
  );
};

export default Page;
