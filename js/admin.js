// frontend/js/admin.js
(async () => {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "index.html";

    // Références DOM
    const selectParcours = document.getElementById("selectParcours");
    const radioGeneral = document.getElementById("typeGeneral");
    const radioUE = document.getElementById("typeUE");
    const inputCodeUE = document.getElementById("inputCodeUE");
    const btnAfficher = document.getElementById("btnAfficher");
    const tbody = document.querySelector("#classementTable tbody");

    // Cacher/montrer le champ code UE
    radioUE.addEventListener("change", () => {
        inputCodeUE.style.display = "inline-block";
    });
    radioGeneral.addEventListener("change", () => {
        inputCodeUE.style.display = "none";
    });

    btnAfficher.addEventListener("click", async () => {
        const parcours = selectParcours.value;
        const type = radioUE.checked ? "ue" : "general";
        if (type === "ue" && !inputCodeUE.value.trim()) {
            return alert("Merci de saisir le code d'UE");
        }

        // Construire la query
        const params = new URLSearchParams({ parcours, type });
        if (type === "ue") params.set("code", inputCodeUE.value.trim());

        try {
            // Note : endpoint sans préfixe `/api` car utils.js l’ajoute
            const data = await apiFetch(`admin/classement?${params}`);

            tbody.innerHTML = "";
            data.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${row.nom}</td>
          <td>${row.prenom}</td>
          <td>${type === "ue"
                        ? parseFloat(row.note).toFixed(2)
                        : parseFloat(row.moyenne).toFixed(2)
                    }</td>
        `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            alert(err.message);
        }
    });
})();
