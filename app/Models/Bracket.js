'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Bracket extends Model {
  trial() {
    return this.belongsTo('App/Models/Trial')
  }
}

module.exports = Bracket
