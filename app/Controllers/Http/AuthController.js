'use strict'

const Database = use('Database')

const User = use('App/Models/User');
const Rider = use('App/Models/Rider')
const Event = use('App/Models/Event')
const Token = use('App/Models/Token')

class AuthController {

    async register({ request, response }) {

        await Database.transaction(async (trx) => {
            const data = await request.only(['name', 'email', 'password']);
            const rpw = await request.only(['r_password'])
            if (data.password == rpw.r_password) {
                let user = await User.create(data);
                user = user.toJSON();
                delete user.password;
                return response.json(user);
            } else {
                return response.status(401).json({ Error: 'Passwords do not match' })
            }

        }).catch((e) => {
            console.log(e.sqlMessage)
            return response.status(401).json({ Error: e.sqlMessage })
        })

    }



    async authenticate({ request, auth }) {
        const { email, password } = request.all();

        const token = await auth.attempt(email, password);
        return token
        // const tok = await Token.findOrFail(token.id);
        // return tok
        // const user = await tok.user().fetch()
        // return {...token, user: {...user}};
    }

    // async registerRider({ request, response }) {

    // }

}

module.exports = AuthController

