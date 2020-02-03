'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventUserSchema extends Schema {
  up () {
    this.create('event_user', (table) => { // TABELA DE ADMINS / ADMINISTRADORES 
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users') // FK
      table.integer('event_id').unsigned().references('id').inTable('events') // FK
      table.timestamps()
    })
  }

  down () {
    this.drop('event_user')
  }
}

module.exports = EventUserSchema
