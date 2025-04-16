// js/dashboard.js

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
    const tableau = document.getElementById("tableau-notes");

    if (!token || !utilisateur) {
        alert("Veuillez vous reconnecter.");
        window.location.href = "index.html";
        return;
    }

    // Affiche le nom dans l'entête
    const nomAffichage = document.getElementById("nom-utilisateur");
    if (nomAffichage) {
        nomAffichage.textContent = `${utilisateur.prenom} ${utilisateur.nom}`;
    }

    try {
        const notes = await apiFetch("notes", {
            headers: {
                Authorization: `Bearer ${token}`
            }
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
});
