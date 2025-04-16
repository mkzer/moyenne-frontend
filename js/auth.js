// js/auth.js
document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("input[type='email']").value;
    const motDePasse = document.querySelector("input[type='password']").value;
    const data = { email, motDePasse };

    try {
        const result = await apiFetch("utilisateurs/connexion", {
            method: "POST",
            body: JSON.stringify(data)
        });

        alert("Connexion réussie !");
        localStorage.setItem("token", result.token);
        localStorage.setItem("utilisateurId", result.utilisateur._id);
        window.location.href = "dashboard.html";

    } catch (err) {
        alert(err.message || "Erreur de connexion.");
    }
});
