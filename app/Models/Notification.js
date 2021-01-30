'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Notification extends Model {
    institute() {
        return this.belongsTo('App/Models/Institute')
    }

    user() {
        return this.belongsTo('App/Models/User')
    }

    event() {
        return this.belongsTo('App/Models/Event')
    }
}

module.exports = Notification
