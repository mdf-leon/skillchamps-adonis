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

class InstituteController {

    index() {
        return { response: "Hello World" };
    }

    async makeInstitute({ request, response, auth }) {
        const entityData = request.only([
            'fed_tax_ido',
            'subd_tax_ido',
            'city_tax_ido',
        ]);
        const entity = await Entity.create(entityData) // criei a entity

        const user = await auth.getUser()

        await Database.transaction(async (trx) => {
            let instituteData = request.only([
                'name',
            ]);

            // return response.send(await user.toJSON())
            instituteData = { ...instituteData, entity_id: entity.id, user_id: user.id }

            const institute = await Institute.create(instituteData)

            // rider.Entity().attach()
            return response.json({ success: "Institute created successfully", institute });
        }).catch((e) => {
            entity.delete()
            //console.log(e)
            return response.status(401).json({ Error: e.sqlMessage })
        })
    }

    async showInstitute({ request, response, auth }) {
        let user = await auth.getUser()
        let institute = await user.institute().fetch()
        if (institute == null) {
            return response.status(400).send({ Error: 'error', message: 'Institute doesnt exist' })
        }
        let entity = await institute.entity().fetch()
        if (entity == null) {
            return response.status(400).send({ Error: 'error', message: 'Entity doesnt exist' })
        } else {
            entity = entity.toJSON()
            delete entity.name
            let eid = entity.id
            delete entity.id
            institute = institute.toJSON()
            return response.send({ ...institute, entity_id: eid, ...entity,  })
        }
    }

    async OLDinstitutesList({ request, response, auth }) {
        let institutes = await Institute.all()

        const query = request.get()
        // return response.send(query)

        if (!query.column || !query.value) {
            institutes = await Institute.query()
                .paginate(query.page, query.limit)
            return response.send(institutes)
        }

        institutes = await Institute.query()
            .where(query.column, 'LIKE', '%' + query.value + '%')
            .paginate(query.page, query.limit)
        // .fetch()
        // SELECT name, id FROM institutes
        // institutes = institutes.toJSON()
        // delete institutes.user_id
        // delete institutes.entity_id
        return response.send(institutes)
    }

    async institutesList({ request, response, auth }) {
        let institutes = await Institute.all()
        return response.send(institutes)
    }

   
}

module.exports = InstituteController