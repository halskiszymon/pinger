import express from 'express';
import knex from 'knex';
import {Model} from 'objection';
import knexConfig from './knexfile.js';
import paths from './routes/paths.js';
import utils from './utils.js';
import config from './config.js';
import {engine} from 'express-handlebars';
import authGuard from "./middleware/authGuard.js";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.js';
import monitorsRoutes from './routes/monitors.js';
import monitoring from "./monitoring.js";
import User from "./models/User.js";
import * as path from "node:path";
import * as fs from "node:fs";

const app = express();

app.use(cookieParser());

app.locals.monitoringIntervals = {};

app.locals.paths = paths;

app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: './views/layouts',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true
  },
  helpers: {
    copyrightYear: function () {
      return new Date().getFullYear();
    },
    notEq: function (a, b) {
      return a !== b;
    },
    eq: function (a, b) {
      return a === b;
    },
    replaceIdInPath: function (path, id) {
      return path.replace(':id', id);
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

await monitoring.init(app);

const managerUser = await User.query().findOne({email: 'manager@pinger.io'});
if (!managerUser) {
  const newPassword = utils.generateRandomString(15);

  const newUser = await User.query().insert({
    displayName: 'Manager',
    email: 'manager@pinger.io',
    password: newPassword
  });

  const filePath = path.join(process.cwd(), 'manager-password.txt');

  const fileContent = `Email: ${newUser.email}\nPassword: ${newPassword}\n`;

  fs.writeFileSync(filePath, fileContent, 'utf8');

  console.log(`Created manager user, password saved in ${filePath}.`);
}

app.listen(config.APP_PORT, () => {
  console.log(`App is ready on port ${config.APP_PORT}.`);
});