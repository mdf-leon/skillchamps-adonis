'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HistorySchema extends Schema {
  up () {
    this.create('histories', (table) => {
      table.increments()
      table.integer('event_id').unique().notNullable().unsigned().references('id').inTable('events') // FK
      table.string('podium') // array with [{id: 572, name: John Wheelies, podium: 1}] from first to last place
      table.string('config').notNullable() // events_requests, exemplo no fim do arquivo
      table.timestamps()
    })
  }

  down () {
    this.drop('histories')
  }
}

module.exports = HistorySchema

// table.string('config') // events_requests
// {
// 	"events_request": [
// 		{
// 			"event_id": 9,
// 			"category": "beginners",
// 			"trial_id": 16
// 		},
// 		{
// 			"event_id": 9,
// 			"category": "expert",
// 			"trial_id": 16
			
// 		},
// 		{
// 			"event_id": 9,
// 			"category": "advanced",
// 			"trial_id": 16
// 		},
// 		{
// 			"event_id": 9,
// 			"category2": "civil",
// 			"trial_id": 15
// 		},
// 		{
// 			"event_id": 9,
// 			"category2": "police",
// 			"trial_id": 15
// 		},
// 		{
// 			"event_id": 9,
// 			"category": "null",
// 			"trial_id": 17
// 		},
// 		{
// 			"event_id": 9,
// 			"category": "null",
// 			"trial_id": 18
// 		}
// 	]
// }