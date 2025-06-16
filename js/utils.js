// js/utils.js
// ════════════════════════════════════════════════════════════════════════════════

// Remplace cette ligne :
const API_BASE_URL = "/api";

// Par ceci (avec l’URL complète de ton backend) :
const API_BASE_URL = "https://moyenne-backend.onrender.com/api";

/**
 * Effectue une requête API vers le backend.
 * @param {string} endpoint - Chemin après /api/ (ex: 'utilisateurs/me')
 * @param {Object} options - Options fetch
 * @returns {Promise<any|null>} - JSON ou null si pas de JSON
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
                const err = await res.json();
                msg = err.message || msg;
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
