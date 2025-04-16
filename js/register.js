// js/register.js
import { apiFetch } from "./utils.js";

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const prenom = document.querySelector("input[name='prenom']").value;
    const nom = document.querySelector("input[name='nom']").value;
    const email = document.querySelector("input[name='email']").value;
    const motDePasse = document.querySelector("input[name='motDePasse']").value;
    const parcours = document.querySelector("select[name='programme']").value;

    const data = { prenom, nom, email, motDePasse, parcours };

    try {
        const result = await apiFetch("utilisateurs/inscription", {
            method: "POST",
            body: JSON.stringify(data)
        });

        alert("Inscription réussie !");
        window.location.href = "index.html";
    } catch (err) {
        alert(err.message || "Erreur réseau.");
    }
});
