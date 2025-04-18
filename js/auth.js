// js/auth.js

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("input[name='email']").value;
    const motDePasse = document.querySelector("input[name='motDePasse']").value;

    try {
        const result = await apiFetch("utilisateurs/connexion", {
            method: "POST",
            body: JSON.stringify({ email, motDePasse })
        });

        // Enregistrement dans le stockage local
        localStorage.setItem("token", result.token);
        localStorage.setItem("utilisateur", JSON.stringify(result.utilisateur));

        alert("Connexion réussie !");
        window.location.href = "dashboard.html";
    } catch (err) {
        alert(err.message || "Erreur réseau.");
    }
});
