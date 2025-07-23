const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Sert les fichiers statiques générés par Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Redirige toutes les routes vers index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
