# Ràdio Industrial Jove — desplegament a Railway

Web de la ràdio escolar de l'Institut Escola Industrial de Sabadell.

## Contingut
- `index.html` — tota la web en un sol fitxer (autònom, sense dependències externes)
- `package.json` — configuració perquè Railway serveixi la web

## Com desplegar a Railway (pas a pas)
1. Crea un compte a https://github.com i crea un repositori nou (botó "New repository"), per exemple `radio-industrial-jove`, públic.
2. A la pàgina del repositori, clica "uploading an existing file" i arrossega-hi els 3 fitxers d'aquesta carpeta (`index.html`, `package.json`, `README.md`). Clica "Commit changes".
3. Entra a https://railway.com i inicia sessió amb el teu compte de GitHub.
4. Clica "New Project" → "Deploy from GitHub repo" → tria `radio-industrial-jove`.
5. Espera que acabi el desplegament (1-2 minuts).
6. Al servei, ves a "Settings" → "Networking" → clica "Generate Domain".
7. Ja tens la web pública a l'adreça que et doni (acaba en `.up.railway.app`).

## Notes
- El panell docent (botó "Docents") té la contrasenya de demostració `docent2026`.
- Els enviaments i aprovacions es guarden al navegador de cada visitant (localStorage): és un prototip, encara sense base de dades.
