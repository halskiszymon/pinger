import express from 'express';
import knex from 'knex';
import {Model} from 'objection';
import knexConfig from './knexfile.js';
import config from './config.js';
import {engine} from "express-handlebars";

const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const db = knex(knexConfig.development);
Model.knex(db);

app.get('/', (req, res) => {
  res.render('home', {title: 'Home', message: 'Welcome to Handlebars!'});
});

app.listen(config.APP_PORT, () => {
  console.log(`App is ready on port ${config.APP_PORT}.`);
});