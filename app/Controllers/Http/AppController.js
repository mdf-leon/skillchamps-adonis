'use strict'

const User = use('App/Models/User')
const Rider = use('App/Models/Rider')
const Institute = use('App/Models/Institute')
const Entity = use('App/Models/Entity')
const Event = use('App/Models/Event')
//const EntityTag = use('App/Models/EntityTag')
const Database = use('Database')

class AppController {

    index() {
        return { response: "Hello World" };
    }

    async signToEvent({ request, response, auth }) {

        const data = request.only('rider_id');

        await Database.transaction(async (trx) => {
            const rider = await Rider.findOrFail(data.rider_id)
            const user = await auth.getUser()
            const institute = await user.institute().fetch()
            const event = await institute.events().where('id', 2).first()
            //const event = await Event.find(2)
            console.log(rider)
            if (await event.riders().where('rider_id', data.rider_id).first()) {
                return response.status(401).json({ Error: "Ja existe" })
            } else {
                await event.riders().attach(data.rider_id)
                return response.json(rider)
            }

            //await event.riders().attach(data.rider_id)
            return response.json(rider)
        }).catch((e) => {
            console.log(e)
            return response.status(401).json({ 
                Error: e, ErrorSQL: e.sqlMessage,
                ErrorMSG: "Provavelmente o Rider não existe."
             })
        })

    }

    async createEvent({ request, response, auth }) {
        const eventData = request.only([
            'event_name', //event name
            'date_begin',
            //'date_end',
        ]);

        //const event = {}

        await Database.transaction(async (trx) => {

            const user = await auth.getUser()
            const institute = await user.institute().fetch()
            const event = await Event.create({ ...eventData, institute_id: institute.id })

            return response.json(event)

        }).catch((e) => {
            console.log(eventData)
            return response.status(401).json({ Error: e.sqlMessage })
        })


    }

    async makeInstitute({ request, response, auth }) {
        const entityData = request.only([
            'fed_tax_ido',
            'subd_tax_ido',
            'city_tax_ido',
        ]);
        const entity = await Entity.create(entityData) // criei a entity

        await Database.transaction(async (trx) => {
            let instituteData = request.only([
                'name',
            ]);

            const user = await auth.getUser()
            //return response.send(user.id)
            instituteData = { ...instituteData, entity_id: entity.id, user_id: user.id }

            const institute = await Institute.create(instituteData)

            // rider.Entity().attach()
            return response.json({ success: "Institute created successfully" });
        }).catch((e) => {
            entity.delete()
            //console.log(e)
            return response.status(401).json({ Error: e.sqlMessage })
        })
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

    async test1({ request, response, auth }) {
        const user = await auth.getUser()
        const rider = await user.rider().fetch()
        return await rider.entity().fetch()
    }

    async check({ request, response, auth }) {
        return await auth.check()
    }

    async attachToEntity({ request, response }) {
        const data = request.only(['id_e', 'id_u'])
        const entity = await Entity.find(data.id_e)
        //const test = await entity.users()
        //.where({user_id: data.id_u, entity_id: data.id_e}) 
        //
        const link = await Database.table('entity_user')
            .where({ "user_id": data.id_u, "entity_id": data.id_e })
            .limit(1)

        if (!link[0]) {
            const r = await entity.users().attach([data.id_u])
        }
        return await entity.users().fetch()
        //return link
    }

    async createEntity({ request, response }) {
        /*

        estrutura do json:
        { 
            name: nome,
            ...
            active: 0,
            tags:[{"tag": "t1"},{"tag": "t2"}]
        }

        */
        const data = request.only([
            'name',
            'federal_tax_id',
            'subdivision_tax_id',
            'city_tax_id',
            'postal_code',
            'street1',
            'street2',
            'city_id',
            'subdivision_id',
            'country_id',
            'active',
        ])
        const tags = request.only(['tags'])
        console.log(tags)

        let entity = await Entity.create(data)
        await tags.tags.forEach((element, index) => {
            //EntityTag.create({ entity_id: entity.id, tag: element })
            entity.entitytag().create(element)
            //console.log(element)
        });
        // tags.forEach((element, index) => {
        //     entity.tags().attach([element[index]])
        // });
        entity['tags'] = await entity.entitytag().fetch()
        return await entity
    }
}

module.exports = AppController
