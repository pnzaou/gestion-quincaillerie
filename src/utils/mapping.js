export const catAliasMapping = {
    "nom": [
      // Français correct
      "nom",
      "Nom",
      "nom catégorie",
      "Nom catégorie",
      "nom de la catégorie",
      "Nom de la catégorie",
      "libelle",
      "libellé",
      "Libelle",
      "Libellé",
      "libellé catégorie",
      "libelle catégorie",
      "libellé de la catégorie",
      "libelle de la catégorie",
      "Intitulé",
      "intitulé",
      "Intitulé de la catégorie",
      "intitulé de la catégorie",
      "titre",
      "Titre",
      "titre catégorie",
      "Titre catégorie",
      "titre de la catégorie",
      "Titre de la catégorie",
  
      // Variantes anglaises courantes
      "name",
      "Name",
      "category name",
      "category_name",
      "categoryName",
      "cat_name",
      "catName",
      "label",
      "Label",
      "label_name",
  
      // Fautes de frappe/variantes
      "noms",
      "non",
      "nomm",
      "nomcat",
      "nomCategorie",
      "nom_categorie",
      "intitule", // sans accent
      "libele",
      "libele categorie",
      "libellé cat",
      "nomcatégorie",
      "nomCategorie",
      "nom_categorie"
    ],
  
    "description": [
      // Français correct
      "description",
      "Description",
      "description de la catégorie",
      "Description de la catégorie",
      "Détail",
      "détail",
      "Détails",
      "details",
      "commentaire",
      "Commentaire",
      "Remarque",
      "remarque",
      "notes",
      "Notes",
      "Information",
      "information",
      "Informations",
      "informations",
  
      // Anglais
      "description_text",
      "desc",
      "Desc",
      "category_description",
      "categoryDescription",
      "cat_desc",
      "catDescription",
      "details",
      "Details",
      "info",
      "infos",
      "comments",
      "comment",
      "note",
  
      // Fautes/variantes
      "descriptif",
      "descriptions",
      "descri",
      "descrip",
      "desription",
      "decription",
      "desrip",
      "desc_cat",
      "remarques",
      "commentaires"
    ]
}

export const productAliasMapping = {
  nom: [
    "nom", "Nom", "nom produit", "Nom produit", "Nom de l’article", "nom article",
    "designation", "Designation", "désignation", "Désignation", "designation_produit",
    "product name", "item name", "libelle", "libellé", "label", "intitulé", "name",
    "nomProduit", "nom_produit", "nom-produit", "productname", "titre", "intitule"
  ],

  prixAchatEnGros: [
    "prix achat en gros", "prix d’achat en gros", "prix fournisseur", "prix grossiste",
    "prix fournisseur gros", "prixAchatEnGros", "prix_achat_en_gros", "prix-achat-en-gros",
    "gros achat", "achat_gros", "gross purchase price", "wholesale price",
    "prixAchatGros", "prix_fournisseur", "cost_price_bulk", "achat_grossiste"
  ],

  prixVenteEnGros: [
    "prix vente en gros", "prix revendeur", "prix revendeur gros", "prixVenteEnGros",
    "prix_vente_en_gros", "prix-vente-en-gros", "vente_gros", "gros vente",
    "wholesale selling price", "wholesale price", "prixVenteGros", "selling_price_bulk",
    "prix_revendeur", "vente_grossiste"
  ],

  prixAchatDetail: [
    "prix achat détail", "prix achat au détail", "prix fournisseur détail", "prixAchatDetail",
    "prix_achat_detail", "prix-achat-detail", "retail purchase price", "cost retail",
    "retail cost", "prix detail achat", "achat_detail", "achat_detaille", "prix_fournisseur_detail",
    "prix_detail_fournisseur"
  ],

  prixVenteDetail: [
    "prix vente détail", "prix de vente au détail", "prix client", "prix public",
    "prixVenteDetail", "prix_vente_detail", "prix-vente-detail", "retail price",
    "selling price", "unit price", "prix détail vente", "vente_detail", "prix_unitaire",
    "prix_detail", "prix_consommateur", "prix_detaille"
  ],

  QteInitial: [
    "quantité initiale", "stock initial", "stock départ", "qteinitial", "QteInitial",
    "qte_initiale", "qte_initial", "qte-initiale", "initial quantity", "start stock",
    "initial_stock", "stock_init", "qte_depart", "stock_debut", "stockinitial"
  ],

  QteStock: [
    "quantité en stock", "stock actuel", "QteStock", "qte_stock", "stock_actuel",
    "quantite_stock", "stock dispo", "disponibilité", "stock disponible", "stockdispo",
    "current stock", "available stock", "qtestock", "stock_restant", "stock_now"
  ],

  QteAlerte: [
    "seuil alerte", "stock minimum", "quantité alerte", "QteAlerte", "qte_alerte",
    "alert quantity", "stock alert", "low stock", "seuil", "minimum quantity",
    "seuil_min", "stock_seuil", "alerte_stock", "stock limite", "threshold"
  ],

  reference: [
    "reference", "référence", "ref", "réf", "ref produit", "code produit", "SKU",
    "product ref", "product_reference", "référence produit", "code article", "code",
    "item code", "referenceProduit", "reference_produit", "productcode", "ref_code"
  ],

  description: [
    "description", "details", "desc", "infos", "commentaire", "commentaires",
    "description produit", "description_produit", "product description",
    "product_details", "note", "remarques", "info", "about", "descriptif",
    "productdesc", "detail", "infos_produit", "specifications"
  ],

  dateExpiration: [
    "dateExpiration", "date_expiration", "date d’expiration", "date péremption",
    "périmé le", "date limite", "expiry date", "expiration", "expire_le", "expiration_date",
    "valid until", "date_peremption", "expirationDate", "date_limite", "peremption",
    "date péremptoire", "validité", "expiry", "exp_date"
  ]
};


export function mapRowData(row, aliasMapping) {
    const mapped = {};
    for (const [key, value] of Object.entries(row)) {
      const field = Object.entries(aliasMapping).find(([_, aliases]) =>
        aliases.map(a => a.toLowerCase()).includes(key.toLowerCase().trim())
      )?.[0];
  
      if (field) mapped[field] = value;
    }
    return mapped;
  }
  