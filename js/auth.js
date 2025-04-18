document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("input[name='email']").value;
    const motDePasse = document.querySelector("input[name='motDePasse']").value;

    try {
        const result = await apiFetch("utilisateurs/connexion", {
            method: "POST",
            body: JSON.stringify({ email, motDePasse })
        });

        alert("Connexion réussie !");
        localStorage.setItem("token", result.token);
        localStorage.setItem("utilisateurId", result.utilisateur.id);
        localStorage.setItem("utilisateur", JSON.stringify(result.utilisateur));

        // Initialisation des notes
        try {
            await apiFetch("notes/init", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${result.token}`
                }
            });
            console.log("✔️ Notes initialisées.");
        } catch (err) {
            console.warn("⚠️ Notes non initialisées :", err.message);
        }

        window.location.href = "dashboard.html";
    } catch (err) {
        alert(err.message || "Erreur réseau.");
    }
});
