const API_BASE_URL = "https://moyenne-backend.onrender.com/api";

/**
 * Effectue une requête API vers le backend.
 * @param {string} endpoint - Chemin de l'API après /api/ (ex: 'utilisateurs/connexion')
 * @param {Object} options - Options fetch (méthode, headers, body, etc.)
 * @returns {Promise<any>} - Réponse JSON de l'API.
 */
async function apiFetch(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            },
            ...options
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur serveur");
        return data;
    } catch (err) {
        console.error("Erreur API:", err.message);
        throw err;
    }
}
