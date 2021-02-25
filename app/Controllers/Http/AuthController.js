'use strict'

const Database = use('Database')

const User = use('App/Models/User');
const Rider = use('App/Models/Rider')
const Event = use('App/Models/Event')
const Notification = use('App/Models/Notification')
const Institute = use('App/Models/Institute')
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
                return response.status(400).json({ Error: 'Passwords do not match' })
            }

        }).catch((e) => {
            return response.status(500).json({ Error: e.sqlMessage, stack: e.stack, trace: e.trace, msg: e.message })
        })

    }



    async authenticate({ request, auth }) {
        const { email, password } = request.all();

        const token = await auth.attempt(email, password);
        if (token) {
            const user = await User.findByOrFail({ email })
            const events = await user.eventsOnManagement().fetch()
            const institute = await user.institute().fetch()
            const userInfo = { id: user.id, email: user.email }
            const rider = await user.rider().fetch()
            return { ...token, user: userInfo, rider, eventsOnManagement: events, institute }
        }
        //retorna o erro do token
        return token
        // const tok = await Token.findOrFail(token.id);
        // // return tok
        // const user = await tok.user().fetch()
        // return {...token, user: {...user}};
    }

    async notifications({ request, auth }) {
        let notes = []
        if (request.all().institute_id)
            notes = (await Institute.findOrFail(request.all().institute_id))
                .notifications().fetch()
        else if (request.all().event_id)
            notes = (await Event.findOrFail(request.all().event_id))
                .notifications().fetch()
        else if (request.all().user_id)
            notes = (await User.findOrFail(request.all().user_id))
                .notifications().fetch()
        else
            notes = (await auth.getUser()).notifications().fetch()
        return notes.toJSON().reverse()
    }

    async instituteNotifications({ request, auth }) {

    }

    // async registerRider({ request, response }) {

    // }

}

module.exports = AuthController

