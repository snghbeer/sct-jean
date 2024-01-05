const { Session } = require("../models/session");

class SessionController {

  async newSession(data) {
    try{
      const aSession = new Session({
        name: data.name,
        date: data.date,
        startTime: data.startTime,
        duration: data.duration
    })
    await aSession.save();
    return aSession;
    }
    catch(e){
      return false;
    }
  }

  async updateSession(sessionId, newData) {
    session = await Session.findByIdAndUpdate(sessionId, newData, {
      new: true,
    });
  }

  async closeSession(sessionId) {
    try{
      const session = await Session.findByIdAndUpdate(
        sessionId,
        {
          closed: true,
        },
        { new: true }
      );
      return session;
    }
    catch(err){
      return false;
    }
  }

  async orderSomething(sessionId, price) {}

  async getSessions() {
    const sess = await Session.find().exec();
    sess.sort((a, b) => new Date(a.date) - new Date(b.date));
    return sess;
  }

  async groupByDay(){
    let recs = await this.getSessions()
    const groupedData = recs.reduce((acc, item) => {
        const date = new Date(item.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      return groupedData
  }

  async getSessionsOfADay(isoDateString){
    const today = new Date(isoDateString);
    const recs = await this.getSessions()
    const filteredObjects = recs.filter(obj => {
      
      // Extract the date from each object
      const objectDate = new Date(obj.date);
    
      // Compare the year, month, and day of the object's date with today's date
      return (
        objectDate.getFullYear() === today.getFullYear() &&
        objectDate.getMonth() === today.getMonth() &&
        objectDate.getDate() === today.getDate()
      );
    });
    return filteredObjects
  }

  async getSession(sessionId) {
    const sess = await Session.findOne({ _id: sessionId }).exec();
    return sess;
  }
}


module.exports = {
    SessionController,
};