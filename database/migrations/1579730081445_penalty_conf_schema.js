'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PenaltyConfSchema extends Schema {
  up () {
    this.create('penalty_confs', (table) => {
      table.increments()
      table.integer('trial_id') // FK
      table.string('name')
      table.string('description') 
      table.integer('time_penalty')
      table.integer('point_penalty') // points to be decreased from total points
    })
  }

  down () {
    this.drop('penalty_confs')
  }
}

module.exports = PenaltyConfSchema
