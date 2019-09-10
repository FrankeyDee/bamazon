///required dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

//connection and credentials
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
  });
  
  function startConnection(cb) {
      connection.connect(function (err) {
          if (err) throw (err);
          if (cb) {
              cb();
          }
      })
  }

//display products in table
startConnection(displayProducts);
function displayProducts() {
    connection.query("SELECT * FROM products ORDER BY item_id ASC", function (err, results) {
        if (err) throw (err);
        console.log("\nWelcome to BAMAZON!!!");
        var result = results
        var table = new Table({ head: ["ID Number", "Product Name", "Price"] });

        for (var i = 0; i < results.length; i++) {
            var object = [result[i].item_id, result[i].product_name, result[i].price]
            table.push(object);
        }
        console.log(table.toString() + "\n");
        selectItem();
    })
}

///customer's 2 messages
function selectItem() {
    inquirer
        .prompt([
            {
                message: "Select the item you would like to purchase by ID number:",
                name: "aItem",
                type: "input",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("\nPlease seclect ID number. Thank you!")
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to purchase?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("\nPlease select quantity. Thank you!")
                    return false;
                }
            }
       
        ])
      .then(function (answers) {
            var id = answers.aItem;
            var quantity = answers.quantity;
            connection.query("SELECT * FROM products WHERE item_id = " + id, function (err, results) {
                if (err) throw (err);
                var result = results[0]
                var itemPrice = result.price;
                if (quantity > result.stock_quantity) {
                    console.log("Sorry there is not enough in stock!")
                    selectItem ();
                    // endConnection();
                    return;
                }
                updateQuantity(id, quantity, itemPrice)
            });
        })
}

function updateQuantity(idNumber, amount, price) {
    connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [amount, idNumber], function (err, results) {
        if (err) throw (err);
        console.log("\nYour total is $" + price * amount + "." + "\n" + "Thank you for shopping with BAMAZON!" + "\n");
        endConnection();
    })
}

function endConnection() {
    connection.end();
}
