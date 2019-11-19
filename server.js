const express = require('express');

// use process.env variables to keep private variables
require('dotenv').config();
const PORT = process.env.PORT || 3300;

const helmet = require('helmet'); // creates headers that protect from attacks (security)
const bodyParser = require('body-parser'); // turns response into usable format
const cors = require('cors');  // allows/disallows cross-site communication
const morgan = require('morgan'); // logs requests

const db = require('knex')({
  dialect: 'pg',
  connection: {
    host : '127.0.0.1',
    port: '5433',
    user : 'postgres',
    password : '123',
    database : 'cookbookjs'
  }
});

const app = express();
const main = require('./controllers/main');

const whitelist = ['http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(morgan('combined'));

app.get('/', (req, res) => res.send('hello world'));
app.get('/crud', (req, res) => main.getTableData(req, res, db));
app.post('/crud', (req, res) => main.postTableData(req, res, db));
app.put('/crud', (req, res) => main.putTableData(req, res, db));
app.delete('/crud', (req, res) => main.deleteTableData(req, res, db));


async function start() {
  try {
    main.requireTable(db);

    app.listen(PORT, () => {
      console.log('Server has been started on ', PORT);
    });
  } catch (err) {
    console.log(err);
  }
}

start();
