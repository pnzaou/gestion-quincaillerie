import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import ReportDetailsClient from "@/components/dashbord/Report-details-client";

const Page = async ({ params }) => {
  const { shopId, id } = await params;
  const { cookie, host, protocol } = await preparingServerSideRequest();

  const rep = await fetch(`${protocol}://${host}/api/report/${id}`, {
    headers: { Cookie: cookie },
  });

  if (!rep.ok) {
    return (
      <div className="flow-root px-4 sm:px-6 lg:px-8">
        <div className="rounded-md bg-white p-8 shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Rapport introuvable
          </h3>
          <p className="text-gray-500 mb-4">
            Ce rapport n'existe pas ou a été supprimé.
          </p>
          <a
            href={`/shop/${shopId}/dashboard/rapports`}
            className="text-blue-600 hover:text-blue-700"
          >
            Retour aux rapports
          </a>
        </div>
      </div>
    );
  }

  const { data: report } = await rep.json();

  return (
    <div className="flow-root px-4 sm:px-6 lg:px-8">
      <ReportDetailsClient report={report} shopId={shopId} />
    </div>
  );
};

export default Page;