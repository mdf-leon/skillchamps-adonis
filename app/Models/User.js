'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

const Entity = use('App/Models/Entity')

class User extends Model {
  static boot() {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  // padroes do adonis

  tokens() {
    return this.hasMany('App/Models/Token')
  }



  // custom code

  rider() {
    return this.hasOne('App/Models/Rider')
  }

  institute() {
    return this.hasOne('App/Models/Institute')
  }

  eventsOnManagement() { // eventos que este usuario controla/gerencia
    return this.belongsToMany('App/Models/Event')
  }

}

module.exports = User
