// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="rounded-xl bg-gray-100 p-4">
        <div className="sm:grid-cols-13 mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 p-4">
        <div className="bg-white px-6">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-9 w-52 overflow-hidden rounded-md bg-gray-100`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </>
  );
}

// Skeleton pour les lignes de la table des utilisateurs
export function UserRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-300 last-of-type:border-none animate-pulse [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Prénom */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-300"></div>
      </td>
      {/* Nom */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-300"></div>
      </td>
      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-36 rounded bg-gray-300"></div>
      </td>
      {/* Rôle */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-20 rounded bg-gray-300"></div>
      </td>
      {/* Statut */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-20 rounded bg-gray-300"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-2">
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
        </div>
      </td>
    </tr>
  )
}

//Seleton pour les lignes de la table des utilisateurs sur mobile
export function UserMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4 animate-pulse">
      {/* Header : Prénom + Statut */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="h-6 w-24 rounded bg-gray-100" /> {/* Prénom */}
        <div className="h-6 w-16 rounded bg-gray-100" /> {/* Statut */}
      </div>

      {/* Corps : Nom, Email, Rôle */}
      <div className="pt-4 space-y-2">
        <div className="h-6 w-28 rounded bg-gray-100" /> {/* Nom */}
        <div className="h-6 w-40 rounded bg-gray-100" /> {/* Email */}
        <div className="h-6 w-20 rounded bg-gray-100" /> {/* Rôle */}
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <div className="h-10 w-10 rounded bg-gray-100" />
        <div className="h-10 w-10 rounded bg-gray-100" />
      </div>
    </div>
  )
}

// Skeleton pour la table des utilisateurs
export function UserTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div
        className={`${shimmer} relative animate-pulse mb-6 h-8 w-36 overflow-hidden rounded-md bg-gray-300`}
      />
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile Version */}
          <div className="md:hidden space-y-2">
            <UserMobileSkeleton />
            <UserMobileSkeleton />
            <UserMobileSkeleton />
            <UserMobileSkeleton />
            <UserMobileSkeleton />
            <UserMobileSkeleton />
          </div>

          {/* Desktop Table Version */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Prénom</th>
                <th scope="col" className="px-3 py-5 font-medium">Nom</th>
                <th scope="col" className="px-3 py-5 font-medium">Email</th>
                <th scope="col" className="px-3 py-5 font-medium">Rôle</th>
                <th scope="col" className="px-3 py-5 font-medium">Statut</th>
                <th scope="col" className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Skeleton pour les lignes de la table des catégories
export function CategoryRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-300 last-of-type:border-none animate-pulse [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Nom */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-300"></div>
      </td>
      {/* Description */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-48 rounded bg-gray-300"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-2">
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
        </div>
      </td>
    </tr>
  );
}

// Skeleton pour les lignes de la table des catégories sur mobile
export function CategoryMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4 animate-pulse">
      {/* Header: Nom */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="h-6 w-32 rounded bg-gray-100" /> {/* Nom */}
      </div>

      {/* Corps: Description */}
      <div className="pt-4">
        <div className="h-6 w-48 rounded bg-gray-100" /> {/* Description */}
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <div className="h-10 w-10 rounded bg-gray-100" />
        <div className="h-10 w-10 rounded bg-gray-100" />
        <div className="h-10 w-10 rounded bg-gray-100" />
      </div>
    </div>
  );
}

// Skeleton pour la table des catégories
export function CategoryTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div
        className={`${shimmer} relative animate-pulse mb-6 h-8 w-36 overflow-hidden rounded-md bg-gray-300`}
      />
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile Version */}
          <div className="md:hidden space-y-2">
            <CategoryMobileSkeleton />
            <CategoryMobileSkeleton />
            <CategoryMobileSkeleton />
            <CategoryMobileSkeleton />
            <CategoryMobileSkeleton />
            <CategoryMobileSkeleton />
          </div>

          {/* Desktop Table Version */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Nom</th>
                <th className="px-3 py-5 font-medium">Description</th>
                <th className="py-5 pl-6 pr-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <CategoryRowSkeleton />
              <CategoryRowSkeleton />
              <CategoryRowSkeleton />
              <CategoryRowSkeleton />
              <CategoryRowSkeleton />
              <CategoryRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Skeleton for supplier table row (desktop)
export function SupplierRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-300 last-of-type:border-none animate-pulse [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Name */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-300"></div>
      </td>

      {/* Address */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-48 rounded bg-gray-300"></div>
      </td>

      {/* Phone */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-40 rounded bg-gray-300"></div>
      </td>

      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-48 rounded bg-gray-300"></div>
      </td>

      {/* Actions: Edit & Delete */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-2">
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
        </div>
      </td>
    </tr>
  );
}

// Skeleton for supplier card (mobile)
export function SupplierMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4 animate-pulse">
      {/* Name */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="h-6 w-32 rounded bg-gray-100" />
      </div>

      {/* Address */}
      <div className="pt-4">
        <div className="h-6 w-48 rounded bg-gray-100" />
      </div>

      {/* Phone */}
      <div className="pt-2">
        <div className="h-6 w-40 rounded bg-gray-100" />
      </div>

      {/* Email */}
      <div className="pt-2">
        <div className="h-6 w-48 rounded bg-gray-100" />
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <div className="h-10 w-10 rounded bg-gray-100" />
        <div className="h-10 w-10 rounded bg-gray-100" />
      </div>
    </div>
  );
}

// Skeleton for the supplier table (desktop + mobile)
export function SupplierTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      {/* Header shimmer */}
      <div
        className={`${shimmer} relative animate-pulse mb-6 h-8 w-36 overflow-hidden rounded-md bg-gray-300`}
      />
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile Version */}
          <div className="md:hidden space-y-2">
            <SupplierMobileSkeleton />
            <SupplierMobileSkeleton />
            <SupplierMobileSkeleton />
            <SupplierMobileSkeleton />
            <SupplierMobileSkeleton />
            <SupplierMobileSkeleton />
          </div>

          {/* Desktop Table Version */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Nom</th>
                <th className="px-3 py-5 font-medium">Adresse</th>
                <th className="px-3 py-5 font-medium">Numéro</th>
                <th className="px-3 py-5 font-medium">Email</th>
                <th className="py-5 pl-6 pr-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <SupplierRowSkeleton />
              <SupplierRowSkeleton />
              <SupplierRowSkeleton />
              <SupplierRowSkeleton />
              <SupplierRowSkeleton />
              <SupplierRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



// Skeleton pour les lignes de la table des articles
export function ArticleRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-300 last-of-type:border-none animate-pulse [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Image */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-10 w-10 rounded bg-gray-300"></div>
      </td>
      {/* Nom */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-300"></div>
      </td>
      {/* Prix de vente */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-20 rounded bg-gray-300"></div>
      </td>
      {/* Qte en stock */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-300"></div>
      </td>
      {/* Référence */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-300"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-2">
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
        </div>
      </td>
    </tr>
  );
}

// Skeleton pour les lignes de la table des articles sur mobile
export function ArticleMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4 animate-pulse">
      {/* Header: Image et Nom */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded bg-gray-100" />
          <div className="h-6 w-32 rounded bg-gray-100" />
        </div>
      </div>

      {/* Corps: Prix, Qte, Ref */}
      <div className="pt-4 space-y-2">
        <div className="h-6 w-20 rounded bg-gray-100" /> {/* Prix de vente */}
        <div className="h-6 w-16 rounded bg-gray-100" /> {/* Qte en stock */}
        <div className="h-6 w-24 rounded bg-gray-100" /> {/* Référence */}
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <div className="h-10 w-10 rounded bg-gray-100" />
        <div className="h-10 w-10 rounded bg-gray-100" />
        <div className="h-10 w-10 rounded bg-gray-100" />
      </div>
    </div>
  );
}

// Skeleton pour la table des articles
export function ArticleTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div
        className={`${shimmer} relative animate-pulse mb-6 h-8 w-36 overflow-hidden rounded-md bg-gray-300`}
      />
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile Version */}
          <div className="md:hidden space-y-2">
            <ArticleMobileSkeleton />
            <ArticleMobileSkeleton />
            <ArticleMobileSkeleton />
            <ArticleMobileSkeleton />
            <ArticleMobileSkeleton />
            <ArticleMobileSkeleton />
          </div>

          {/* Desktop Table Version */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6"></th>
                <th className="px-3 py-5 font-medium">Nom</th>
                <th className="px-3 py-5 font-medium">Prix de vente</th>
                <th className="px-3 py-5 font-medium">Qte en stock</th>
                <th className="px-3 py-5 font-medium">Référence</th>
                <th className="py-5 pl-6 pr-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <ArticleRowSkeleton />
              <ArticleRowSkeleton />
              <ArticleRowSkeleton />
              <ArticleRowSkeleton />
              <ArticleRowSkeleton />
              <ArticleRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Skeleton pour les lignes de la table des ventes
export function SaleRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-300 last-of-type:border-none animate-pulse [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Référence */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-300"></div>
      </td>
      {/* Date de vente */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-40 rounded bg-gray-300"></div>
      </td>
      {/* Client */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-300"></div>
      </td>
      {/* Total */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-20 rounded bg-gray-300"></div>
      </td>
      {/* Mode de paiement */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-300"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-2">
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-300"></div>
        </div>
      </td>
    </tr>
  )
}

// Skeleton pour les lignes de la table des ventes sur mobile
export function SaleMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4 animate-pulse">
      {/* Header: Référence and Date */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="space-y-2">
          <div className="h-6 w-24 rounded bg-gray-100"/>
          <div className="h-6 w-24 rounded bg-gray-100"/>
        </div>
      </div>

      {/* Corps: Client, Total, Mode de paiement */}
      <div className="pt-4 space-y-2">
        <div className="h-6 w-28 rounded bg-gray-100" /> {/* Client */}
        <div className="h-6 w-20 rounded bg-gray-100" /> {/* Total */}
        <div className="h-6 w-24 rounded bg-gray-100" /> {/* Mode de paiement */}
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <div className="h-10 w-10 rounded bg-gray-100" />
        <div className="h-10 w-10 rounded bg-gray-100" />
        <div className="h-10 w-10 rounded bg-gray-100" />
      </div>
    </div>
  )
}

// Skeleton pour la table des ventes
export function SaleTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div
        className={`${shimmer} relative animate-pulse mb-6 h-8 w-36 overflow-hidden rounded-md bg-gray-300`}
      />
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile Version */}
          <div className="md:hidden space-y-2">
            <SaleMobileSkeleton />
            <SaleMobileSkeleton />
            <SaleMobileSkeleton />
            <SaleMobileSkeleton />
            <SaleMobileSkeleton />
            <SaleMobileSkeleton />
          </div>

          {/* Desktop Table Version */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="text-left text-sm font-normal">
              <tr>
                <th className="px-3 py-5 font-medium">Référence</th>
                <th className="px-3 py-5 font-medium">Date de vente</th>
                <th className="px-3 py-5 font-medium">Client</th>
                <th className="px-3 py-5 font-medium">Montant (TTC)</th>
                <th className="px-3 py-5 font-medium">Mode de paiement</th>
                <th className="py-5 pl-6 pr-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <SaleRowSkeleton />
              <SaleRowSkeleton />
              <SaleRowSkeleton />
              <SaleRowSkeleton />
              <SaleRowSkeleton />
              <SaleRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

