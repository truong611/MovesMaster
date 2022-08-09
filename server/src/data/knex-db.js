const knext = require('knex');
const knextfile = require('../knexfile');

// @ts-ignore
const db = knext(knextfile.development);
module.exports = db;