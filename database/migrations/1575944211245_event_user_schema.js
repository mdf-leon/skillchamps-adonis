'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventUserSchema extends Schema {
  up () {
    this.create('event_users', (table) => { // TABELA DE ADMINS / ADMINISTRADORES 
      table.increments()
      table.integer('user_id') // FK
      table.integer('event_id') // FK
      table.timestamps()
    })
  }

  down () {
    this.drop('event_users')
  }
}

module.exports = EventUserSchema
