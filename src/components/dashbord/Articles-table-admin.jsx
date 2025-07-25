"use client"

import SearchLoader from "./Search-loader";
import useArticles from "@/hooks/useArticles";
import ArticlesHeader from "./ArticlesHeader";
import ArticlesFooter from "./ArticlesFooter";
import ArticlesTableMobile from "./ArticlesTableMobile";
import ArticlesTableDesktop from "./Articles-table-desktop";

const ArticlesTableAdmin = ({initialArt, initialTotalPages, currentPage, search}) => {

    const {
      articles,
      deleting,
      handleDelete,
      handleSearchChange,
      isLoading,
      limit,
      modalProdToDelete,
      page,
      searchTerm,
      setLimit,
      setPage,
      selected,
      toggleCategory,
      totalPages,
      setModalProdToDelete
    } = useArticles(initialArt, initialTotalPages, currentPage, search, 10)

    const tabSize = [5, 10, 25, 50, 100]

    return (
      <>
        {/* Barre de recherche, bouton exporter et bouton ajouter */}
        <ArticlesHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          limit={limit}
          setLimit={setLimit}
          setPage={setPage}
          selected={selected}
          toggleCategory={toggleCategory}
          tabSize={tabSize}
        />

        {/* Loader */}
        {isLoading && ( <SearchLoader/> )}

        <div className={`mt-4 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              {/* Mobile */}
              <ArticlesTableMobile
                articles={articles}
                deleting={deleting}
                handleDelete={handleDelete}
                modalProdToDelete={modalProdToDelete}
                setModalProdToDelete={setModalProdToDelete}
              />

              {/* Desktop */}
              <ArticlesTableDesktop
                articles={articles}
                deleting={deleting}
                handleDelete={handleDelete}
                modalProdToDelete={modalProdToDelete}
                setModalProdToDelete={setModalProdToDelete}
              />
            </div>
          </div>
        </div>

        {/*SizeChange, CatChange et Pagination */}
        <ArticlesFooter
          limit={limit}
          setLimit={setLimit}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          selected={selected}
          toggleCategory={toggleCategory}
          tabSize={tabSize}
        />
      </>
    );
}

export default ArticlesTableAdmin;
