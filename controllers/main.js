const uuidv4 = require('uuid/v4');

const requireTable = (db) => {
  db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  db.schema.hasTable('recipelist')
    .then(function(exists) {
      if (!exists) {
        return db.schema.createTable('recipelist', function(t) {
          // t.uuid('id').defaultTo(db.raw('uuid_generate_v4()')).primary();
          t.uuid('id').defaultTo(db.raw('uuid_generate_v4()')).primary();
          t.string('title', 100);
          t.text('reason');
          t.text('description');
          t.dateTime('createDate');
          t.dateTime('changeDate');
          t.uuid('parent');
        });
      }
    })
    .catch(err => {
      console.log(err);
    });

};

const getTableData = (req, res, db) => {
  db.select('*').from('recipelist')
    .then(items => {
      if(items.length){
        res.json(items)
      } else {
        res.json({dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
};

const postTableData = (req, res, db) => {
  // const { first, last, email, phone, location, hobby } = req.body
  let { title, reason, description, id, parent, createDate, changeDate } = req.body;
  const v4 = uuidv4();
  const date = new Date();

  if (!parent && !id) {
    id = v4;
    parent = v4;
    createDate = date;
    changeDate = date;
  } else {
    id = v4;
    changeDate = date;
  }


  db('recipelist').insert({ id, title, reason, description, createDate, changeDate, parent })
    .returning('*')
    .then(item => {
      res.json(item)
    })
    .catch(err => {
      console.log(err)
      res.status(400).json({dbError: 'db error'})
    })
};

const putTableData = (req, res, db) => {
  const { id, title, reason, description } = req.body
  db('recipelist').where({id}).update({title, reason, description })
    .returning('*')
    .then(item => {
      res.json(item)
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
};

const deleteTableData = (req, res, db) => {
  const { id } = req.body
  db('recipelist').where({id}).del()
    .then(() => {
      res.json({delete: 'true'})
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
};

module.exports = {
  requireTable,
  getTableData,
  postTableData,
  putTableData,
  deleteTableData
};
