'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PenaltyConf extends Model {
    trial() {
        return this.belongsTo('App/Models/Trial')
    }

    penalty() {
        return this.hasMany('App/Models/Penalty')
    }

    static get createdAtColumn() {
        return null
    }

    static get updatedAtColumn() {
        return null
    }
}

module.exports = PenaltyConf
