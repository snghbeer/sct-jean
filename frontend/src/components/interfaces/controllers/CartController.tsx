import { round } from "../../util/helpFunctions";
import { RecordItem, DataObject } from "../interfaces";

class CartController {
   private cardContent: Map<string, RecordItem | undefined> = new Map<string, RecordItem>();

   addToCart = (qty: number, aProduct: DataObject, promo?: number) => {
    if (this.cardContent.has(aProduct.name)) {
      this.increaseItem(aProduct.name);
    } else {
      const productOrder = {...aProduct}
      let recordTotal: number;
      if (promo && (promo >= 0 && promo <= 1)) {
        // Apply promotion if promo value is valid (between 0 and 1)
        const discountedPrice = productOrder.price * (1 - promo);
        productOrder.price =  round(discountedPrice) //parseFloat(discountedPrice.toFixed(2))
        recordTotal = round(qty * discountedPrice) //parseFloat((qty * discountedPrice).toFixed(2));
      } else {
        // No promotion, use regular price
        recordTotal = round(qty * productOrder.price) //parseFloat((qty * productOrder.price).toFixed(2));
      }
  
      let cardItem: RecordItem = {
        numberOfItems: qty,
        product: productOrder,
        recordTotal: recordTotal,
      };  
      this.cardContent.set(aProduct.name, cardItem);
    }
  }

  clearCart(){
    this.cardContent.clear()
  }

  removeFromCart(key: string) {
    this.cardContent.delete(key);

  }

  getItem(key: string) {
    return this.cardContent.get(key);
  }



  updateItem(key: string, qty: number) {
    const item = this.getItem(key);
    
    if(item){
        item!.numberOfItems = qty;
        item!.recordTotal = (qty * round(item!.product.price))
        this.cardContent.set(key, item);
    }
  }

  increaseItem(key: string){
    let item = this.getItem(key);
    const currQty = item!.numberOfItems
    item!.numberOfItems += 1;
    item!.recordTotal = (currQty+1) * item!.product.price
    this.cardContent.set(key, item);
    //console.log(item)
  }

  decreaseItem(key: string){
    let item = this.getItem(key);
    const currQty = item!.numberOfItems
    if(currQty === 1) this.removeFromCart(key)
    else{
      item!.numberOfItems -= 1;
      item!.recordTotal = (currQty-1) * item!.product.price
      this.cardContent.set(key, item);
    }
  }

  addNote(key: string, note: string){
    let item = this.getItem(key);
    item!.note = note;
    this.cardContent.set(key, item);
  }


  toArray() {
    const mappedEntries = Array.from(this.cardContent.entries())
        .map((value) => {
            return value
        });
    return mappedEntries;
  }

  calculateTotal(){
    const sum: number = Array.from(this.cardContent.values())
    .reduce((accumulator: number, currentValue: any) => accumulator + (currentValue.recordTotal as number), 0);
    return sum;
  }

  toRecords() {
    const mappedEntries = Array.from(this.cardContent.entries())
        .map((value) => {
            return {
              product: value[1]?.product.name,
              id: value[1]?.product._id,
              amount: value[1]?.numberOfItems,
              price: value[1]?.product.price,
              note: value[1]?.note
            }
        });
    return mappedEntries;
  }

  isEmpty(){
    return this.cardContent.size === 0
  }
}

export default CartController;
