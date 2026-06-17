const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
    res.send('Hi Team5 MEARN Assiut');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});