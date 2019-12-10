'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TrialSchema extends Schema {
  up () {
    this.create('trials', (table) => {
      table.increments()
      table.integer('event_id') // FK
      table.string('name')
      table.timestamps()
    })
  }

  down () {
    this.drop('trials')
  }
}

module.exports = TrialSchema
