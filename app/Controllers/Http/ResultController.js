'use strict'

const User = use('App/Models/User')
const Rider = use('App/Models/Rider')
const Institute = use('App/Models/Institute')
const Entity = use('App/Models/Entity')
const Event = use('App/Models/Event')
const Trial = use('App/Models/Trial')
const PenaltyConf = use('App/Models/PenaltyConf')
const Score = use('App/Models/Score')
const Penalty = use('App/Models/Penalty')
//const EntityTag = use('App/Models/EntityTag')
const Database = use('Database')
const { qFilter } = use('App/Tools/Set');

class ResultController {

	async index({ auth, request, response, params }) {
		let { column, direction, ...filters } = request.get()
		const establishment = await auth.user.establishments()
			.where('establishments.id', params.store_id).firstOrFail();
		let query = Database.table('receipts');
		query = query.where('establishment_id', establishment.id)
		query = qFilter(query, filters) // filtro
		query = query.orderBy(column || 'id', direction || 'ASC') // ordenaçao
		return await query
	}
	
}

module.exports = ResultController
