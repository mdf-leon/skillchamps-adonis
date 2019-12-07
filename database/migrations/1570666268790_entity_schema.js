'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EntitySchema extends Schema {
  up () {
    this.create('entities', (table) => {
      table.increments()
      table.string('name', 80)
      table.string('fed_tax_ido', 80)
      table.string('subd_tax_ido', 80)
      table.string('city_tax_ido', 80)
      // table.string('postal_code', 80)
      // table.string('street1', 80)
      // table.string('street2', 80)
      // table.integer('city_id', 80) // fk
      // table.integer('subdivision_id', 80) // fk
      // table.integer('country_id', 80) // fk
      table.boolean('active').notNullable().defaultTo(0)
      
      table.timestamps()
    })
  }

  down () {
    this.drop('entities')
  }
}

module.exports = EntitySchema
