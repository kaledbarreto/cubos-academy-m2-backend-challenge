const express = require('express');
const routes = require('./src/routes/rotas');

const app = express();
app.use(express.json());
app.use(routes);

app.listen(8000);