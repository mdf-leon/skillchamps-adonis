'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Rider extends Model {

    users () {
        return this.hasOne('App/Models/User')
        //.pivotTable('user_entity')
    }

    entity () {
        return this.hasOne('App/Models/Entity')
        //.pivotTable('user_entity')
    }

}

module.exports = Rider
