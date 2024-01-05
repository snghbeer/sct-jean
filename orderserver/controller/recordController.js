const { Table } = require('../models/orderer');
const { Promotion } = require('../models/promotion');
const {Record}  =  require('../models/record');
const {User}  =  require('../models/user');

const CACHE_MAXSIZE = 100;


class RecordController {
    cache;

    constructor(){
        this.cache = [];
        this.initCache()
    }

    
    async initCache(){
      const records = await this.getRecords();
      //records.sort((a, b) =>  new Date(b.date).getTime() - new Date(a.date).getTime()); //sort by most recent on top

      if(records.length > CACHE_MAXSIZE) this.cache = records.slice(0, CACHE_MAXSIZE);
      else this.cache = records;
  }

    async getRecords(){
        var recs;
        if(this.cache.length > 0) return this.cache
        else{
            recs = await Record.find().exec()
            //recs.sort((a, b) =>  new Date(b.date).getTime() - new Date(a.date).getTime()); //sort by most recent on top
            return recs;
        }
    }

    async groupByDay(){
        if(this.cache.length > 0) return (this.cache).reduce((acc, item) => {
            const date = new Date(item.date).toLocaleDateString();
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(item);
            return acc;
          }, {})
        else {
            console.log("empty cache")
            let recs = await this.getRecords()
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

    }

    async getOrder(id, waiter){
      const update = { waiter: waiter.name, fulfilled: true };
      const options = { new: true }; // return the updated document
      const order = await Record.findByIdAndUpdate(id, update, options).exec();
    
      return {
        order: order, 
        user: waiter.name
      };
    }

    async findOrder(id){
      const order = await Record.findById(id).exec();

      return order;
    }

    async deleteOrderById(id){
      try{
        const deleted = await Record.findByIdAndDelete(id);
        return deleted
      }
      catch(err){
        return false
      }
    }

    async deleteOrderByUUID(uuid){
      try{
        const deleted = await Record.findOneAndDelete({ uuid: uuid }, { useFindAndModify: false });
        return deleted
      }
      catch(err){
        return false
      }
    }
}


module.exports = { 
    RecordController: RecordController,
 }