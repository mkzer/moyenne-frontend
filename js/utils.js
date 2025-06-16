// js/utils.js

// URL de votre API backend (Render, etc.)
const API_BASE_URL = "https://moyenne-backend.onrender.com/api";

/**
 * Effectue une requête API vers le backend.
 * @param {string} endpoint - Chemin après /api/ (ex: 'utilisateurs/me')
 * @param {Object} options - Options fetch (méthode, headers, body)
 * @returns {Promise<any|null>} - Données JSON ou null si pas de JSON
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        ...options
    });

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

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        return await res.json();
    }
    return null;
}

window.apiFetch = apiFetch;
