import AjoutUserForm from "@/components/dashbord/forms/Ajout-user-form";

const Page = () => {
  return (
    <div className="flex flex-col w-full items-center justify-center h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
        <p className="mt-2 text-sm text-gray-500">
          Ajout d&apos;un utilisateur
        </p>
      </div>
      <div>
        <div className="w-full max-w-md lg:max-w-xl">
          <AjoutUserForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
