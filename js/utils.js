const API_BASE_URL = "https://moyenne-backend.onrender.com/api";

/**
 * Effectue une requête API vers le backend.
 * @param {string} endpoint - Chemin de l'API après /api/ (ex: 'utilisateurs/connexion')
 * @param {Object} options - Options fetch (méthode, headers, body, etc.)
 * @returns {Promise<any|null>} - Réponse JSON de l'API ou null si pas de JSON à renvoyer.
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

    // Pour les statuts d’erreur, essaie de lire un message JSON sinon lève une erreur générique
    if (!res.ok) {
        let message = `Erreur ${res.status}`;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            try {
                const errData = await res.json();
                message = errData.message || message;
            } catch { }
        }
        throw new Error(message);
    }

    // Si c’est du JSON, pars-le, sinon retourne null (ex: DELETE 204)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return await res.json();
    }
    return null;
}

// Rend la fonction dispo globalement
window.apiFetch = apiFetch;
