const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/healthz', (_req, res) => res.send('ok'));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log('Stargate: Velení SGC běží na portu ' + PORT));
