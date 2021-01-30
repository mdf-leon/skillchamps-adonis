'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NotificationSchema extends Schema {
  up () {
    this.create('notifications', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users') // FK
      table.integer('event_id').unsigned().references('id').inTable('events') // FK
      table.integer('institute_id').unsigned().references('id').inTable('institutes') // FK
      table.string('type')
      table.string('subject')
      table.string('title')
      table.string('message')
      table.timestamps()
    })
  }

  down () {
    this.drop('notifications')
  }
}

module.exports = NotificationSchema
