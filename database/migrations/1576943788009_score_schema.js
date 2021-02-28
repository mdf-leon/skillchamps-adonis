'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScoreSchema extends Schema {
  up () {
    this.create('scores', (table) => {
      table.increments()
      table.integer('rider_id').unsigned().references('id').inTable('riders') // FK
      table.integer('trial_id').unsigned().references('id').inTable('trials') // FK
      table.integer('time').unsigned()
      table.integer('time_total').unsigned() // if trial.boolean will have score on schore=1, score=0 is false
      table.timestamps()
    })
  }

  down () {
    this.drop('scores')
  }
}

module.exports = ScoreSchema
