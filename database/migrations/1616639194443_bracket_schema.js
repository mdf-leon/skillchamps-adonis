'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BracketSchema extends Schema {
  up () {
    this.create('brackets', (table) => {
      table.increments()
      table.integer('trial_id').unique().unsigned().references('id').inTable('trials') // FK
      table.json('tournament')
      table.timestamps()
    })
  }

  down () {
    this.drop('brackets')
  }
}

module.exports = BracketSchema
