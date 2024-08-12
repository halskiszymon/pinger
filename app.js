import express from 'express';
import knex from 'knex';
import {Model} from 'objection';
import knexConfig from './knexfile.js';
import paths from './routes/paths.js';
import config from './config.js';
import {engine} from 'express-handlebars';
import authGuard from "./middleware/authGuard.js";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.js';
import monitorsRoutes from './routes/monitors.js';

const app = express();

app.use(cookieParser());

app.locals.paths = paths;

app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: './views/layouts',
  helpers: {
    copyrightYear: function () {
      return new Date().getFullYear();
    },
    notEq: function (a, b) {
      return a !== b;
    },
    eq: function (a, b) {
      console.error(a, b)
      return a === b;
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.urlencoded({extended: true}));

app.use(express.static('./views/public'));

const db = knex(knexConfig.development);
Model.knex(db);

app.get(paths.app.index, authGuard, (req, res) => {
  res.redirect(paths.app.monitors.list);
});

app.use(authRoutes);
app.use(monitorsRoutes);

app.listen(config.APP_PORT, () => {
  console.log(`App is ready on port ${config.APP_PORT}.`);
});