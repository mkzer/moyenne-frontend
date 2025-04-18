document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
    const tableau = document.getElementById("tableau-notes");
    const form = document.getElementById("noteForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const parcours = utilisateur.parcours;

    if (!token || !utilisateur) {
        alert("Veuillez vous reconnecter.");
        window.location.href = "index.html";
        return;
    }

    const nomAffichage = document.getElementById("nom-utilisateur");
    if (nomAffichage) {
        nomAffichage.textContent = `${utilisateur.prenom} ${utilisateur.nom}`;
    }

    async function chargerNotes() {
        tableau.innerHTML = "";
        let notes = [];

        try {
            notes = await apiFetch("notes", {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err);
            alert("Erreur serveur.");
            return;
        }

        if (!Array.isArray(notes) || notes.length === 0) {
            tableau.innerHTML = `<tr><td colspan="5" class="text-center text-gray-400">Aucune note.</td></tr>`;
            return;
        }

        const regroupées = {};
        let total = 0;
        let pondérée = 0;
        let toutesUeValidees = true;

        notes.forEach(note => {
            const ueCode = note.code.split(".")[0];
            if (!regroupées[ueCode]) {
                regroupées[ueCode] = { ec: [], total: 0, coefTotal: 0 };
            }
            regroupées[ueCode].ec.push(note);
            regroupées[ueCode].total += note.note * note.coefficient;
            regroupées[ueCode].coefTotal += note.coefficient;
        });

        Object.entries(regroupées).forEach(([ueCode, ue]) => {
            const moyenneUe = ue.total / ue.coefTotal;
            total += ue.coefTotal;
            pondérée += ue.total;

            const couleur =
                moyenneUe < 6 ? "bg-red-200" :
                    moyenneUe < 10 ? "bg-yellow-200" :
                        "bg-green-200";

            if (moyenneUe < 6) toutesUeValidees = false;

            const ligneUE = document.createElement("tr");
            ligneUE.className = `${couleur} font-bold`;
            ligneUE.innerHTML = `
                <td>${ueCode}</td>
                <td colspan="2">UE ${ueCode}</td>
                <td>Moyenne</td>
                <td>${moyenneUe.toFixed(2)}</td>
            `;
            tableau.appendChild(ligneUE);

            ue.ec.forEach(ec => {
                const ligneEC = document.createElement("tr");
                ligneEC.innerHTML = `
                    <td>${ec.code}</td>
                    <td colspan="2">${ec.nom}</td>
                    <td>
                        <input type="number" min="0" max="20" step="0.1" 
                            data-id="${ec._id}"
                            data-code="${ec.code}"
                            data-nom="${ec.nom}"
                            data-coef="${ec.coefficient}"
                            value="${ec.note}"
                            class="input input-bordered input-sm w-full"/>
                    </td>
                    <td>${ec.coefficient}</td>
                `;
                tableau.appendChild(ligneEC);
            });
        });

        if (total > 0) {
            const moyenne = pondérée / total;
            const encart = document.createElement("tr");
            encart.className = "bg-base-300 font-bold";
            encart.innerHTML = `
                <td colspan="5" class="text-center">
                    Moyenne générale : ${moyenne.toFixed(2)} – 
                    ${moyenne >= 10 && toutesUeValidees ? "✅ Année validée" : "❌ Année non validée"}
                </td>`;
            tableau.appendChild(encart);
        }

        // Listeners mise à jour
        document.querySelectorAll("input[data-code]").forEach(input => {
            input.addEventListener("change", async () => {
                const valeur = parseFloat(input.value);
                if (isNaN(valeur)) return alert("Note invalide");

                const payload = {
                    code: input.dataset.code,
                    nom: input.dataset.nom,
                    coefficient: parseFloat(input.dataset.coef),
                    note: valeur
                };

                try {
                    await apiFetch(`notes/${input.dataset.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ note: valeur })
                    });

                    await chargerNotes();
                } catch (err) {
                    alert("Erreur de mise à jour.");
                }
            });
        });
    }

    await chargerNotes();

    if (form) form.style.display = parcours === "Autre" ? "grid" : "none";

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
});
