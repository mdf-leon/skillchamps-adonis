"use strict";

const Database = use("Database");

const User = use("App/Models/User");
const Rider = use("App/Models/Rider");
const Event = use("App/Models/Event");
const Notification = use("App/Models/Notification");
const Institute = use("App/Models/Institute");
const Token = use("App/Models/Token");

class AuthController {
  async user({ request, auth }) {
    // const { token } = request.all();

    // const token = await auth.attempt(email, password);
    try {
      const user = await User.find(auth.user.id);
      const token = await auth.generate(user);
      const events = await user.eventsOnManagement().fetch();
      const institute = await user.institute().fetch();
      const userInfo = { id: user.id, email: user.email };
      const rider = await user.rider().fetch();
      return {
        ...token,
        user: userInfo,
        rider,
        eventsOnManagement: events,
        institute,
      };
    } catch (error) {
      return error.message;
    }
  }
  async googleR({ ally }) {
    await ally.driver("google").redirect();
  }
  async googleCB({ ally, auth, response }) {
    try {
      const gUser = await ally.driver("google").getUser();

      // user details to be saved
      const userDetails = {
        email: gUser.getEmail(),
        // token: gUser.getAccessToken(),
        password: `sc-default-pw-${gUser.getId()}`,
        account_provider: "google",
        account_provider_id: gUser.getId(),
      };

      // search for existing user
      const whereClause = {
        email: gUser.getEmail(),
      };

      const user = await User.findOrCreate(whereClause, userDetails);
      await Rider.findOrCreate(
        { user_id: user.id },
        {
          user_id: user.id,
          name: gUser.getName(),
          active: true,
        }
      );

      const token = await auth.generate(user);
      if (token) {
        // const events = await user.eventsOnManagement().fetch();
        // const institute = await user.institute().fetch();
        // const userInfo = { id: user.id, email: user.email };
        // const rider = await user.rider().fetch();
        // return token
        response.redirect(
          `${process.env.APP_FRONT_URL}/LoginRedirect?token=${token.token}&type=${token.type}`
        );
        // return {
        //   ...token,
        //   user: userInfo,
        //   rider,
        //   eventsOnManagement: events,
        //   institute,
        // };
      }
    } catch (error) {
      console.log(error);
      return "Unable to authenticate. Try again later " + error.message;
    }
  }

  async facebookR({ ally }) {
    await ally.driver("facebook").redirect();
  }
  async facebookCB({ ally, auth, response }) {
    try {
      const gUser = await ally.driver("facebook").getUser();

      // user details to be saved
      const userDetails = {
        email: gUser.getEmail(),
        // token: gUser.getAccessToken(),
        password: `sc-default-pw-${gUser.getId()}`,
        account_provider: "facebook",
        account_provider_id: gUser.getId(),
      };

      // search for existing user
      const whereClause = {
        email: gUser.getEmail(),
      };

      const user = await User.findOrCreate(whereClause, userDetails);
      await Rider.findOrCreate(
        { user_id: user.id },
        {
          user_id: user.id,
          name: gUser.getName(),
          active: true,
        }
      );

      const token = await auth.generate(user);
      if (token) {
        // const events = await user.eventsOnManagement().fetch();
        // const institute = await user.institute().fetch();
        // const userInfo = { id: user.id, email: user.email };
        // const rider = await user.rider().fetch();
        response.redirect(
          `${process.env.APP_FRONT_URL}/LoginRedirect?token=${token.token}&type=${token.type}`
        );
        // return {
        //   ...token,
        //   user: userInfo,
        //   rider,
        //   eventsOnManagement: events,
        //   institute,
        // };
      }
    } catch (error) {
      console.log(error);
      return "Unable to authenticate. Try again later " + error.message;
    }
  }

  async register({ request, response }) {
    await Database.transaction(async (trx) => {
      const data = await request.only(["name", "email", "password"]);
      const rpw = await request.only(["r_password"]);
      if (data.password == rpw.r_password) {
        let user = await User.create(data);
        user = user.toJSON();
        delete user.password;
        return response.json(user);
      } else {
        return response.status(400).json({ Error: "Passwords do not match" });
      }
    }).catch((e) => {
      return response.status(500).json({
        Error: e.sqlMessage,
        stack: e.stack,
        trace: e.trace,
        msg: e.message,
      });
    });
  }

  async authenticate({ request, auth }) {
    const { email, password } = request.all();

    const token = await auth.attempt(email, password);
    if (token) {
      const user = await User.findByOrFail({ email });
      const events = await user.eventsOnManagement().fetch();
      const institute = await user.institute().fetch();
      const userInfo = { id: user.id, email: user.email };
      const rider = await user.rider().fetch();
      return {
        ...token,
        user: userInfo,
        rider,
        eventsOnManagement: events,
        institute,
      };
    }
    //retorna o erro do token
    return token;
    // const tok = await Token.findOrFail(token.id);
    // // return tok
    // const user = await tok.user().fetch()
    // return {...token, user: {...user}};
  }

  async notifications({ request, auth }) {
    let notes = [];
    if (request.all().institute_id)
      notes = (await Institute.findOrFail(request.all().institute_id))
        .notifications()
        .fetch();
    else if (request.all().event_id)
      notes = (await Event.findOrFail(request.all().event_id))
        .notifications()
        .fetch();
    else if (request.all().user_id)
      notes = (await User.findOrFail(request.all().user_id))
        .notifications()
        .fetch();
    else notes = (await auth.getUser()).notifications().fetch();
    return (await notes).toJSON().reverse();
  }

  async instituteNotifications({ request, auth }) {}

  // async registerRider({ request, response }) {

  // }
}

module.exports = AuthController;
