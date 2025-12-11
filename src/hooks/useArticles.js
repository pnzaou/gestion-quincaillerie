import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

const useArticles = (initialArt, initialTotalPages, currentPage, search, initialLimit = 10) => {
  const [articles, setArticles] = useState(initialArt);
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState({ id: null, loading: false });
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [searchTerm, setSearchTerm] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [limit, setLimit] = useState(initialLimit);
  const [selected, setSelected] = useState([]);
  const [modalProdToDelete, setModalProdToDelete] = useState(null);
  
  const router = useRouter();
  const params = useParams();
  const shopId = params?.shopId;
  const isFirstRun = useRef(false);

  // Debounce pour la recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch des articles
  useEffect(() => {
    if (!isFirstRun.current) {
      isFirstRun.current = true;
      return;
    }

    if (debouncedSearch.length > 0 && debouncedSearch.length < 3) return;

    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const categoriesParam = selected.length > 0 ? `&categories=${selected.join(",")}` : "";
        const response = await fetch(
          `/api/product?page=${page}&limit=${limit}&search=${debouncedSearch}&businessId=${shopId}${categoriesParam}`
        );
        const data = await response.json();

        if (response.ok) {
          setArticles(data.data);
          setTotalPages(data.totalPages);
          setPage(data.currentPage);
        } else {
          toast.error(data.message || "Erreur lors du chargement des articles");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles:", error);
        toast.error("Une erreur s'est produite! Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [debouncedSearch, page, limit, selected, shopId]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (page !== 1) {
      setPage(1);
    }
  };

  const toggleCategory = (categoryId) => {
    setSelected((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleDelete = async (id) => {
    setDeleting({ id, loading: true });
    try {
      const response = await fetch(`/api/product/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setArticles((prev) => prev.filter((article) => article._id !== id));
        setModalProdToDelete(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur s'est produite ! Veuillez réessayer.");
    } finally {
      setDeleting({ id: null, loading: false });
    }
  };

  return {
    articles,
    isLoading,
    deleting,
    page,
    totalPages,
    searchTerm,
    limit,
    selected,
    modalProdToDelete,
    setPage,
    setLimit,
    setModalProdToDelete,
    handleSearchChange,
    toggleCategory,
    handleDelete,
  };
};

export default useArticles;