'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TrialSchema extends Schema {
  up () {
    this.create('trials', (table) => {
      table.increments()
      table.integer('event_id').unsigned().references('id').inTable('events') // FK
      table.boolean('inverted').unsigned().defaultTo(false)
      table.string('name')
      table.timestamps()
    })
  }

  down () {
    this.drop('trials')
  }
}

module.exports = TrialSchema
