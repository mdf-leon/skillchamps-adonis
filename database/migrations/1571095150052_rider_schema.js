'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RiderSchema extends Schema {
  up () {
    this.create('riders', (table) => {
      table.increments()

      //table.integer('entities_id').references('entities.id')
      //table.integer('entity_id').notNullable().unsigned().
      //references('entities.id').onDelete('cascade').index('entity_id')
      table.string('age')
      table.date('date_of_birth')
      //table.integer('categories_id').references('categories.id')
      //table.integer('category_id').notNullable().unsigned().
      //references('categories.id').onDelete('cascade').index('category_id')
      table.string('motorcycle') // description
      table.string('motorcycle_plate')
      table.string('license_ido')
      //table.string('id_number').unique() // numero ou str?
      
      table.integer('user_id') // FK
      table.integer('entity_id') // FK

      table.boolean('active'); // UK??

      table.timestamps()
    })
  }

  down () {
    this.drop('riders')
  }
}

module.exports = RiderSchema
