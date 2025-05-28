import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

export default function useArticles(initialArt, initialTotalPages, currentPage, search) {
    const [articles, setArticles] = useState(initialArt)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [page, setPage] = useState(currentPage)

    const [searchTerm, setSearchTerm] = useState(search)
    const [debouncedSearch, setDebouncedSearch] = useState(search)
    const [limit, setLimit] = useState(10)
    const [selected, setSelected] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const [deleting, setDeleting] = useState({ id: null, loading: false })
    const [modalProdToDelete, setModalProdToDelete] = useState(null)

    const isFirstRun = useRef(false)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 1000)
        return () => clearTimeout(handler)
    }, [searchTerm])

    useEffect(() => {
        if (!isFirstRun.current) {
            isFirstRun.current = true
            return
        }

        if (debouncedSearch.length > 0 && debouncedSearch.length < 3) return;

        const activeSearch = debouncedSearch

        setIsLoading(true)
        fetch(`/api/product?page=${page}&limit=${limit}&search=${activeSearch}&categories=${selected.join(",")}`)
            .then(res => res.json())
            .then(({ data, totalPages: tp, currentPage: cp }) => {
                setArticles(data);
                setTotalPages(tp);
                setPage(cp);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Une erreur s'est produite! Veuillez réessayer.");
            })
            .finally(() => setIsLoading(false))
    }, [debouncedSearch, page, limit, selected]);

    const handleDelete = async (id) => {
        setDeleting({ id, loading: true })
        try {
            const response = await fetch(`/api/product/${id}`, { method: "DELETE" })
            const data = await response.json();
  
            if(response.ok) {
                toast.success(data.message)
                setArticles(prev => prev.filter(art => art._id !== id))
                setModalProdToDelete(null)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur s'est produite ! Veuillez réessayer.")
        } finally {
            setDeleting({ id: null, loading: false })
        }
    }

    const handleSearchChange = e => {
        setSearchTerm(e.target.value);
        if (page !== 1) {
          setPage(1);
        }
    };

    const toggleCategory = (categoryId) => {
        setSelected(prev =>
          prev.includes(categoryId)
            ? prev.filter(id => id !== categoryId)
            : [...prev, categoryId]
        );
    };

    return {
        articles,
        totalPages,
        page,
        limit,
        searchTerm,
        isLoading,
        deleting,
        modalProdToDelete,
        selected,
        handleSearchChange,
        setLimit,
        setPage,
        toggleCategory,
        handleDelete,
        setModalProdToDelete
    }

}