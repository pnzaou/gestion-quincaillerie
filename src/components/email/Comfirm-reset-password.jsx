
export default function ComfirmResetPassword({ userFullName, resetLink }) {
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
              Réinitialisation du mot de passe
            </h2>
            <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.6 }}>
              Cher(e) {userFullName},
            </p>
            <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.6 }}>
              Nous avons bien reçu votre demande de réinitialisation de mot de passe.
              Pour procéder, veuillez cliquer sur le bouton ci-dessous :
            </p>
            <a
              href={resetLink}
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
              Modifier mon mot de passe
            </a>
            <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, marginTop: "30px" }}>
              Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.
            </p>
            <p style={{ fontSize: "16px", color: "#555", marginTop: "30px" }}>Merci,</p>
            <p style={{ fontSize: "16px", color: "#ff6600", fontWeight: "bold" }}>
                Support Quincallerie
            </p>
          </div>
        </div>
      );
    
}
