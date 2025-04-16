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

    document.getElementById("nom-utilisateur").textContent = `${utilisateur.prenom} ${utilisateur.nom}`;

    try {
        const notes = await apiFetch("notes", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Regrouper par matière (code sans .x)
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

            // Ligne UE
            const ligneUE = document.createElement("tr");
            ligneUE.className = `${couleur} font-bold`;
            ligneUE.innerHTML = `
                <td>${code}</td>
                <td colspan="2">${matiere.ec[0].nom.split(" ")[0]}</td>
                <td>Moyenne</td>
                <td>${moyenne.toFixed(2)}</td>
            `;
            tableau.appendChild(ligneUE);

            // Sous-EC
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
        console.error(err);
        alert("Impossible de charger les notes.");
    }
});
