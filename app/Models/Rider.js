'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Rider extends Model {

  users() {
    return this.belongsTo('App/Models/User')
    //.pivotTable('user_entity')
  }

  entity() {
    return this.belongsTo('App/Models/Entity')
    //.pivotTable('user_entity')
  }

  events() {
    return this.belongsToMany('App/Models/Event')
  }

  scores() {
    return this.hasMany('App/Models/Score')
  }

}

module.exports = Rider
