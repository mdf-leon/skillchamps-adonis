'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventSchema extends Schema {
  up () {
    this.create('events', (table) => {
      table.increments()
      table.string('event_name')
      //table.int('countries_id').nullable()
      //table.int('subdivision_id')
      //table.int('city_id').nullable()
      //table.string('street1').nullable()
      //table.string('street2').nullable()
      // table.int('street2').nullable()
      table.string('photo_folder').nullable()
      table.string('photo_event').nullable()
      table.date('date_begin')
      table.date('date_end').nullable()
      table.boolean('active')
    })
  }

  down () {
    this.drop('events')
  }
}

module.exports = EventSchema
