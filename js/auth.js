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

        // ✅ Normalisation du parcours
        const parcoursBrut = result.utilisateur.parcours;
        let parcoursNormalise = parcoursBrut;

        if (parcoursBrut === "M1 EEA MTI") parcoursNormalise = "MTI";
        if (parcoursBrut === "M1 EEA ISHM") parcoursNormalise = "ISHM";
        if (parcoursBrut === "M1 EEA IMEEN") parcoursNormalise = "IMEEN";

        result.utilisateur.parcours = parcoursNormalise;

        localStorage.setItem("utilisateur", JSON.stringify(result.utilisateur));

        // Appel de l'initialisation automatique des notes
        await apiFetch("notes/init", {
            method: "POST",
            headers: { Authorization: `Bearer ${result.token}` }
        });

        window.location.href = "dashboard.html";
    } catch (err) {
        alert(err.message || "Erreur réseau.");
    }
});
