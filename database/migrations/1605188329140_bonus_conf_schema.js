'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BonusConfSchema extends Schema {
  up () {
    this.create('bonus_confs', (table) => {
      table.increments()
      table.integer('trial_id').unsigned().references('id').inTable('trials') // FK
      table.string('name')
      table.string('description') 
      table.integer('time_bonus')
      table.integer('point_bonus')
    })
  }

  down () {
    this.drop('bonus_confs')
  }
}

module.exports = BonusConfSchema
