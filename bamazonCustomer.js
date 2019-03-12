require("dotenv").config();

var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "127.0.0.1",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: process.env.PASSWORD,
    database: "bamazon"
  });

inquirer.prompt([
    {
        "name": "id",
        "message": "What is the ID of the product you'd like to buy?"
    },
    {
        "name": "quantity",
        "message": "How much of the product would you like?"
    }
]).then(function(response){
    var id = parseInt(response.id);
    var quantity = parseInt(response.quantity);

    connection.connect(function(err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");
        var query = connection.query(
            "SELECT * FROM products WHERE item_id = ?",
            [id],
            function(err, res) {
                if (err) throw err;
                var quantity_selected = res[0].stock_quantity;
                var product_selected = res[0].product_name;
                if (quantity_selected >= quantity){
                    var query = connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [{
                            stock_quantity: quantity_selected - quantity
                        },
                        {
                            item_id: id
                        }],
                        function(err_update, res_update){
                            if (err_update) throw err_update;
                            console.log("Your order is being processed! There are now "+(quantity_selected-quantity).toString()+" " + product_selected + "s left.");
                        }
                    );
                }
                else {
                    console.log("There are only " + quantity_selected.toString() + " " + product_selected + "s left. Please select a different quantity.");
                }
                connection.end();
            }
          );
    });
})