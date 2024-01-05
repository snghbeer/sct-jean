class CustomerController{
    stripe;

    constructor(stripe){
        this.stripe = stripe;
    }

    async addNewCustomer(){
        const customer = await this.stripe.customers.create({
            description: 'My First Test Customer',
            email: "nivonsay.jean@hotmail.com",
            name: "jean",
            metadata: {
                iban: "BE12 3454 1254 1452 7895",
                test: "foobar"
            }
          });
          const bankAccount = await stripe.customers.createSource(
            customer.id,
            {source: 'btok_1NKfuRIWoonMSFnMw1QllZsf'}
          );
          console.log(customer)
    }

    async retrieveCustomer(customerId){
        const customer = await stripe.customers.retrieve(customerId);
    }

    async updateCustomer(customerId, customerData){
        const customer = await stripe.customers.update(
            customerId,
            customerData//{metadata: {order_id: '6735'}}
          );
    }

    async deleteCustomer(customerId) {
        const deleted = await stripe.customers.del(customerId);
    }

    async listCustomers(aLimit = 10){
        const customers = await stripe.customers.list({
            limit: aLimit,
        });
    }
}

module.exports = {
    CustomerController,
  };