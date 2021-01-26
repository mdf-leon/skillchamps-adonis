'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventSchema extends Schema {
  up () {
    this.create('events', (table) => {
      table.increments()
      table.integer('institute_id').notNullable().unsigned().references('id').inTable('institutes') // FK
      //ADDRESS FK
      table.string('event_name')
      //table.int('countries_id').nullable()
      //table.int('subdivision_id')
      //table.int('city_id').nullable()
      //table.string('street1').nullable()
      //table.string('street2').nullable()
      // table.int('street2').nullable()
      table.text('photo_folder').nullable()
      table.text('photo_event').nullable()
      table.text('longtext').nullable()
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
