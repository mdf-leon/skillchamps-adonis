'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ImagesSchema extends Schema {
  up () {
    this.create('images', (table) => {
      table.increments()
      table.text('b64').nullable()
    })
  }

  down () {
    this.drop('images')
  }
}

module.exports = ImagesSchema
