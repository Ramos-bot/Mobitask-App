const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000; // Replit Deployments espera 5000

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

// Healthcheck para o Replit
app.get('/health', (_req, res) => res.status(200).send('ok'));

// SPA fallback
app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Mobitask web a servir em http://localhost:${PORT}`);
});
