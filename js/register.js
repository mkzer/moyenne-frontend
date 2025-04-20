document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const prenom = document.querySelector("input[name='prenom']").value;
    const nom = document.querySelector("input[name='nom']").value;
    const email = document.querySelector("input[name='email']").value;
    const motDePasse = document.querySelector("input[name='motDePasse']").value;
    const parcours = document.querySelector("select[name='parcours']").value;
    const messageEmail = document.getElementById("message-email");

    // Vérifie l'email universitaire
    if (email.endsWith("@etu.univ-lorraine.fr") || email.endsWith("@univ-lorraine.fr")) {
        messageEmail.textContent = "Veuillez utiliser un email personnel, pas un email universitaire.";
        messageEmail.classList.remove("hidden");
        return;
    } else {
        messageEmail.classList.add("hidden");
    }

    const data = { prenom, nom, email, motDePasse, parcours };

    try {
        const response = await fetch("https://moyenne-backend.onrender.com/api/utilisateurs/inscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // 🔔 Affiche le message du backend, même si le status est 200
        if (result.message && response.status !== 201) {
            alert(result.message);
            return;
        }

        alert("Merci pour votre inscription !");
        window.location.href = "index.html";
    } catch (err) {
        alert("Erreur réseau.");
    }
});

// 👁️ Fonction œil : affichage mot de passe (desktop + mobile)
const passwordInput = document.getElementById("motDePasse");
const toggleBtn = document.getElementById("togglePassword");

if (toggleBtn && passwordInput) {
    const afficher = () => passwordInput.type = "text";
    const cacher = () => passwordInput.type = "password";

    toggleBtn.addEventListener("mousedown", afficher);
    toggleBtn.addEventListener("mouseup", cacher);
    toggleBtn.addEventListener("mouseleave", cacher);

    // ✅ Support mobile
    toggleBtn.addEventListener("touchstart", afficher);
    toggleBtn.addEventListener("touchend", cacher);
}
