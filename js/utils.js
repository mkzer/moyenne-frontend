// js/utils.js

// URL de votre API backend hébergée sur Render (ou autre)
const API_BASE_URL = "https://moyenne-backend.onrender.com/api";

/**
 * Effectue une requête API vers le backend.
 * @param {string} endpoint - Chemin après /api/ (ex: 'utilisateurs/connexion')
 * @param {Object} options - Options fetch (méthode, headers, body, etc.)
 * @returns {Promise<any|null>} - Données JSON, ou null si pas de JSON (ex: DELETE)
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    // En cas d'erreur HTTP, tente de lire un message JSON
    if (!res.ok) {
        let msg = `Erreur ${res.status}`;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            try {
                const errData = await res.json();
                msg = errData.message || msg;
            } catch { }
        }
        throw new Error(msg);
    }

    // Si la réponse est JSON, on la parse ; sinon on renvoie null
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return await res.json();
    }
    return null;
}

// Expose apiFetch dans le navigateur
window.apiFetch = apiFetch;
