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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1166D4]/10 flex-shrink-0">
              <Users className="w-8 h-8 text-[#1166D4]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Utilisateurs
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                Gestion des utilisateurs de la plateforme
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <UserTable
          initialUsers={data}
          initialTotalPages={totalPages}
          currentPage={currentPage}
          search={search1}
        />
      </div>
    </div>
  );
};

export default Page;