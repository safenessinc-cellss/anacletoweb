const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Backend funcionando'));
app.listen(port, () => console.log(`Servidor en puerto ${port}`));
