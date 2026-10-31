const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/healthz', (_req, res) => res.send('ok'));
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') // prohlížeč si před použitím ověří, že má nejnovější soubor
}));

app.listen(PORT, () => console.log('Stargate: Velení SGC běží na portu ' + PORT));
