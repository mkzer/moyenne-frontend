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

        window.location.href = "dashboard.html";
    } catch (err) {
        alert(err.message || "Erreur réseau.");
    }
});

// 👁️ Gestion bouton "œil"
const passwordInput = document.querySelector("input[name='motDePasse']");
const toggleBtn = document.getElementById("togglePassword");

if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("mousedown", () => {
        passwordInput.type = "text";
    });

    toggleBtn.addEventListener("mouseup", () => {
        passwordInput.type = "password";
    });

    toggleBtn.addEventListener("mouseleave", () => {
        passwordInput.type = "password";
    });
}
