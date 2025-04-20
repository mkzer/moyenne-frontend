// js/theme.js

const toggleTheme = document.getElementById("toggleTheme");
const html = document.documentElement;

// 🔄 Appliquer le thème stocké au chargement
const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
    html.setAttribute("data-theme", storedTheme);
}

// 🎯 Gestion du clic sur le bouton
if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
        const current = html.getAttribute("data-theme");
        const newTheme = current === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}
