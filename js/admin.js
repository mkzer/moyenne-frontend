// frontend/js/admin.js

let chartInstance = null;

(async () => {
    const token = localStorage.getItem("token");
    const util = JSON.parse(localStorage.getItem("utilisateur") || "{}");
    if (!token || !util.isAdmin) {
        alert("Accès admin requis.");
        return window.location.href = "index.html";
    }

    // Références DOM
    const selectParcours = document.getElementById("filtre-parcours");
    const radioGeneral = document.querySelector('input[name="type"][value="general"]');
    const radioUE = document.querySelector('input[name="type"][value="ue"]');
    const inputCodeUE = document.getElementById("filtre-ue");
    const btnAfficher = document.getElementById("btnAfficher");
    const tbody = document.querySelector("#tblClassement tbody");
    const ctx = document.getElementById("histogramme").getContext("2d");

    // Toggle champ UE
    radioGeneral.addEventListener("change", () => inputCodeUE.parentElement.parentElement.style.display = "none");
    radioUE.addEventListener("change", () => inputCodeUE.parentElement.parentElement.style.display = "block");

    // Déconnexion
    document.getElementById("logoutBtn").onclick = () => {
        localStorage.clear();
        window.location.href = "index.html";
    };

    btnAfficher.addEventListener("click", async () => {
        const parcours = selectParcours.value;
        const type = radioUE.checked ? "ue" : "general";
        const code = inputCodeUE.value.trim();

        if (!parcours) {
            return alert("Choisissez un parcours.");
        }
        if (type === "ue" && !code) {
            return alert("Indiquez le code UE.");
        }

        try {
            // 1) Classement
            let urlClassement = `admin/classement?parcours=${encodeURIComponent(parcours)}&type=${type}`;
            if (type === "ue") {
                urlClassement += `&code=${encodeURIComponent(code)}`;
            }
            const classement = await apiFetch(urlClassement, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remplir le tableau
            tbody.innerHTML = "";
            classement.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${item.nom}</td>
          <td>${item.prenom}</td>
          <td>${type === "general"
                        ? item.moyenne.toFixed(2)
                        : item.note.toFixed(2)
                    }</td>
        `;
                tbody.appendChild(tr);
            });

            // 2) Histogramme de fréquences (UE uniquement)
            if (type === "ue") {
                // Récupérer toutes les notes brutes
                const notes = await apiFetch(
                    `admin/histogram?parcours=${encodeURIComponent(parcours)}&code=${encodeURIComponent(code)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Construire la map de fréquences
                const freq = notes.reduce((acc, n) => {
                    // arrondi au demi-point (0.5) — adapte si besoin
                    const key = (Math.round(n * 2) / 2).toFixed(1);
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                // Labels triés et dataPoints
                const labels = Object.keys(freq).sort((a, b) => parseFloat(a) - parseFloat(b));
                const dataPoints = labels.map(l => freq[l]);

                // Détruire l’ancienne instance si existante
                if (chartInstance) chartInstance.destroy();

                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: `Effectif notes UE ${code}`,
                            data: dataPoints
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                title: { display: true, text: "Note" }
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: "Nombre d'étudiants" }
                            }
                        }
                    }
                });
            } else {
                // Si on repasse en général : on vide le canvas
                if (chartInstance) {
                    chartInstance.destroy();
                    chartInstance = null;
                }
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }

        } catch (err) {
            alert(err.message || "Erreur serveur.");
        }
    });
})();
