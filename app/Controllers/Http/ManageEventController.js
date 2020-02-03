'use strict'

const User = use('App/Models/User')
const Rider = use('App/Models/Rider')
const Institute = use('App/Models/Institute')
const Entity = use('App/Models/Entity')
const Event = use('App/Models/Event')
const Trial = use('App/Models/Trial')
const PenaltyConf = use('App/Models/PenaltyConf')
const Score = use('App/Models/Score')
const Penalty = use('App/Models/Penalty')
//const EntityTag = use('App/Models/EntityTag')
const Database = use('Database')

class ManageEventController {

    async managedEventsList({ request, response, auth }) {
        //assumo que o evento está acontecendo
        //esta rota apenas procura as trials do admin
        let user = await auth.getUser()
        let institute = await user.institute().fetch()
        let events = await institute.events().fetch()
        return response.send(events)
    }

    async managedTrialsList({ request, response, auth }) {

        const query = request.get()

        let user = await auth.getUser()
        let institute = await user.institute().fetch()
        // let event = await Event.findOrFail(query.event_id)
        let events = await institute.events().fetch()
        events = events.toJSON()
        for(let event of events){
            if(event.id == query.event_id){

                let eventTemp = await Event.findOrFail(query.event_id)
                let trials = await eventTemp.trials().fetch()

                return response.send(trials)
            }
        }
        return response.status(500).send({ Erro: 'Bad request: Could you be asking for an event thats not yours?' })

        // return event
    }

    async managedRidersList({ request, response, auth }) {
        // lista de riders de um evento, por enquanto
        // teoricamente cada prova pode ter um competidor diferente da outra
        // mas aqui você escolhe o corredor que vai participar da prova X
        // se ele não for correr, basta não selecionar/pontuar o corredor
        // portanto lista-se os corredores inscritos num evento, selecionar uma prova anteriormente
        // na tela de gerencia apenas significa que você escolheu uma prova e um corredor para enviar para
        // este endpoit e ser processado.

        const query = request.get()

        let user = await auth.getUser()
        let institute = await user.institute().fetch()
        // let event = await Event.findOrFail(query.event_id)
        let events = await institute.events().fetch()
        events = events.toJSON()
        let eventOne;
        for(let event of events){
            if(event.id == query.event_id){
                eventOne = await Event.findOrFail(query.event_id)
            }
        }
        if (!eventOne) return response.status(500).send({Erro: "Unknown event"})

        let riders = await eventOne.riders().fetch()

        if(!riders) return response.status(500).send({Erro: "There are no riders on here, populate this wasteland"})

        return response.send(riders)

    }

}

module.exports = ManageEventController
