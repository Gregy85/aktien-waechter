# Aktien-Wächter V7

Diese Version löst das CORS-Problem der reinen Browser-Version: Die Web-App ruft ihre Marktdaten über das eigene Backend ab.

## Start
1. Node.js 18+ installieren.
2. In diesem Ordner ausführen:
   `npm install`
3. Danach:
   `npm start`
4. Browser öffnen: `http://localhost:3000`

Die ersten Positionen sind bereits eingetragen:
- D-Wave Quantum: 31 Aktien, Einstand 8,31 €
- Circus SE: 19 Aktien, Einstand 10,55 €

Das Backend stellt `/api/quote/:symbol`, `/api/quotes` und `/api/news/:symbol` bereit.

Für eine echte dauerhaft erreichbare Web-App muss der Ordner auf einen Node-fähigen Hoster deployed werden. Die App führt keine Käufe oder Verkäufe automatisch aus.
