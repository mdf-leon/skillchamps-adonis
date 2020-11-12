'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BonusSchema extends Schema {
  up () {
    this.create('bonuses', (table) => {
      table.increments()
      table.integer('score_id').unsigned().references('id').inTable('scores') // FK
      table.integer('bonus_conf_id').unsigned().references('id').inTable('bonus_confs') // FK
      table.integer('quantity')
      table.timestamps()
    })
  }

  down () {
    this.drop('bonuses')
  }
}

module.exports = BonusSchema
