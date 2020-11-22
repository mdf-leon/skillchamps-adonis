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

class AppController {

    index() {
        return { response: "Hello World" };
    }

    async test1({ request, response, auth }) {
        const user = await auth.getUser()
        const rider = await user.rider().fetch()
        return await rider.entity().fetch()
    }

    async check({ request, response, auth }) {
        return await auth.getUser()
    }

    // legacy code
    legacy() {
        // async attachToEntity({ request, response }) {
        //     const data = request.only(['id_e', 'id_u'])
        //     const entity = await Entity.find(data.id_e)
        //     //const test = await entity.users()
        //     //.where({user_id: data.id_u, entity_id: data.id_e}) 
        //     //
        //     const link = await Database.table('entity_user')
        //         .where({ "user_id": data.id_u, "entity_id": data.id_e })
        //         .limit(1)

        //     if (!link[0]) {
        //         const r = await entity.users().attach([data.id_u])
        //     }
        //     return await entity.users().fetch()
        //     //return link
        // }

        // async createEntity({ request, response }) {
        //     /*

        //     estrutura do json:
        //     { 
        //         name: nome,
        //         ...
        //         active: 0,
        //         tags:[{"tag": "t1"},{"tag": "t2"}]
        //     }

        //     */
        //     const data = request.only([
        //         'name',
        //         'federal_tax_id',
        //         'subdivision_tax_id',
        //         'city_tax_id',
        //         'postal_code',
        //         'street1',
        //         'street2',
        //         'city_id',
        //         'subdivision_id',
        //         'country_id',
        //         'active',
        //     ])
        //     const tags = request.only(['tags'])
        //     console.log(tags)

        //     let entity = await Entity.create(data)
        //     await tags.tags.forEach((element, index) => {
        //         //EntityTag.create({ entity_id: entity.id, tag: element })
        //         entity.entitytag().create(element)
        //         //console.log(element)
        //     });
        //     // tags.forEach((element, index) => {
        //     //     entity.tags().attach([element[index]])
        //     // });
        //     entity['tags'] = await entity.entitytag().fetch()
        //     return await entity
        // }
        // async addScore({ request, response, auth }) {
        //     const data = request.only([
        //         'rider_id',
        //         'trial_id',
        //         'penalties',
        //         'time',
        //     ]);

        //     let res = await Score.create({
        //         rider_id: data.rider_id, trial_id: data.trial_id, time: data.time
        //     })

        //     let pens = []

        //     for (let penalty of data.penalties) {
        //         pens.push(await Penalty.create({ ...penalty, score_id: res.id }))
        //     }

        //     res = res.toJSON()
        //     return response.json({ ...res, penalties: [...pens] })
        // }

        // async createTrial({ request, response, auth }) {
        //     const data = request.only([
        //         'name',
        //         'event_id',
        //         'penalties'
        //     ]);

        //     let res = await Trial.create({ name: data.name, event_id: data.event_id })

        //     let pens = []

        //     for (let penalty of data.penalties) {
        //         pens.push(await PenaltyConf.create({ ...penalty, trial_id: res.id }))
        //     }

        //     res = res.toJSON()

        //     return response.json({ ...res, penalties: [...pens] })
        // }

        // async eventsSigned({ request, response, auth }) {

        //     let user = await auth.getUser()
        //     let rider = await user.rider().fetch()
        //     // let eventss = await rider.events().fetch()
        //     // return response.send(events)

        //     // let events = await Event.all()

        //     const query = request.get()

        //     if (!query.column || !query.value) {
        //         let events = await Database.select('*').from('event_rider')
        //             .where('rider_id', 'LIKE', rider.id)
        //             .innerJoin('events', 'event_rider.event_id', 'events.id')
        //             .paginate(query.page, query.limit)
        //         return response.send(events)
        //     }

        //     let events = await Database.select('*').from('event_rider')
        //         .where('rider_id', 'LIKE', rider.id)
        //         .innerJoin('events', 'event_rider.event_id', 'events.id')
        //         .where('events.'+query.column, 'LIKE', '%' + query.value + '%')
        //         // .whereRaw(query.column + ' LIKE ' + '%' + query.value + '%' 
        //         // + ' AND rider_id LIKE ' + rider.id)
        //         .paginate(query.page, query.limit)
        //     return response.send(events)
        // }

        // async eventsList({ request, response, auth }) {
        //     let events = await Event.all()

        //     const query = request.get()

        //     if (!query.column || !query.value) {
        //         events = await Event.query()
        //             .paginate(query.page, query.limit)
        //         return response.send(events)
        //     }

        //     events = await Event.query()
        //         .where(query.column, 'LIKE', '%' + query.value + '%')
        //         .paginate(query.page, query.limit)
        //     return response.send(events)
        // }

        // async signToEvent({ request, response, auth }) {

        //     const data = request.only(['rider_id', 'event_id']);
        //     // return response.send(request.only('event_id'))
        //     await Database.transaction(async (trx) => {
        //         const rider = await Rider.findOrFail(data.rider_id)
        //         const user = await auth.getUser()
        //         // const institute = await user.institute().fetch()
        //         // const event = await institute.events().where('id', data.event_id).first()
        //         const event = await Event.findOrFail(data.event_id)

        //         //const event = await Event.find(2)
        //         if (await event.riders().where('rider_id', data.rider_id).first()) {
        //             return response.status(401).json({ Error: "Ja existe" })
        //         } else {
        //             await event.riders().attach(data.rider_id)
        //             return response.json(rider)
        //         }

        //         //await event.riders().attach(data.rider_id)
        //         return response.json(rider)
        //     }).catch((e) => {
        //         // console.log(e)
        //         return response.status(401).json({
        //             Error: e, ErrorSQL: e.sqlMessage,
        //             ErrorMSG: "Provavelmente o Rider não existe."
        //         })
        //     })

        // }

        // async showEvent({ request, response, auth }) {
        //     let user = await auth.getUser()
        //     let institute = await user.institute().fetch()
        //     let events = await institute.events().fetch()
        //     // console.log(events)
        //     return response.send(events)
        // }

        // async createEvent({ request, response, auth }) {
        //     const eventData = request.only([
        //         'event_name', //event name
        //         'date_begin',
        //         //'date_end',
        //     ]);

        //     //const event = {}

        //     await Database.transaction(async (trx) => {

        //         const user = await auth.getUser()
        //         const institute = await user.institute().fetch()
        //         console.log(institute.id)
        //         const event = await Event.create({ ...eventData, institute_id: institute.id })

        //         return response.json(event)

        //     }).catch((e) => {
        //         console.log(eventData)
        //         return response.status(401).json({ Error: e.sqlMessage })
        //     })


        // }

        // async makeInstitute({ request, response, auth }) {
        //     const entityData = request.only([
        //         'fed_tax_ido',
        //         'subd_tax_ido',
        //         'city_tax_ido',
        //     ]);
        //     const entity = await Entity.create(entityData) // criei a entity

        //     const user = await auth.getUser()

        //     await Database.transaction(async (trx) => {
        //         let instituteData = request.only([
        //             'name',
        //         ]);

        //         // return response.send(await user.toJSON())
        //         instituteData = { ...instituteData, entity_id: entity.id, user_id: user.id }

        //         const institute = await Institute.create(instituteData)

        //         // rider.Entity().attach()
        //         return response.json({ success: "Institute created successfully" });
        //     }).catch((e) => {
        //         entity.delete()
        //         //console.log(e)
        //         return response.status(401).json({ Error: e.sqlMessage })
        //     })
        // }

        // async showInstitute({ request, response, auth }) {
        //     let user = await auth.getUser()
        //     let institute = await user.institute().fetch()
        //     if (institute == null) {
        //         return response.status(400).send({ Error: 'error', message: 'Institute doesnt exist' })
        //     }
        //     let entity = await institute.entity().fetch()
        //     if (entity == null) {
        //         return response.status(400).send({ Error: 'error', message: 'Entity doesnt exist' })
        //     } else {
        //         entity = entity.toJSON()
        //         delete entity.name
        //         let eid = entity.id
        //         delete entity.id
        //         institute = institute.toJSON()
        //         return response.send({ ...institute, entity_id: eid, ...entity,  })
        //     }
        // }

        // async institutesList({ request, response, auth }) {
        //     let institutes = await Institute.all()

        //     const query = request.get()
        //     // return response.send(query)

        //     if (!query.column || !query.value) {
        //         institutes = await Institute.query()
        //             .paginate(query.page, query.limit)
        //         return response.send(institutes)
        //     }

        //     institutes = await Institute.query()
        //         .where(query.column, 'LIKE', '%' + query.value + '%')
        //         .paginate(query.page, query.limit)
        //     // .fetch()
        //     // SELECT name, id FROM institutes
        //     // institutes = institutes.toJSON()
        //     // delete institutes.user_id
        //     // delete institutes.entity_id
        //     return response.send(institutes)
        // }

        // async showRider({ request, response, auth }) {
        //     let user = await auth.getUser()
        //     let rider = await user.rider().fetch()
        //     if (rider == null) {
        //         return response.status(400).send({ Error: 'error', message: 'Rider doesnt exist' })
        //     } else {
        //         return response.send(rider)
        //     }
        // }

        // async makeRider({ request, response, auth }) {
        //     const entityData = request.only([
        //         'fed_tax_ido',
        //         'subd_tax_ido',
        //         'city_tax_ido',
        //     ]);
        //     const entity = await Entity.create(entityData) // criei a entity

        //     await Database.transaction(async (trx) => {
        //         let riderData = request.only([
        //             'name',
        //             'date_of_birth',
        //             'motorcycle',
        //             'motorcycle_plate',
        //             'license_ido'
        //         ]);
        //         const user = await auth.getUser()
        //         //return response.send(user.id)
        //         riderData = { ...riderData, entity_id: entity.id, user_id: user.id }

        //         const rider = await Rider.create(riderData)

        //         // rider.Entity().attach()
        //         return response.json({ success: "Rider created successfully" });
        //     }).catch((e) => {
        //         entity.delete()
        //         //console.log(e)
        //         return response.status(401).json({ Error: e.sqlMessage })
        //     })
        // }
    }
}

module.exports = AppController
