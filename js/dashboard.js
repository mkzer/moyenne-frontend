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

            if (!Array.isArray(notes) || notes.length === 0) {
                const init = await apiFetch("notes/init", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });

                notes = await apiFetch("notes", {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
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
                        <input type="number" min="0" max="20" step="0.01"
                            data-id="${ec._id}"
                            data-code="${ec.code}"
                            data-nom="${ec.nom}"
                            data-coef="${ec.coefficient}"
                            value="${parseFloat(ec.note).toFixed(2)}"
                            class="input input-bordered input-sm w-full"/>
                    </td>
                    <td>${ec.coefficient}</td>
                `;
                tableau.appendChild(ligneEC);
            });
        });

        if (total > 0) {
            const moyenne = pondérée / total;
            let message = `${moyenne >= 10 && toutesUeValidees ? "✅ Année validée" : "❌ Année non validée"}`;

            if (moyenne >= 10 && toutesUeValidees) {
                if (moyenne >= 16) {
                    message += " – Mention Très bien";
                } else if (moyenne >= 14) {
                    message += " – Mention Bien";
                } else if (moyenne >= 12) {
                    message += " – Mention Assez bien";
                } else {
                    message += " – Mention Passable";
                }
            }

            const encart = document.createElement("tr");
            encart.className = "bg-base-300 font-bold";
            encart.innerHTML = `
                <td colspan="5" class="text-center">
                    Moyenne générale : ${moyenne.toFixed(2)} – ${message}
                </td>`;
            tableau.appendChild(encart);
        }

        // Listeners mise à jour
        document.querySelectorAll("input[data-code]").forEach(input => {
            input.addEventListener("change", async () => {
                const valeur = parseFloat(input.value);
                if (isNaN(valeur) || valeur < 0 || valeur > 20) {
                    alert("La note doit être un nombre entre 0 et 20.");
                    input.value = "";
                    return;
                }

                try {
                    await apiFetch(`notes/${input.dataset.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ note: Math.round(valeur * 100) / 100 })
                    });

                    await chargerNotes();
                } catch (err) {
                    alert("Erreur de mise à jour.");
                }
            });
        });
    }

    await chargerNotes();

    if (form) {
        form.style.display = parcours === "Autre" ? "grid" : "none";

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const code = form.elements["code"].value.trim();
            const nom = form.elements["nom"].value.trim();
            const note = parseFloat(form.elements["note"].value);
            const coefficient = parseFloat(form.elements["coefficient"].value);

            if (!code || !nom || isNaN(note) || note < 0 || note > 20 ||
                isNaN(coefficient) || coefficient <= 0) {
                alert("Veuillez remplir correctement le formulaire.");
                return;
            }

            try {
                await apiFetch("notes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ code, nom, note: Math.round(note * 100) / 100, coefficient })
                });

                form.reset();
                await chargerNotes();
            } catch (err) {
                alert("Erreur d'ajout de la note.");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
});
