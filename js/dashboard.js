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

    // Affiche le nom dans la nav (si présent)
    const nomAffichage = document.getElementById("nom-utilisateur");
    if (nomAffichage) {
        nomAffichage.textContent = `${utilisateur.prenom} ${utilisateur.nom}`;
    }

    // wrapper pour appels API
    async function apiFetch(endpoint, options = {}) {
        const res = await fetch(`https://moyenne-backend.onrender.com/api/${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers
            },
            ...options
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur serveur");
        return data;
    }

    async function chargerNotes() {
        tableau.innerHTML = "";
        let notes = [];

        // 1️⃣ Charge les notes
        try {
            notes = await apiFetch("notes");
            if (!Array.isArray(notes) || notes.length === 0) {
                await apiFetch("notes/init", { method: "POST" });
                notes = await apiFetch("notes");
            }
        } catch (err) {
            console.error(err);
            return alert("Erreur serveur lors du chargement des notes.");
        }

        if (!Array.isArray(notes) || notes.length === 0) {
            tableau.innerHTML = `<tr><td colspan="6" class="text-center text-gray-400">Aucune note.</td></tr>`;
            return;
        }

        // 2️⃣ Charge les rangs
        let ranks = { noteRanks: {}, generalRank: null, totalStudents: 0 };
        try {
            ranks = await apiFetch("notes/ranks");
        } catch (err) {
            console.warn("Impossible de charger les rangs :", err);
        }

        // 3️⃣ Regroupe par UE et calcule
        const regroupées = {};
        let totalCoef = 0, totalPond = 0, toutesUeValidees = true;

        notes.forEach(n => {
            const ue = n.code.split(".")[0];
            if (!regroupées[ue]) regroupées[ue] = { ec: [], sum: 0, coef: 0 };
            regroupées[ue].ec.push(n);
            regroupées[ue].sum += n.note * n.coefficient;
            regroupées[ue].coef += n.coefficient;
        });

        // 4️⃣ Affichage des UE et EC
        Object.entries(regroupées).forEach(([ueCode, ue]) => {
            const moyUe = ue.sum / ue.coef;
            totalCoef += ue.coef;
            totalPond += ue.sum;
            if (moyUe < 6) toutesUeValidees = false;

            // Ligne UE colorée
            const couleur = moyUe < 6
                ? "red" : moyUe < 10
                    ? "yellow" : "green";
            const ueRow = document.createElement("tr");
            ueRow.className = `ue ${couleur}`;
            ueRow.innerHTML = `
                <td>${ueCode}</td>
                <td colspan="2">UE ${ueCode}</td>
                <td>Moy.</td>
                <td>—</td>
                <td>${ue.coef}</td>
            `;
            tableau.appendChild(ueRow);

            // Lignes EC avec rang
            ue.ec.forEach(ec => {
                const rank = ranks.noteRanks[ec._id] || "—";
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${ec.code}</td>
                    <td colspan="2">${ec.nom}</td>
                    <td>
                      <input type="number" min="0" max="20" step="0.01"
                        data-id="${ec._id}"
                        value="${ec.note.toFixed(2)}"
                        class="input input-bordered input-sm w-full"/>
                    </td>
                    <td>${rank}/${ranks.totalStudents}</td>
                    <td>${ec.coefficient}</td>
                `;
                tableau.appendChild(tr);
            });
        });

        // 5️⃣ Moyenne générale + rang
        if (totalCoef > 0) {
            const moyGen = totalPond / totalCoef;
            const valid = moyGen >= 10 && toutesUeValidees;
            const msgValid = valid ? "✅ Année validée" : "❌ Année non validée";
            const footer = document.createElement("tr");
            footer.className = "footer";
            footer.innerHTML = `
                <td colspan="3">Moyenne générale : ${moyGen.toFixed(2)} – ${msgValid}</td>
                <td>—</td>
                <td>Rang : ${ranks.generalRank}/${ranks.totalStudents}</td>
                <td></td>
            `;
            tableau.appendChild(footer);
        }

        // 6️⃣ Listeners pour mise à jour
        document.querySelectorAll("input[data-id]").forEach(input => {
            input.addEventListener("change", async () => {
                const val = parseFloat(input.value);
                if (isNaN(val) || val < 0 || val > 20) {
                    alert("Note invalide (0–20).");
                    return;
                }
                try {
                    await apiFetch(`notes/${input.dataset.id}`, {
                        method: "PUT",
                        body: JSON.stringify({ note: Math.round(val * 100) / 100 })
                    });
                    await chargerNotes();
                } catch {
                    alert("Erreur mise à jour.");
                }
            });
        });
    }

    await chargerNotes();

    // Affiche le formulaire si « Autre »
    if (form) {
        form.style.display = parcours === "Autre" ? "grid" : "none";
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const code = form.elements["code"].value.trim();
            const nom = form.elements["nom"].value.trim();
            const note = parseFloat(form.elements["note"].value);
            const coef = parseFloat(form.elements["coefficient"].value);
            if (!code || !nom || isNaN(note) || note < 0 || note > 20 || isNaN(coef) || coef <= 0) {
                return alert("Formulaire invalide.");
            }
            try {
                await apiFetch("notes", {
                    method: "POST",
                    body: JSON.stringify({
                        code, nom,
                        note: Math.round(note * 100) / 100,
                        coefficient: coef
                    })
                });
                form.reset();
                await chargerNotes();
            } catch {
                alert("Erreur ajout note.");
            }
        });
    }

    // Déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
});
