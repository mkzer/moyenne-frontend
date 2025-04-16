// js/dashboard.js

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
    const tableau = document.getElementById("tableau-notes");
    const form = document.getElementById("noteForm");
    const logoutBtn = document.getElementById("logoutBtn");

    // Redirection si non connecté
    if (!token || !utilisateur) {
        alert("Veuillez vous reconnecter.");
        window.location.href = "index.html";
        return;
    }

    // Affichage du nom dans le bandeau
    const nomAffichage = document.getElementById("nom-utilisateur");
    if (nomAffichage) {
        nomAffichage.textContent = `${utilisateur.prenom} ${utilisateur.nom}`;
    }

    // Fonction pour afficher les notes
    async function chargerNotes() {
        tableau.innerHTML = ""; // Reset tableau
        try {
            const notes = await apiFetch("notes", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!Array.isArray(notes) || notes.length === 0) {
                tableau.innerHTML = `<tr><td colspan="5" class="text-center text-gray-400">Aucune note enregistrée.</td></tr>`;
                return;
            }

            const regroupées = {};
            notes.forEach(note => {
                const codeBase = note.code.split(".")[0];
                if (!regroupées[codeBase]) regroupées[codeBase] = { ec: [], total: 0, coefTotal: 0 };
                regroupées[codeBase].ec.push(note);
                regroupées[codeBase].total += note.note * note.coefficient;
                regroupées[codeBase].coefTotal += note.coefficient;
            });

            Object.entries(regroupées).forEach(([code, matiere]) => {
                const moyenne = matiere.total / matiere.coefTotal;
                const couleur =
                    moyenne < 6 ? "bg-red-200" :
                        moyenne < 10 ? "bg-yellow-200" :
                            "bg-green-200";

                const ligneUE = document.createElement("tr");
                ligneUE.className = `${couleur} font-bold`;
                ligneUE.innerHTML = `
                    <td>${code}</td>
                    <td colspan="2">${matiere.ec[0].nom.split(" ")[0]}</td>
                    <td>Moyenne</td>
                    <td>${moyenne.toFixed(2)}</td>
                `;
                tableau.appendChild(ligneUE);

                matiere.ec.forEach(ec => {
                    const ligneEC = document.createElement("tr");
                    ligneEC.innerHTML = `
                        <td>${ec.code}</td>
                        <td colspan="2">${ec.nom}</td>
                        <td>${ec.note}</td>
                        <td>coef ${ec.coefficient}</td>
                    `;
                    tableau.appendChild(ligneEC);
                });
            });
        } catch (err) {
            console.error("Erreur de chargement des notes :", err);
            tableau.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Erreur lors du chargement des notes.</td></tr>`;
        }
    }

    // Chargement initial des notes
    await chargerNotes();

    // Soumission du formulaire d'ajout de note
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const code = form.code.value.trim();
            const nom = form.nom.value.trim();
            const note = parseFloat(form.note.value);
            const coefficient = parseFloat(form.coefficient.value);

            if (!code || !nom || isNaN(note) || isNaN(coefficient)) {
                alert("Veuillez remplir tous les champs correctement.");
                return;
            }

            try {
                await apiFetch("notes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ code, nom, note, coefficient })
                });

                alert("Note ajoutée !");
                form.reset();
                await chargerNotes();
            } catch (err) {
                console.error("Erreur ajout note :", err);
                alert("Erreur lors de l'ajout.");
            }
        });
    }

    // Gestion bouton de déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
});
