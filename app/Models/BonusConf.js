'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class BonusConf extends Model {
    trial() {
        return this.belongsTo('App/Models/Trial')
    }

    bonus() {
        return this.hasMany('App/Models/Bonus')
    }

    static get createdAtColumn() {
        return null
    }

    static get updatedAtColumn() {
        return null
    }
}

module.exports = BonusConf
