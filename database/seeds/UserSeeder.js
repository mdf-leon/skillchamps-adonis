'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const User = use('App/Models/User')
const Rider = use('App/Models/Rider')
const Entity = use('App/Models/Entity')
const Event = use('App/Models/Event')
const Institute = use('App/Models/Institute')
const Database = use('Database')
const Factory = use('Factory')

class UserSeeder {
  async run() {
    const user0 = await User.create({ email: 'a@b.c', password: 'x', name: 'John Wheelies' });
    const usersArray = await Factory
      .model('App/Models/User')
      .createMany(100)
    // console.log(usersArray)
    console.log("usersArray created successfully, step 1 of ")
    let users = await User.all()
    users = users.toJSON()
    for (let user of users) {

      if (user.id != 1) {
        const rider = await Factory
          .model('App/Models/Rider')
          .make()

        const institute = await Factory
          .model('App/Models/Institute')
          .make()

        const entityData = {
          fed_tax_ido: institute.fed_tax_ido,
          subd_tax_ido: institute.subd_tax_ido,
          city_tax_ido: institute.city_tax_ido
        }

        const entity = await Entity.create(entityData)

        const riderData = {
          name: rider.name,
          date_of_birth: rider.date_of_birth,
          motorcycle: rider.motorcycle,
          motorcycle_plate: rider.motorcycle_plate,
          license_ido: rider.license_ido
        }

        let res = await Rider.create({ ...riderData, name: user.name, user_id: user.id, entity_id: entity.id, })
        console.log("created rider: "+ res.id + " for entity: " + entity.id + '(out of 100) step 2 of ')
      }
    }

    const institutes = await Factory
      .model('App/Models/Institute')
      .makeMany(100)
    console.log('institutes made successfully, step 3 of 5')
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
        let instituteData = { name: institute.name }

        // const user = await auth.getUser()
        instituteData = { ...instituteData, entity_id: entity.id, user_id: useri }

        const institutee = await Institute.create(instituteData)
        console.log('institute created on id: '+institutee.id+'(out of 100) step 4 of 5')

      }).catch((e) => {
        console.log('on catch 88')
        entity.delete()
      })
      useri += 1
    }

    for (let i = 0; i < 120; i++) {
      const event = await Factory
        .model('App/Models/Event')
        .make()
      const eventData = {
        event_name: event.event_name,
        date_begin: event.date_begin
      }
      let res = await Event.create({ ...eventData, institute_id: 5 })
      console.log('event created on id: '+res.id+ '(out of 120) step 5 of 5 ')
    }

  }
}

module.exports = UserSeeder
