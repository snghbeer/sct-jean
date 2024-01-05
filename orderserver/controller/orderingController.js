const {Room, Table}  =  require('../models/orderer');
const {Record}  =  require('../models/record');




class OrderGenerator{

    constructor(){

    }

    async generateRange(start, end) {
        try {
          const promises = [];
      
          for (let i = start; i <= end; i++) {
            const obj = new Table({
              subId: i
            });
            promises.push(obj.save());
          }
          await Promise.all(promises);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }
      

    async getRooms(){
        const rooms = await Table.find().exec()
        return rooms;
    }

    async getRoom(id){
        const table = await Table.findOne({_id: id}).exec() 
        return table;
    }

    async reserveTable(tableNumber){
      const table = await Table.findOne({subId: tableNumber});
      table.closed = true
      await table.save();
    }

    //orderData = Record
    //we add an order to the table/room
    async addOrder(orderId, tableId) {

      try {
        const order = await Record.findById(orderId);
        if (!order) {
          throw new Error("Invalid orderId");
        }
    
        const table = await Table.findOne({subId: tableId});
        if (!table) {
          throw new Error("Invalid tableId");
        }
    
        table.total += order.total
        table.orders.push(order);
        await table.save();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    

    async closeOrder(tableId){
      try{
        const room = await Table.findByIdAndUpdate(tableId, {
          closed: true,
          total: 0
        },
        { new: true });
        return room
      }
      catch(err){
        return false;
      }
    }
}

module.exports = {
    OrderGenerator
};