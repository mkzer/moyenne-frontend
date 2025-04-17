// js/dashboard.js

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

    // Structure des matières par parcours
    const matieres = {
        commun: [
            { code: "801.1", nom: "Rapports de projet", coefficient: 3 },
            { code: "801.2", nom: "Présentations de projet", coefficient: 3 },
            { code: "ANG.1", nom: "Anglais Écrit", coefficient: 1.5 },
            { code: "ANG.2", nom: "Anglais Oral", coefficient: 1.5 },
            { code: "871.1", nom: "IA : Théorie", coefficient: 1.5 },
            { code: "871.2", nom: "IA : TP", coefficient: 1.5 },
            { code: "872.1.1", nom: "Unix : Examen écrit", coefficient: 0.5 },
            { code: "872.1.2", nom: "Unix : Rapport TP", coefficient: 0.5 },
            { code: "872.2.1", nom: "Réseaux : Examen", coefficient: 1 },
            { code: "872.2.2", nom: "Réseaux : TP", coefficient: 1 }
        ],
        MTI: [
            { code: "881.1", nom: "Accélération matérielle", coefficient: 1.5 },
            { code: "881.2", nom: "TP Accélération", coefficient: 1.5 },
            { code: "882.1", nom: "Supervision industrielle", coefficient: 1.5 },
            { code: "882.2.1", nom: "Supervision réseau - écrit", coefficient: 0.5 },
            { code: "882.2.2", nom: "Supervision réseau - TP", coefficient: 1 },
            { code: "883.1", nom: "Commande numériques - écrit", coefficient: 1.5 },
            { code: "883.2", nom: "Commande numériques - écrit 2", coefficient: 1.5 },
            { code: "884.1", nom: "Outils info - écrit", coefficient: 1.5 },
            { code: "884.2", nom: "Outils info - TP", coefficient: 1.5 },
            { code: "885.1", nom: "Télémesure - écrit", coefficient: 1.5 },
            { code: "885.2", nom: "Télémesure - TP", coefficient: 1.5 }
        ],
        ISHM: [
            { code: "873.1", nom: "Simulation automatique - écrit", coefficient: 1.5 },
            { code: "873.2", nom: "Simulation automatique - TP", coefficient: 1.5 },
            { code: "874.1", nom: "Signal numérique - écrit", coefficient: 3 },
            { code: "874.2", nom: "Signal numérique - TP", coefficient: 1.5 },
            { code: "874.3", nom: "Régulation numérique - écrit", coefficient: 1.75 },
            { code: "874.4", nom: "Régulation numérique - TP", coefficient: 0.5 },
            { code: "874.5", nom: "Représentation d'état - écrit", coefficient: 1.75 },
            { code: "874.6", nom: "Représentation d'état - TP", coefficient: 0.5 },
            { code: "882.1", nom: "Supervision industrielle", coefficient: 1.5 },
            { code: "882.2.1", nom: "Supervision réseau - écrit", coefficient: 0.5 },
            { code: "882.2.2", nom: "Supervision réseau - TP", coefficient: 1 }
        ],
        IMEEN: [
            { code: "861.1", nom: "Biomasse/Biogaz", coefficient: 1.5 },
            { code: "861.2", nom: "Bois énergie", coefficient: 1.5 },
            { code: "862.1", nom: "Modélisation bâtiment - écrit", coefficient: 0.75 },
            { code: "862.2", nom: "Modélisation bâtiment - TP", coefficient: 0.75 },
            { code: "862.3", nom: "Étude des matériaux", coefficient: 1.5 },
            { code: "862.4", nom: "CVC", coefficient: 1.5 },
            { code: "862.5", nom: "BIM - écrit", coefficient: 0.75 },
            { code: "862.6", nom: "BIM - TP", coefficient: 0.75 },
            { code: "863.1", nom: "Énergies renouvelables", coefficient: 3 },
            { code: "863.2", nom: "Caméra thermique", coefficient: 3 }
        ]
    };

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

        const toutes = [...matieres.commun];
        if (parcours === "MTI") toutes.push(...matieres.MTI);
        if (parcours === "ISHM") toutes.push(...matieres.ISHM);
        if (parcours === "IMEEN") toutes.push(...matieres.IMEEN);

        let total = 0, pondérée = 0;

        for (const ec of toutes) {
            const existante = notes.find(n => n.code === ec.code);
            const valeur = existante ? existante.note : 0;

            const couleur =
                valeur < 6 ? "bg-red-100" :
                    valeur < 10 ? "bg-yellow-100" :
                        valeur === 0 ? "bg-gray-100" : "bg-green-100";

            const ligne = document.createElement("tr");
            ligne.className = couleur;
            ligne.innerHTML = `
                <td>${ec.code}</td>
                <td>${ec.nom}</td>
                <td>
                    <input type="number" min="0" max="20" step="0.1" 
                        data-id="${existante ? existante._id : ''}"
                        data-code="${ec.code}"
                        data-nom="${ec.nom}"
                        data-coef="${ec.coefficient}"
                        value="${valeur}"
                        class="input input-bordered input-sm w-full"/>
                </td>
                <td>${ec.coefficient}</td>
            `;
            tableau.appendChild(ligne);

            if (valeur > 0) {
                total += ec.coefficient;
                pondérée += ec.coefficient * valeur;
            }
        }

        if (total > 0 && total === toutes.reduce((sum, e) => sum + e.coefficient, 0)) {
            const moyenne = (pondérée / total).toFixed(2);
            const ligneMoyenne = document.createElement("tr");
            ligneMoyenne.className = "bg-base-300 font-bold";
            ligneMoyenne.innerHTML = `<td colspan="3" class="text-center">Moyenne générale</td><td>${moyenne}</td>`;
            tableau.appendChild(ligneMoyenne);
        }

        // Ajout des listeners sur chaque input
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
                    if (input.dataset.id) {
                        await apiFetch(`notes/${input.dataset.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ note: valeur })
                        });
                    } else {
                        const res = await apiFetch("notes", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(payload)
                        });
                        input.dataset.id = res.note._id;
                    }

                    await chargerNotes();
                } catch (err) {
                    console.error(err);
                    alert("Erreur lors de la mise à jour.");
                }
            });
        });
    }

    await chargerNotes();

    // Masquer le formulaire sauf si parcours === "Autre"
    if (form) form.style.display = parcours === "Autre" ? "grid" : "none";

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
});
