const Order = require("./assignment2Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  MENU: Symbol("menu"),
  SIZE: Symbol("size"),
  TOPPINGS: Symbol("toppings"),
  ICECREAM: Symbol("icecream"),
  DRINKS: Symbol("drinks"),
  PAYMENT: Symbol("payment"),
});

module.exports = class subway extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.selectedItem = "";
        this.sSize = "";
        this.sToppings = "";
        this.sDrinks = "";
        this.orderItems = [];
        this.sItems = ["Chicken Sub", "Meat Sub"];
        this.sIceCream = "";
    }
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
          case OrderState.WELCOMING:
            this.stateCur = OrderState.DISH;
            aReturn.push("Welcome to Vig SUBS");
            aReturn.push("What kind of subs do you like?");
            aReturn.push(...this.sItems);
            break;
          case OrderState.DISH:
            if (sInput.toLowerCase() === "chicken sub") {
                this.selectedItem = sInput;
                this.orderItems.push(this.selectedItem);
                this.stateCur = OrderState.SIZE;
                aReturn.push(`What size of ${this.selectedItem} would you like?`);
                aReturn.push("Small ($5.99), Medium ($7.99), Large ($9.99)");
            } else if (sInput.toLowerCase() === "meat sub") {
                this.selectedItem = sInput;
                this.orderItems.push(this.selectedItem);
                this.stateCur = OrderState.SIZE;
                aReturn.push(`What size of ${this.selectedItem} would you like?`);
                aReturn.push("Small ($6.99), Medium ($8.99), Large ($10.99)");
            } else {
                aReturn.push("Invalid dish! Please choose Chicken Sub or Meat Sub.");
            }
            break;
          case OrderState.SIZE:
            this.sSize = sInput;
            if (this.sSize.toLowerCase() === "small" || this.sSize.toLowerCase() === "medium" || this.sSize.toLowerCase() === "large") {
                this.stateCur = OrderState.TOPPINGS;
                aReturn.push("What toppings would you like?");
                this.orderItems.push(this.sSize);
            } else {
                aReturn.push("Invalid size. Please enter Small, Medium, or Large.");
            }
            break;
          case OrderState.TOPPINGS:
            this.sToppings = sInput;
            this.stateCur = OrderState.ICECREAM;
            aReturn.push("Would you like to add ice cream with your order?");
            this.orderItems.push(this.sToppings);
            break;
          case OrderState.ICECREAM:
            this.sIceCream = sInput;
            this.stateCur = OrderState.DRINKS;
            aReturn.push("Would you like to add drinks with your order?");
            this.orderItems.push(this.sIceCream);
            break;
          case OrderState.DRINKS:
                this.stateCur = OrderState.PAYMENT;
                this.nOrder = this.Price();
                this.sDrinks = sInput;
                this.orderItems.push(this.sDrinks);
                let totalPrice = this.Price();
                aReturn.push("Thank you for your order!");
                aReturn.push(`You ordered: ${this.orderItems.join(", ")}`);
                this.orderItems.push(`Total Price: $${totalPrice.toFixed(2)}`);
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
          case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your payment was success`);
                aReturn.push(`Please pick it up at ${d.toTimeString()}`);
                aReturn.push(`Your order will be delivered at \n${this.formatAddress(sInput.purchase_units[0].shipping)}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'Aa9K1RScUYUkwwAbNrJmd4wD4qoirknVCe-6vegZlCzR5WamXn2mXxQ0p7Aea2SVo9ZlieSuz0N9MxYV'
      return(`
      <!DOCTYPE html>
  
      <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}">
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
        </script>
      </body>
      `);
  
    }

    formatAddress(addressObj) {
      const {
        address: {
          address_line_1,
          address_line_2,
          admin_area_2,
          admin_area_1,
          postal_code,
          country_code,
        },
      } = addressObj;

    const addressLines = [];

    if (address_line_1) {
      addressLines.push(address_line_1);
    }
    if (address_line_2) {
      addressLines.push(address_line_2);
    }

    const cityStatePostal = `${admin_area_2}, ${admin_area_1} ${postal_code}`;
    addressLines.push(cityStatePostal);

    if (country_code) {
      addressLines.push(country_code);
    }

    const addressFormatting = addressLines.join("\n");

    return addressFormatting;
    }

    Price() {
      const itemPrices = {
          "chicken sub": {
              small: 5.99,
              medium: 7.99,
              large: 9.99,
          },
          "meat sub": {
              small: 6.99,
              medium: 8.99,
              large: 10.99,
          },
      };

      const selectedItemPrice = itemPrices[this.selectedItem.toLowerCase()]?.[this.sSize.toLowerCase()] || 0;
      let totalPrice = selectedItemPrice;

      return totalPrice;
  }
}