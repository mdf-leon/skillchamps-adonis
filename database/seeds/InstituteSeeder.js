'use strict'

/*
|--------------------------------------------------------------------------
| InstituteSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Database = use('Database')
const Entity = use('App/Models/Entity')
const Institute = use('App/Models/Institute')
const Factory = use('Factory')

class InstituteSeeder {
  async run() {
    const institutes = await Factory
      .model('App/Models/Institute')
      .makeMany(100)
    // console.log(institutes.toJSON())
    let useri = 2
    for (let institute of institutes) {
      // console.log(institute)
      const entityData = {
        fed_tax_ido: institute.fed_tax_ido,
        subd_tax_ido: institute.subd_tax_ido,
        city_tax_ido: institute.city_tax_ido
      }
      // console.log(entityData)
      const entity = await Entity.create(entityData) // criei a entity

      await Database.transaction(async (trx) => {
        let instituteData = {name: institute.name}

        // const user = await auth.getUser()
        instituteData = { ...instituteData, entity_id: entity.id, user_id: useri }

        const institutee = await Institute.create(instituteData)
        // console.log(institutee)

      }).catch((e) => {
        entity.delete()
      })
      useri += 1
    }



  }
}

module.exports = InstituteSeeder
