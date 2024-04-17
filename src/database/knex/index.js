const config = require('../../../knexfile')
const knex = require('knex')

const connection = knex.Client(config.development)

module.exports = connection