// js/dashboard.js

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "{}");
    const tableau = document.getElementById("tableau-notes");
    const form = document.getElementById("noteForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const parcours = utilisateur.parcours;

    if (!token || !utilisateur.id) {
        alert("Veuillez vous reconnecter.");
        return window.location.href = "index.html";
    }

    // Fonction qui charge et rend toutes les notes + rangs
    async function chargerNotes() {
        tableau.innerHTML = "";

        try {
            // 1) On récupère les notes
            let notes = await apiFetch("notes", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!Array.isArray(notes) || notes.length === 0) {
                // si vide, on initialise
                await apiFetch("notes/init", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
                notes = await apiFetch("notes", {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // 2) On récupère les rangs
            const { noteRanks, generalRank, totalStudents } = await apiFetch("notes/ranks", {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3) On regroupe par UE
            const regroupees = {};
            let totalCoef = 0,
                totalPond = 0,
                toutesUeValidees = true;

            notes.forEach(n => {
                const ue = n.code.split(".")[0];
                if (!regroupees[ue]) {
                    regroupees[ue] = { ec: [], sum: 0, coefSum: 0 };
                }
                regroupees[ue].ec.push(n);
                regroupees[ue].sum += n.note * n.coefficient;
                regroupees[ue].coefSum += n.coefficient;
            });

            // 4) On rend le tableau
            Object.entries(regroupees).forEach(([ueCode, ue]) => {
                const moyUe = ue.sum / ue.coefSum;
                totalCoef += ue.coefSum;
                totalPond += ue.sum;
                if (moyUe < 6) toutesUeValidees = false;

                // Ligne UE
                const trUe = document.createElement("tr");
                const couleur = moyUe < 6 ? "red" : moyUe < 10 ? "yellow" : "green";
                trUe.className = `ue ${couleur}`;
                trUe.innerHTML = `
          <td>${ueCode}</td>
          <td colspan="2">UE ${ueCode}</td>
          <td>Moy.</td>
          <td>—</td>
          <td>${ue.coefSum.toFixed(2)}</td>
        `;
                tableau.appendChild(trUe);

                // Lignes EC
                ue.ec.forEach(ec => {
                    const rang = noteRanks[ec._id] || "—";
                    const trEc = document.createElement("tr");
                    trEc.innerHTML = `
            <td>${ec.code}</td>
            <td colspan="2">${ec.nom}</td>
            <td>
              <input
                type="number" min="0" max="20" step="0.01"
                data-id="${ec._id}"
                value="${ec.note.toFixed(2)}"
                class="input-sm w-full"
              />
            </td>
            <td>${rang} / ${totalStudents}</td>
            <td>${ec.coefficient}</td>
          `;
                    tableau.appendChild(trEc);
                });
            });

            // 5) Ligne Moyenne générale + rang
            if (totalCoef > 0) {
                const moyGen = totalPond / totalCoef;
                const status = moyGen >= 10 && toutesUeValidees ? "✅ Année validée" : "❌ Année non validée";
                const trFoot = document.createElement("tr");
                trFoot.className = "footer";
                trFoot.innerHTML = `
          <td colspan="4">Moyenne générale : ${moyGen.toFixed(2)} – ${status}</td>
          <td>${generalRank} / ${totalStudents}</td>
          <td>—</td>
        `;
                tableau.appendChild(trFoot);
            }

            // 6) Mise à jour inline
            document.querySelectorAll("input[data-id]").forEach(input => {
                input.addEventListener("change", async () => {
                    const val = parseFloat(input.value);
                    if (isNaN(val) || val < 0 || val > 20) {
                        alert("La note doit être entre 0 et 20.");
                        return input.value = "";
                    }
                    await apiFetch(`notes/${input.dataset.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ note: Math.round(val * 100) / 100 })
                    });
                    // On recharge tout après mise à jour
                    await chargerNotes();
                });
            });

        } catch (err) {
            console.error(err);
            alert("Erreur serveur.");
        }
    }

    // Premier chargement
    await chargerNotes();

    // Formulaire manuel (parcours "Autre")
    if (form) {
        form.style.display = parcours === "Autre" ? "grid" : "none";
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const code = form.code.value.trim();
            const nom = form.nom.value.trim();
            const note = parseFloat(form.note.value);
            const coef = parseFloat(form.coefficient.value);
            if (!code || !nom || isNaN(note) || isNaN(coef) || note < 0 || note > 20 || coef <= 0) {
                return alert("Formulaire invalide.");
            }
            await apiFetch("notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ code, nom, note, coefficient: coef })
            });
            form.reset();
            await chargerNotes();
        });
    }

    // Déconnexion
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

});
