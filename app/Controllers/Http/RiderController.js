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

class RiderController {

    async index() {
        return await Rider.all()
    }


    async showRider({ request, response, auth }) {
        let user = await auth.getUser()
        let rider = await user.rider().fetch()
        if (rider == null) {
            return response.status(400).send({ Error: 'error', message: 'Rider doesnt exist' })
        } else {
            return response.send(rider)
        }
    }

    async deleteRider({ request, response, params }) {

        let rider = await Rider.findOrFail(params.rider_id)
         await Database
            .table('event_rider')
            .where('rider_id', params.rider_id)
            .delete()
        if (await rider.delete()) {
            return response.send({ deleted: rider })
        } return response.status(500).send({ message: 'something went wrong' })
    }

    async makeRider({ request, response, auth }) {
        const entityData = request.only([
            'fed_tax_ido',
            'subd_tax_ido',
            'city_tax_ido',
        ]);
        const entity = await Entity.create(entityData) // criei a entity

        await Database.transaction(async (trx) => {
            let riderData = request.only([
                'name',
                'date_of_birth',
                'motorcycle',
                'motorcycle_plate',
                'license_ido'
            ]);
            const user = await auth.getUser()
            //return response.send(user.id)
            riderData = { ...riderData, entity_id: entity.id, user_id: user.id }

            const rider = await Rider.create(riderData)

            // rider.Entity().attach()
            return response.json({ success: "Rider created successfully" });
        }).catch((e) => {
            entity.delete()
            //console.log(e)
            return response.status(401).json({ Error: e.sqlMessage })
        })
    }

}

module.exports = RiderController
