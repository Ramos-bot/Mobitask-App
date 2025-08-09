const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000; // Replit usa 5000

const distDir = path.join(__dirname, 'dist');

// Guard: dist tem de existir (foi gerado por `expo export`)
if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('Falta dist/index.html. Corre: npm run build:web');
    process.exit(1);
}

// estáticos com cache leve e fallback .html
app.use(express.static(distDir, { maxAge: '1h', extensions: ['html'] }));

// Healthcheck para o Replit
app.get('/health', (_req, res) => res.status(200).send('OK'));

// SPA fallback (todas as rotas → index.html)
app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Mobitask web a servir em http://localhost:${PORT}`);
});
