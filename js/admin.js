// js/admin.js

(async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("utilisateur") || "{}");
    if (!token || !user.isAdmin) {
        alert("Accès admin requis.");
        return window.location.href = "index.html";
    }

    // Références DOM
    const selectParcours = document.getElementById("selectParcours");
    const radioGeneral = document.getElementById("typeGeneral");
    const radioUE = document.getElementById("typeUE");
    const ueGroup = document.getElementById("ue-group");
    const selectUE = document.getElementById("selectUE");
    const btnAfficher = document.getElementById("btnAfficher");
    const tbody = document.querySelector("#tblClassement tbody");
    const logoutBtn = document.getElementById("logoutBtn");
    const ctx = document.getElementById("histogramme").getContext("2d");
    let chartInstance;

    // Toggle champ UE
    radioUE.addEventListener("change", () => ueGroup.style.display = "block");
    radioGeneral.addEventListener("change", () => ueGroup.style.display = "none");

    // Déconnexion
    logoutBtn.onclick = () => {
        localStorage.clear();
        window.location.href = "index.html";
    };

    // Affichage du classement + histogramme
    btnAfficher.addEventListener("click", async () => {
        const parcours = selectParcours.value;
        const type = radioUE.checked ? "ue" : "general";
        const code = selectUE.value.trim();

        if (!parcours) {
            return alert("Choisissez un parcours.");
        }
        if (type === "ue" && !code) {
            return alert("Indiquez le code UE.");
        }

        // Construire params
        const params = new URLSearchParams({ parcours, type });
        if (type === "ue") params.set("code", code);

        try {
            // 1) Classement
            const classement = await apiFetch(`admin/classement?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            tbody.innerHTML = "";
            classement.forEach(item => {
                const tr = document.createElement("tr");
                const valeur = type === "general"
                    ? item.moyenne.toFixed(2)
                    : item.note.toFixed(2);
                tr.innerHTML = `<td>${item.nom}</td><td>${item.prenom}</td><td>${valeur}</td>`;
                tbody.appendChild(tr);
            });

            // 2) Histogramme — uniquement pour UE
            if (type === "ue") {
                const notes = await apiFetch(`admin/histogram?parcours=${encodeURIComponent(parcours)}&code=${encodeURIComponent(code)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Si déjà un chart, on le détruit
                if (chartInstance) chartInstance.destroy();
                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: notes.map((_, i) => `Élève ${i + 1}`),
                        datasets: [{ label: `Notes UE ${code}`, data: notes }]
                    },
                    options: {
                        scales: {
                            x: { title: { display: true, text: "Étudiant" } },
                            y: { beginAtZero: true, max: 20 }
                        }
                    }
                });
            } else if (chartInstance) {
                chartInstance.destroy();
            }

        } catch (err) {
            alert(err.message);
        }
    });
})();
