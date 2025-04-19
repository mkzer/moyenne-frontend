// js/register.js

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const prenom = document.querySelector("input[name='prenom']").value;
    const nom = document.querySelector("input[name='nom']").value;
    const email = document.querySelector("input[name='email']").value;
    const motDePasse = document.querySelector("input[name='motDePasse']").value;
    const parcours = document.querySelector("select[name='parcours']").value;
    const messageEmail = document.getElementById("message-email");

    // Vérifie l'email
    if (email.endsWith("@univ-lorraine.fr")) {
        messageEmail.textContent = "Veuillez utiliser un email personnel, pas un email universitaire.";
        messageEmail.classList.remove("hidden");
        return;
    } else {
        messageEmail.classList.add("hidden");
    }

    const data = { prenom, nom, email, motDePasse, parcours };

    try {
        const result = await apiFetch("utilisateurs/inscription", {
            method: "POST",
            body: JSON.stringify(data)
        });

        alert("Merci pour votre inscription !");
        window.location.href = "index.html";
    } catch (err) {
        alert(err.message || "Erreur réseau.");
    }
});
