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
const Factory = use('Factory')

class UserSeeder {
  async run () {
    const user0 = await User.create({email: 'a@b.c', password: 'x', name: 'John Wheelies'});
    const usersArray = await Factory
    .model('App/Models/User')
    .createMany(100)

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

        await Rider.create({ ...riderData, name: user.name, user_id: user.id, entity_id: entity.id, })
      }

    }

  }
}

module.exports = UserSeeder
