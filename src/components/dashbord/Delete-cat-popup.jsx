
const DeleteCatPopup = ({confirmDelete, setShowConfirmModal, setSelectedCatId}) => {
    return (
        <div 
          className="fixed inset-0 flex items-center justify-center z-40"
          style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}}
          onClick={() => {
            setShowConfirmModal(false);
            setSelectedCatId(null);
          }}
        >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center absolute z-50">
                <h2 className="text-lg font-semibold mb-4">Confirmation de suppression</h2>
                <p className="text-gray-700 mb-6">
                    La suppression d'une catégorie entraînera celle de tous ses produits associés.
                    Êtes-vous sûr de vouloir continuer ?
                </p>
                <div className="flex justify-center gap-4">
                    <button
                      onClick={confirmDelete}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                    Confirmer
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmModal(false);
                        setSelectedCatId(null);
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteCatPopup;
