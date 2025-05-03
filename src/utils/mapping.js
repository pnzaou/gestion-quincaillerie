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
      "détails",
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
  