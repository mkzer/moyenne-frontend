const token = localStorage.getItem("token");
const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
const API_URL = "http://localhost:5000/api/notes";

if (!token || !utilisateur) {
    alert("Connexion requise");
    window.location.href = "index.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

document.getElementById("noteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        code: form.code.value,
        nom: form.nom.value,
        note: parseFloat(form.note.value),
        coefficient: parseFloat(form.coefficient.value)
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            form.reset();
            loadNotes();
        } else {
            const err = await res.json();
            alert(err.message || "Erreur lors de l’ajout");
        }
    } catch {
        alert("Erreur réseau");
    }
});

async function loadNotes() {
    try {
        const res = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const notes = await res.json();
        displayNotes(notes);
    } catch {
        alert("Impossible de charger les notes");
    }
}

function displayNotes(notes) {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    // Grouper les notes par UE
    const grouped = {};
    notes.forEach(note => {
        const ueCode = note.code.split(".")[0];
        if (!grouped[ueCode]) grouped[ueCode] = { ec: [], total: 0, poids: 0 };
        grouped[ueCode].ec.push(note);
        grouped[ueCode].total += note.note * note.coefficient;
        grouped[ueCode].poids += note.coefficient;
    });

    Object.entries(grouped).forEach(([ueCode, { ec, total, poids }]) => {
        const moyenne = (total / poids).toFixed(2);
        const moyenneColor =
            moyenne < 6 ? "bg-red-400" :
                moyenne < 10 ? "bg-yellow-400" : "bg-green-400";

        const ueDiv = document.createElement("div");
        ueDiv.className = `border rounded p-3 bg-base-100 shadow space-y-2`;

        ueDiv.innerHTML = `
      <div class="font-bold border-l-4 ${moyenneColor} pl-2">
        UE ${ueCode} – Moyenne : ${moyenne}
      </div>
    `;

        ec.forEach(note => {
            const ecRow = document.createElement("div");
            ecRow.className = "text-sm text-neutral-content border-b border-base-300 py-1";
            ecRow.innerHTML = `
        <span class="font-semibold">${note.code}</span> – ${note.nom}<br>
        Note : ${note.note} | Coef : ${note.coefficient}
      `;
            ueDiv.appendChild(ecRow);
        });

        container.appendChild(ueDiv);
    });
}

loadNotes();

// ▶ Affichage mode admin : liste des utilisateurs
if (utilisateur.isAdmin) {
    fetch("http://localhost:5000/api/utilisateurs", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(users => {
            const container = document.createElement("div");
            container.className = "mt-10 p-4 border rounded bg-base-100";
            container.innerHTML = `<h2 class="text-xl font-bold mb-2">Utilisateurs (admin)</h2>`;

            users.forEach(u => {
                const card = document.createElement("div");
                card.className = "text-sm py-1 border-b border-base-300";
                card.innerHTML = `
          <strong>${u.prenom} ${u.nom}</strong> – ${u.email}<br/>
          <span class="text-xs">${u.parcours}</span>
        `;
                container.appendChild(card);
            });

            document.querySelector(".container").appendChild(container);
        })
        .catch(() => console.log("Erreur chargement admin"));
}
