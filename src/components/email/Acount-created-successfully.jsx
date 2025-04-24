export default function AccountCreatedSuccessfully({ userFullName, defaultPassword, loginLink }) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          color: "#333",
          backgroundColor: "#f7f7f7",
          padding: "20px",
          textAlign: "center",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#ff6600", fontSize: "24px", fontWeight: 600 }}>
            Votre compte a été créé avec succès !
          </h2>
          <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.6 }}>
            Bienvenue {userFullName},
          </p>
          <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.6 }}>
            Votre compte est maintenant actif. Voici votre mot de passe par défaut :
          </p>
          <p
            style={{
              fontSize: "18px",
              color: "#ff6600",
              fontWeight: "bold",
              margin: "10px 0",
            }}
          >
            {defaultPassword}
          </p>
          <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.6 }}>
            Pour des raisons de sécurité, merci de le modifier dès votre première connexion.
          </p>
          <a
            href={loginLink}
            style={{
              display: "inline-block",
              margin: "20px 0",
              padding: "12px 24px",
              backgroundColor: "#ff6600",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Se connecter
          </a>
          <p style={{ fontSize: "16px", color: "#555", marginTop: "30px" }}>Merci,</p>
          <p style={{ fontSize: "16px", color: "#ff6600", fontWeight: "bold" }}>
            Support Quincaillerie
          </p>
        </div>
      </div>
    );
  }
  