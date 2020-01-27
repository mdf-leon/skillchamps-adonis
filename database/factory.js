'use strict'
const Factory = use('Factory')
const Hash = use('Hash')

Factory.blueprint('App/Models/User', async (faker) => {
    return {
        name: faker.username(),
        email: faker.email(),
        password: await Hash.make(faker.password())
    }
})

Factory.blueprint('App/Models/Institute', async (faker) => {
    return {
        fed_tax_ido: faker.integer({ min: 9999, max: 99999999 }),
        subd_tax_ido: faker.integer({ min: 9999, max: 99999999 }),
        city_tax_ido: faker.integer({ min: 9999, max: 99999999 }),
        name: faker.city() + ' P.D.'
    }
})

Factory.blueprint('App/Models/Rider', async (faker) => {
    return {
        name: faker.city(),
        date_of_birth: faker.birthday(),
        motorcycle: faker.integer({ min: 9999, max: 999999 }),
        motorcycle_plate: faker.integer({ min: 9999, max: 999999 }),
        license_ido: faker.integer({ min: 9999, max: 999999 })
    }
})
/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
// const Factory = use('Factory')

// Factory.blueprint('App/Models/User', (faker) => {
//   return {
//     username: faker.username()
//   }
// })
