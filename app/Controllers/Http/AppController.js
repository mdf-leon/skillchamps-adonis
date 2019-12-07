'use strict'

const User = use('App/Models/User')
const Entity = use('App/Models/Entity')
const EntityTag = use('App/Models/EntityTag')
const Database = use('Database')

class AppController {
    index() {
        return "foxa";
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
