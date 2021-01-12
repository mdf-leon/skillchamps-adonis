'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class History extends Model {

  institute() {
    return this.belongsTo('App/Models/Event')
  }

}

module.exports = History
