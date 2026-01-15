import AjoutUserForm from "@/components/dashbord/forms/Ajout-user-form";

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Utilisateurs
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Ajout d&apos;un utilisateur
          </p>
        </div>
        <AjoutUserForm />
      </div>
    </div>
  );
};

export default Page;