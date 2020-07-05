'use strict'
const Entity = use('App/Models/Entity')
const User = use('App/Models/User')

class UserController {

    async index() {
        return await User.all()
    }

    async showInfo({ request, response, params, auth }) { // this could be get()... but isn't rn;
        let toReturn = {}
        //const { id } = params;
        toReturn = {
            user: await User.find(auth.user.id),//
        } //entity_attachd: toReturn.user.entities().fetch()
        try {
            const entity_attachd = await toReturn.user.entities().fetch()
            toReturn = {
                ...toReturn,
                entity_attachd: entity_attachd ? entity_attachd : false
            }
        } catch(e){ 
            toReturn = await {
                ...toReturn,
                entity_attachd: false
            }
        }
        return toReturn
    }

    async showUser({ request, response, auth }) {
        let user = await auth.getUser()
        if(user == null){
            return response.status(400).send({Error: 'error', message: 'empty JSON'})
        } else {
            user = user.toJSON()
            delete user.password
            return response.send(user)
        }
    }

}

module.exports = UserController
