'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Institute extends Model {

    user(){
        return this.belongsTo('App/Models/User')
    }

    entity(){
        return this.belongsTo('App/Models/Entity')
    }

    event(){
        return this.hasOne('App/Models/Event')
    }
    
}

module.exports = Institute
