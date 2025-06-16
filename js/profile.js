// js/profile.js

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Veuillez vous reconnecter.");
    return window.location.href = "index.html";
  }

  // ① Récupération des infos utilisateur
  let utilisateur;
  try {
    utilisateur = await apiFetch("utilisateurs/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    console.error("GET /utilisateurs/me error:", err);
    alert(err.message || "Impossible de charger le profil.");
    return;
  }

  // Affiche les infos dans la page
  document.getElementById("info-nom").textContent = utilisateur.nom;
  document.getElementById("info-prenom").textContent = utilisateur.prenom;
  document.getElementById("info-email").textContent = utilisateur.email;
  document.getElementById("info-parcours").textContent = utilisateur.parcours;

  // ② Récupération des notes pour calcul de moyenne ET pour export
  let notes = [];
  try {
    notes = await apiFetch("notes", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const totalCoef = notes.reduce((sum, n) => sum + n.coefficient, 0);
    const totalPond = notes.reduce((sum, n) => sum + n.note * n.coefficient, 0);
    const moyenne = totalCoef > 0 ? (totalPond / totalCoef).toFixed(2) : "N/A";
    document.getElementById("info-moyenne").textContent = moyenne;
  } catch (err) {
    console.error("GET /notes error:", err);
    document.getElementById("info-moyenne").textContent = "Erreur";
  }

  // ③ Déconnexion
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // ④ Suppression de compte
  document.getElementById("deleteAccount").addEventListener("click", async () => {
    const confirmation = prompt(`Pour confirmer, tapez votre nom : "${utilisateur.nom}"`);
    if (confirmation !== utilisateur.nom) {
      alert("Nom incorrect, suppression annulée.");
      return;
    }
    try {
      await apiFetch("utilisateurs/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Compte supprimé.");
      localStorage.clear();
      window.location.href = "index.html";
    } catch (err) {
      console.error("DELETE /utilisateurs/me error:", err);
      alert(err.message || "Erreur lors de la suppression.");
    }
  });

  // ⑤ Réinitialiser mot de passe
  document.getElementById("resetPasswordBtn").addEventListener("click", async () => {
    try {
      await apiFetch("utilisateurs/reset-password-request", {
        method: "POST",
        body: JSON.stringify({ email: utilisateur.email })
      });
      alert("Lien de réinitialisation envoyé !");
    } catch (err) {
      console.error("POST /reset-password-request error:", err);
      alert(err.message || "Impossible d’envoyer l’email.");
    }
  });

  // ⑥ Export JSON
  document.getElementById("exportJSONBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const data = { utilisateur, notes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mes_donnees_moyennes.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // ⑦ Export CSV
  document.getElementById("exportCSVBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const lines = [
      "Nom;Prénom;Email;Parcours;Moyenne générale",
      `${utilisateur.nom};${utilisateur.prenom};${utilisateur.email};${utilisateur.parcours};${document.getElementById("info-moyenne").textContent}`,
      "",
      "Code;Épreuve;Note;Coefficient",
      ...notes.map(n => `${n.code};${n.nom};${n.note.toFixed(2)};${n.coefficient}`)
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mes_donnees_moyennes.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
});
