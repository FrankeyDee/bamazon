///required dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

//connection and credentials
var connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user:"root",
    password:"",
    database:"bamazon",
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected to bamazon database!")
    displayProducts();

});

//display products in table
function displayProducts() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw (err);

        var table = new Table ( {
            head: ["Item ID", "Product Name", "Department Name", "Price", "Available In Stock"]
        });
        for (var i=0; i < res.length; i++) {
            var object = [result[i].item_id, result[i].product_name, result[i].price]
            table.push(object);
        }
        console.log(table.toString() + "\n");
        selectItem();
    })
}

///customer's 2 messages
function selectItem() {
    inquirer.prompt([
            {
                type:"number",
                message:"Please enter the Item ID of the Product you are searching for.",
                name:"item"
            },
            {
                type:"number",
                message:"How many would you like to purchase?",
                name:"quantity"
            }
        ])
        ///check database for items available
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
    connection.query("UPDATE products SET stock_quantity - ? WHERE item_id = ?", [amount, idNumber], function (err,res){
        if(err) throw(err);
        console.log("\nYour total is $" + price * amount + "." + "\n" + "Thanks for shopping!" + "\n");
        endConnection();
    })
}

function endConnection() {
    connection.end
}