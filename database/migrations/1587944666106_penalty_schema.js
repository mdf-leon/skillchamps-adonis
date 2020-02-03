'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PenaltySchema extends Schema {
  up () {
    this.create('penalties', (table) => {
      table.increments()
      table.integer('score_id').unsigned().references('id').inTable('scores') // FK
      table.integer('penalty_conf_id').unsigned().references('id').inTable('penalty_confs') // FK
      table.integer('quantity')
      table.timestamps()
    })
  }

  down () {
    this.drop('penalties')
  }
}

module.exports = PenaltySchema
