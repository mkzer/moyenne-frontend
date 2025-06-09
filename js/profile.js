document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("utilisateurId");

  if (!token || !id) {
    alert("Veuillez vous reconnecter.");
    window.location.href = "index.html";
    return;
  }

  try {
    const utilisateur = await apiFetch(`utilisateurs/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    document.getElementById("info-nom").textContent = utilisateur.nom;
    document.getElementById("info-prenom").textContent = utilisateur.prenom;
    document.getElementById("info-email").textContent = utilisateur.email;
    document.getElementById("info-parcours").textContent = utilisateur.parcours;
  } catch (err) {
    alert(err.message || "Erreur de chargement.");
  }

  const deleteBtn = document.getElementById("deleteAccount");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Confirmer la suppression de votre compte ?")) return;
      try {
        await apiFetch(`utilisateurs/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Compte supprimé.");
        localStorage.clear();
        window.location.href = "index.html";
      } catch (err) {
        alert(err.message || "Erreur de suppression.");
      }
    });
  }
});
