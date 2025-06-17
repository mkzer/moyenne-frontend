// frontend/js/admin.js
(async () => {
    const token = localStorage.getItem("token");
    const utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "{}");

    // Si pas connecté ou pas admin, redirige
    if (!token || !utilisateur.isAdmin) {
        alert("Accès admin requis.");
        return window.location.href = "index.html";
    }

    // DOM elements
    const selectParcours = document.getElementById("selectParcours");
    const radioGeneral = document.getElementById("typeGeneral");
    const radioUE = document.getElementById("typeUE");
    const inputUE = document.getElementById("selectUE");
    const ueGroup = document.getElementById("ue-group");
    const btnAfficher = document.getElementById("btnAfficher");
    const tblBody = document.querySelector("#tblClassement tbody");
    const ctx = document.getElementById("histogramme").getContext("2d");
    let chartInstance; // pour effacer l'ancien

    // Toggle champ UE
    radioUE.addEventListener("change", () => ueGroup.style.display = "block");
    radioGeneral.addEventListener("change", () => ueGroup.style.display = "none");

    // Quand on clique sur Afficher classement
    btnAfficher.addEventListener("click", async () => {
        const parcours = selectParcours.value;
        const type = radioUE.checked ? "ue" : "general";
        const code = inputUE.value.trim();

        if (!parcours) {
            return alert("Choisissez un parcours.");
        }
        if (type === "ue" && !code) {
            return alert("Merci de saisir le code d'UE.");
        }

        // Construire l’URL (utils.js ajoute /api/)
        let url = `admin/classement?parcours=${encodeURIComponent(parcours)}&type=${type}`;
        if (type === "ue") {
            url += `&code=${encodeURIComponent(code)}`;
        }

        try {
            // 1) Récupère le classement
            const data = await apiFetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remplir le tableau
            tblBody.innerHTML = "";
            data.forEach(item => {
                const valeur = type === "ue"
                    ? parseFloat(item.note).toFixed(2)
                    : parseFloat(item.moyenne).toFixed(2);
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${item.nom}</td>
          <td>${item.prenom}</td>
          <td>${valeur}</td>
        `;
                tblBody.appendChild(tr);
            });

            // 2) Histogramme — uniquement si UE
            //    Comptage des effectifs par note
            if (type === "ue") {
                const notes = await apiFetch(
                    `admin/histogram?parcours=${encodeURIComponent(parcours)}&code=${encodeURIComponent(code)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Compter la fréquence de chaque note
                const freq = {};
                notes.forEach(n => {
                    const key = n.toFixed(2);
                    freq[key] = (freq[key] || 0) + 1;
                });

                // Préparer labels et data
                const labels = Object.keys(freq).sort((a, b) => parseFloat(a) - parseFloat(b));
                const values = labels.map(l => freq[l]);

                // Si y avait déjà un chart, on le détruit
                if (chartInstance) chartInstance.destroy();

                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: `Effectif des notes UE ${code}`,
                            data: values
                        }]
                    },
                    options: {
                        scales: {
                            x: { title: { display: true, text: "Note" } },
                            y: { beginAtZero: true, title: { display: true, text: "Effectif" } }
                        }
                    }
                });

            } else {
                // Si on repasse en général, on efface l'histogramme
                if (chartInstance) {
                    chartInstance.destroy();
                    chartInstance = null;
                }
            }
        } catch (err) {
            alert(err.message);
        }
    });

    // Déconnexion (une seule fois)
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

})();
