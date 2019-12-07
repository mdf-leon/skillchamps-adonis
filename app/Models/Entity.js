'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Entity extends Model {
    
    rider() {
        return this.hasOne('App/Models/Rider')
    }

    institute() {
        return this.hasOne('App/Models/Institute')
    }

    // entitytag () {
    //     return this.hasMany('App/Models/EntityTag')
    // }
    // showUsers(){
    //     return this.loadMany()
    // }

    //create({request,response,view}) {}
}

module.exports = Entity
