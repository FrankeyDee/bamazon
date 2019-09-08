///required dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

//connection and credentials
var connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user:"root",
    password:""
    database:"bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    
    displayProducts();

});

//display products in table
function displayProducts() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;

        var table = new Table ( {
            head: ["Item ID", "Product Name", "Department Name", "Price", "Available In Stock"]
            // colWidths: [12,75,20,12,12],
        });
        
        for (var i=0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }

        console.log(table.toString());

        ///customer question (1 - ask for item_id, 2 - how many units)
        inquirer.prompt([
            {
                type:"number",
                message:"Please enter the Item ID of the Product you are searching for.",
                name:"item_id"
            },
            {
                type:"number",
                message:"How many would you like to purchase?",
                name:"quantity"
            }
        ])
        ///check database for items available
        .then(function (cart) {

            var quantity = cart.quantity;
            var itemID = cart.item_id;

            connection.query('SELECT * FROM products WHERE id=' + itemID, function (err, selectedItem) {
                if (err) throw err;

                // Varify item quantity desired is in inventory
                if (selectedItem[0].stock_quantity - quantity >= 0) {
                    connection.query("UPDATE products SET stock_quantity=? WHERE id=?", [selectedItem[0].stock_quantity - quantity, itemID],
                        function (err, inventory) {
                            if (err) throw err;

                            displayProducts();
                        }
                    );
                }
            });
        })
    })
}; 
