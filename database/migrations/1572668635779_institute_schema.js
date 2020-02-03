'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InstituteSchema extends Schema {
  up () {
    this.create('institutes', (table) => {
      table.increments()
      table.string('name', 80)
      table.integer('user_id').unique().unsigned().references('id').inTable('users') // FK
      table.integer('entity_id').unsigned().references('id').inTable('entities') // FK
      table.timestamps()
    })
  }

  down () {
    this.drop('institutes')
  }
}

module.exports = InstituteSchema
