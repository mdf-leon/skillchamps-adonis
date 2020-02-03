'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventRiderSchema extends Schema {
  up () {
    this.create('event_rider', (table) => {
      table.increments()
      table.integer('event_id').unsigned().references('id').inTable('events') // FK
      table.integer('rider_id').unsigned().references('id').inTable('riders') // FK
      table.timestamps()
    })
  }

  down () {
    this.drop('event_rider')
  }
}

module.exports = EventRiderSchema
