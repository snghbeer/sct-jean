import { RecordDTO } from "../interfaces";

export class OrderController {
    private orders: Map<string, RecordDTO> = new Map<string, RecordDTO>();

    initOrders(orders: RecordDTO[]){
        for (let order of orders) {
            this.orders.set(order._id!, order);
        }
    }

    //add.update
    updateItem(key: string, item: RecordDTO) {
        this.orders.set(key, item);
    }

    getItem(key: string) {
        const item = this.orders.get(key);
        return item;
    }

    toArray() {
        const mappedEntries = Array.from(this.orders.entries())
            .map((value) => {
                return value[1]
            });
        return mappedEntries;    
    }
}