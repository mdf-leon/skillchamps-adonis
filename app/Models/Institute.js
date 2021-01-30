'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Institute extends Model {

    user() {
        return this.belongsTo('App/Models/User')
    }

    notifications() {
        return this.hasMany('App/Models/Notification')
    }

    entity() {
        return this.belongsTo('App/Models/Entity')
    }

    events() {
        return this.hasMany('App/Models/Event')
    }

}

module.exports = Institute
