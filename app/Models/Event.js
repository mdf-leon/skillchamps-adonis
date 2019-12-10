'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Event extends Model {
  
  trials() {
    return this.hasMany('App/Models/Trial')
  }

  // addresses

  riders() {
    return this.belongsToMany('App/Models/Rider')
  }

  admins() {
    return this.belongsToMany('App/Models/User')
  }

}

module.exports = Event
