// js/auth.js

// Sélection du formulaire de connexion
const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("input[name='email']").value;
    const motDePasse = document.querySelector("input[name='motDePasse']").value;

    try {
        // Appel à l'API pour la connexion
        const result = await apiFetch("utilisateurs/connexion", {
            method: "POST",
            body: JSON.stringify({ email, motDePasse })
        });

        // On stocke le token et les infos utilisateur
        localStorage.setItem("token", result.token);
        localStorage.setItem("utilisateurId", result.utilisateur.id);
        localStorage.setItem("utilisateur", JSON.stringify(result.utilisateur));

        // Redirection selon le rôle
        if (result.utilisateur.isAdmin) {
            window.location.href = "admin.html";
        } else {
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        alert(err.message || "Erreur réseau.");
    }
});

// 👁️ Bouton œil pour afficher/masquer le mot de passe
const passwordInput = document.querySelector("input[name='motDePasse']");
const toggleBtn = document.getElementById("togglePassword");

if (toggleBtn && passwordInput) {
    const afficher = () => passwordInput.type = "text";
    const cacher = () => passwordInput.type = "password";

    toggleBtn.addEventListener("mousedown", afficher);
    toggleBtn.addEventListener("mouseup", cacher);
    toggleBtn.addEventListener("mouseleave", cacher);

    // Pour mobile
    toggleBtn.addEventListener("touchstart", afficher);
    toggleBtn.addEventListener("touchend", cacher);
}
