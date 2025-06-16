// js/profile.js

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Veuillez vous reconnecter.");
    return window.location.href = "index.html";
  }

  // ① Récupérer les infos de l'utilisateur
  let utilisateur;
  try {
    utilisateur = await apiFetch("utilisateurs/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    console.error("Erreur GET /utilisateurs/me :", err);
    alert(err.message || "Impossible de charger le profil.");
    return;
  }

  // Affichage des infos
  document.getElementById("info-nom").textContent = utilisateur.nom;
  document.getElementById("info-prenom").textContent = utilisateur.prenom;
  document.getElementById("info-email").textContent = utilisateur.email;
  document.getElementById("info-parcours").textContent = utilisateur.parcours;

  // ② Calculer et afficher la moyenne générale
  try {
    const notes = await apiFetch("notes", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const totalCoef = notes.reduce((sum, n) => sum + n.coefficient, 0);
    const totalPond = notes.reduce((sum, n) => sum + n.note * n.coefficient, 0);
    const moyenne = totalCoef > 0 ? (totalPond / totalCoef).toFixed(2) : "N/A";
    document.getElementById("info-moyenne").textContent = moyenne;
  } catch (err) {
    console.error("Erreur GET /notes :", err);
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
      console.error("Erreur DELETE /utilisateurs/me :", err);
      alert(err.message || "Erreur lors de la suppression.");
    }
  });
});
