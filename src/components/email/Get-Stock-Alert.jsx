export default function StockAlert({
  userName,
  productName, 
  currentStock, 
  alertThreshold, 
  businessName, 
  isOutOfStock,
  stockUrl 
}) {
  const statusColor = isOutOfStock ? "#dc2626" : "#f59e0b";
  const statusText = isOutOfStock ? "RUPTURE DE STOCK" : "ALERTE STOCK";
  const statusIcon = isOutOfStock ? "🚨" : "⚠️";

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#333",
        backgroundColor: "#f7f7f7",
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: statusColor,
          color: "white",
          padding: "30px 20px",
          borderRadius: "8px 8px 0 0",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0 0 10px 0", fontSize: "28px", fontWeight: "bold" }}>
          {statusIcon} {statusText}
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>
          {businessName}
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.6, marginBottom: "20px" }}>
          Bonjour,{userName}
        </p>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.6, marginBottom: "20px" }}>
          Le produit suivant nécessite votre attention :
        </p>

        {/* Product Info Card */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: `4px solid ${statusColor}`,
            marginBottom: "30px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "15px", color: "#111827", fontSize: "22px" }}>
            {productName}
          </h2>
          
          <div style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#555" }}>Stock actuel : </strong>
            <span style={{ fontSize: "32px", fontWeight: "bold", color: statusColor }}>
              {currentStock}
            </span>
            <span style={{ fontSize: "18px", color: "#555" }}> unités</span>
          </div>

          {!isOutOfStock && (
            <p style={{ margin: "10px 0", color: "#555" }}>
              <strong>Seuil d'alerte :</strong> {alertThreshold} unités
            </p>
          )}

          <p
            style={{
              margin: "15px 0 0 0",
              padding: "10px",
              backgroundColor: isOutOfStock ? "#fee2e2" : "#fef3c7",
              color: statusColor,
              fontWeight: "bold",
              borderRadius: "6px",
              fontSize: "15px",
            }}
          >
            {isOutOfStock 
              ? "⛔ Produit en rupture de stock" 
              : "⚠️ Stock inférieur au seuil d'alerte"
            }
          </p>
        </div>

        {/* Actions recommandées */}
        <div style={{ marginBottom: "30px" }}>
          <p style={{ fontSize: "16px", color: "#333", fontWeight: "bold", marginBottom: "10px" }}>
            Actions recommandées :
          </p>
          <ul style={{ fontSize: "15px", color: "#555", lineHeight: 1.8, paddingLeft: "20px" }}>
            <li>Vérifier les commandes en cours</li>
            <li>Passer une nouvelle commande si nécessaire</li>
            <li>Informer l'équipe de vente</li>
          </ul>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <a
            href={stockUrl}
            style={{
              display: "inline-block",
              padding: "14px 30px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            📦 Voir le stock
          </a>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            Ceci est un message automatique. Ne pas répondre à cet email.
          </p>
        </div>
      </div>
    </div>
  );
}