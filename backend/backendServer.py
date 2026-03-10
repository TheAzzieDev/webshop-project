from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector 
import os
import sys
import bcrypt
import datetime
import random

from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()


mydb = mysql.connector.connect(
  host="localhost",
  user=os.getenv("DB_USER"),
  password=os.getenv("DB_PASSWORD"),
  database=os.getenv("DB")
)


mycursor = mydb.cursor()

mycursor.execute("SET FOREIGN_KEY_CHECKS = 0")
mycursor.execute("DROP TABLE IF EXISTS buyers")
mycursor.execute("DROP TABLE IF EXISTS cart")
mycursor.execute("DROP TABLE IF EXISTS merchtype")
mycursor.execute("DROP TABLE IF EXISTS products")
mycursor.execute("DROP TABLE IF EXISTS purchases")
mycursor.execute("SET FOREIGN_KEY_CHECKS = 1")

mycursor.execute("""CREATE TABLE buyers (
username VARCHAR(45) NOT NULL, 
password VARCHAR(90), 
PRIMARY KEY(username)
)""")


mycursor.execute("""CREATE TABLE merchtype(
name VARCHAR(80) NOT NULL, 
stock INT,
PRIMARY KEY(name)
)""")

mycursor.execute("""CREATE TABLE products(
productName VARCHAR(120) NOT NULL,
basePrice INT,
stock INT,
typeOfMerch VARCHAR(80),
imageFilename VARCHAR(80),
description VARCHAR(4096),
PRIMARY KEY(productName),
FOREIGN KEY (typeOfMerch) REFERENCES merchtype(name) ON DELETE CASCADE
)""")


mycursor.execute("""CREATE TABLE cart (
username VARCHAR(45), 
productName VARCHAR(120), 
PRIMARY KEY(username, productName),
FOREIGN KEY (username) REFERENCES buyers(username) ON DELETE CASCADE,
FOREIGN KEY (productName) REFERENCES products(productName) ON DELETE CASCADE
)""")



mycursor.execute("""CREATE TABLE purchases(
	deliveryID INT NOT NULL AUTO_INCREMENT,
    orderedDate DATE,
    deliveryDate DATE,
    productName VARCHAR(120),
    username VARCHAR(45),
    price INT,
    address VARCHAR(200),
    port INT,
    PRIMARY KEY(deliveryID),
    FOREIGN KEY (productName) REFERENCES products(productName) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES buyers(username) ON DELETE CASCADE
)""")


mycursor.execute("DROP PROCEDURE IF EXISTS getCart")
mycursor.execute("DROP PROCEDURE IF EXISTS getValuesForPurchase")
mycursor.execute("DROP PROCEDURE IF EXISTS updateMerchStock")
mycursor.execute("DROP PROCEDURE IF EXISTS updateProduct")


mycursor.execute("""CREATE PROCEDURE getCart(IN usernameIN VARCHAR(45))
BEGIN
	SELECT p.productName, p.basePrice, p.typeOfMerch FROM products p
	INNER JOIN cart c ON p.productName = c.productName WHERE c.username = usernameIN;
END;
""")

mycursor.execute("""CREATE PROCEDURE updateProduct(
IN productNameIN VARCHAR(120), 
IN basePriceIN INT, 
IN stockIN INT, 
IN typeOfMerchIN VARCHAR(80), 
IN imageFilenameIN VARCHAR(200),
IN descriptionIN VARCHAR(4096)
)
BEGIN
	DECLARE newFilename VARCHAR(200);
	IF(imageFilenameIN = "") THEN
		SELECT imageFilename INTO newFilename 
        FROM products WHERE productName = productNameIN;
	ELSE
		SET newFilename = imageFilenameIN;
    END IF;
    UPDATE products SET productName = productNameIN, 
    basePrice = basePriceIN, 
    stock = stockIN, 
    typeOfMerch = typeOfMerchIN, 
    imageFilename = newFilename, 
    description = descriptionIN
    WHERE productName = productNameIN;
END;""")

mycursor.execute("""CREATE PROCEDURE updateMerchStock(IN merchTypeIN VARCHAR(80))
BEGIN
    DECLARE counter INT;
    SELECT COUNT(typeOfMerch) INTO counter FROM products WHERE typeOfMerch = merchTypeIN GROUP BY typeOfMerch;
    IF counter IS NULL THEN 
		SET counter := 0;
    END IF;
	UPDATE merchtype SET stock = counter WHERE name = merchTypeIN;
END;""")


mycursor.execute("""CREATE PROCEDURE getValuesForPurchase(IN usernameIN VARCHAR(45))
BEGIN
	SELECT c.productName, c.username, p.basePrice FROM cart c 
	INNER JOIN products p ON p.productName = c.productName
	WHERE c.username = "bob";
END;""")


mycursor.execute("""CREATE TRIGGER forEachPurchasedItem
AFTER INSERT ON purchases FOR EACH ROW
BEGIN
DECLARE currentStock INT;
    SELECT stock INTO currentStock FROM products WHERE productName = NEW.productName;
	IF currentStock != 0 THEN
		UPDATE products SET stock = stock - 1 WHERE productName = NEW.productName;
    END IF;
    DELETE FROM cart WHERE username = NEW.username AND productName = NEW.productName;
END;""")


mycursor.execute("DROP TRIGGER IF EXISTS updateCountDelete")
mycursor.execute("DROP TRIGGER IF EXISTS updateCountUpdate")
mycursor.execute("DROP TRIGGER IF EXISTS updateCountInsert")


mycursor.execute("""CREATE TRIGGER updateCountDelete
AFTER DELETE ON products FOR EACH ROW
BEGIN
	CALL updateMerchStock(OLD.typeOfMerch);
END;""")


mycursor.execute("""CREATE TRIGGER updateCountUpdate
AFTER UPDATE ON products FOR EACH ROW
BEGIN
	CALL updateMerchStock(NEW.typeOfMerch);
END;""")

mycursor.execute("""CREATE TRIGGER updateCountInsert
AFTER INSERT ON products FOR EACH ROW
BEGIN
	CALL updateMerchStock(NEW.typeOfMerch);
END;""")


mycursor.execute("INSERT INTO merchtype(name, stock) VALUES ('shirts', 0)")
mycursor.execute("INSERT INTO merchtype(name, stock) VALUES ('pants', 0)")
mycursor.execute("INSERT INTO merchtype(name, stock) VALUES ('snacks', 0)")
mycursor.execute("INSERT INTO merchtype(name, stock) VALUES ('drinks', 0)")



sql = "INSERT INTO products (productName, basePrice, stock, typeOfMerch, imageFilename, description) VALUES (%s, %s, %s, %s, %s, %s)"

products = [
("Green Crystal Candy", 3, 10, "snacks", "crystalCandy.jpg",
 "This magical treat is guaranteed to make you feel breezy! With a nice cool taste of mint and vanilla, a must try."),

("Strawberry Ramune Soda", 4, 13, "drinks", "strawberrySoda.png",
 "A refreshing Japanese soda with a delicious strawberry flavour, perfect for summer!"),

("Spicy Seaweed Kick", 3, 8, "snacks", "seaweed.png",
 "If you don't like these we can't be friends, it's literally an Umami bomb."),

("AriaDen Hoodie", 50, 25, "shirts", "hoodie.png",
 "A cozy hoodie you can wear proudly to represent Aria's Den!"),

("AriaDen Pants", 40, 25, "pants", "pants.png",
 "Wear the stylish pants with pride and represent the Den.")
]

mycursor.executemany(sql, products)

mycursor.close()
mydb.commit()


app = Flask(__name__)

default_filename = "default.png"

#origins="http://127.0.0.1:5500"
CORS(app)


def getRequestProducts(request):
    product = request.form.get("productName")
    price = request.form.get("price")
    merchtype = request.form.get("merchType")
    description = request.form.get("description")
    stock = request.form.get("stock")
    try:  
        file = request.files['imageFile']
        if file:
            filename = request.files['imageFile'].filename
            if not os.path.exists(f"assets/{filename}"):
                file.save(f"assets/{filename}")
    except:
        return (product, price, stock, merchtype, default_filename, description)
    return (product, price, stock, merchtype, filename, description)


def hasUserPermission(mycursor, username, password, sentWithCookies = False):
    sql = "SELECT password FROM buyers WHERE username = %s"
    val = (username, )
    result = executeWithRows(mycursor, sql, val, False)

    passwordInDB = result[0]["password"]

    if sentWithCookies and password == passwordInDB:
        return passwordInDB
    if not bcrypt.checkpw(password.encode(), passwordInDB.encode()):
        return False
    
    
    return passwordInDB


    
def hasAdminAccess(username, password):
    if os.getenv("ADMIN") == username and os.getenv("ADMIN_PASS") == password:
        return True
    return False


def executeWithNoRows(mycursor, sql, val, close = True, many = False):
    if not many:
        mycursor.execute(sql, val)
        mydb.commit()
    else:
        mycursor.executemany(sql, val)
        mydb.commit()
    if(close):
        mycursor.close() 



def executeWithRows(mycursor, sql, val = None, close = True):
    if not val:
        mycursor.execute(sql)
    else:
        mycursor.execute(sql, val)
    result = mycursor.fetchall()

    while mycursor.nextset():
        pass
    if close:
        mycursor.close()
    return result
        

@app.route('/add', methods=['POST'])
def home():
    mycursor = mydb.cursor(dictionary=True)
    try:
        username = request.cookies.get("user")
        password = request.cookies.get("ID")
        if hasAdminAccess(username, password):
            (product, price, stock, merchtype, filename, description) = getRequestProducts(request)
            print(f"{product} {price} {stock} {merchtype} {filename} {description}")
            sql = "INSERT INTO products (productName, basePrice, stock, typeOfMerch, imageFilename, description) VALUES (%s, %s, %s, %s, %s, %s)"
            val = (product, price, stock, merchtype, filename, description)
            executeWithNoRows(mycursor, sql, val, close=True, many=False)

            response = jsonify({'result': True})
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
        
    except:
        response = jsonify({'result': False})
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    response = jsonify({'result': False})
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response



def getProductsFunc():
    mycursor = mydb.cursor(dictionary=True)
    sql = "SELECT * FROM products"
    result = executeWithRows(mycursor, sql)
    mycursor.close()
    return result


def getMerchFunc():
    mycursor = mydb.cursor(dictionary=True)
    sql = "SELECT name FROM merchtype"
    result = executeWithRows(mycursor, sql)
    mycursor.close()
    return result


@app.route("/getProduct", methods=["GET"])
def getProduct():
    product = request.args.get('productName')
    print("the product is "+ product)
    mycursor = mydb.cursor(dictionary=True)
    sql = "SELECT * FROM products WHERE productName = %s"
    val = (product, )
    result = executeWithRows(mycursor, sql, val)
    response = jsonify({"result": result})
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route("/getAllProducts", methods=["GET"])
def getProducts():
    result = getProductsFunc()
    merchTypes = getMerchFunc()
    return jsonify({"result": result, "merchType": merchTypes})

@app.route("/getProductsAdmin", methods=["GET"])
def getProductAdmin():
    result = getProductsFunc()
    merchTypes = getMerchFunc()

    username = request.cookies.get("user")
    password = request.cookies.get("ID")
    if hasAdminAccess(username, password):
        response = jsonify({"result": result, "merchType": merchTypes})
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    response = jsonify({"result": False, "merchType": False})
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route("/loginAdmin", methods=["POST"])
def loginAdmin():
    username = request.form.get("username")
    password = request.form.get("password")
    if hasAdminAccess(username, password):
        return jsonify({"result": True, "ID": password})
    return jsonify({"result": False})



@app.route("/editProduct", methods=["PUT", "OPTIONS"])
def editProduct():
    mycursor = mydb.cursor(dictionary=True)
    try:
        username = request.cookies.get("user")
        password = request.cookies.get("ID")
        if hasAdminAccess(username, password):
            (product, price, stock, merchtype, filename, description) = getRequestProducts(request)
            if filename == default_filename:
                filename = ""
            sql = "CALL updateProduct(%s, %s, %s, %s, %s, %s)"

            args = (product, price, stock, merchtype, filename, description)
            mycursor.execute(sql, args)
            mydb.commit()
            mycursor.close()

            response = jsonify({'result': True})
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response

        else:
            response = jsonify({'result': False})
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response

    except:
        response = jsonify({'result': False})
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
@app.route("/deleteProduct", methods=["POST"])
def deleteProduct():
    mycursor = mydb.cursor(dictionary=True)
    try:
        username = request.cookies.get("user")
        password = request.cookies.get("ID")
        if hasAdminAccess(username, password):
            productName = request.form.get("productName")
            sql = "DELETE FROM products WHERE productName = %s"

            val = (productName, )
            executeWithNoRows(mycursor, sql, val)

            response = jsonify({'result': True})
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
            
    except Exception as e:
        print(e)
        response = jsonify({'result': False})
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    response = jsonify({'result': False})
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response







# >>> password = b"super secret password"
# >>> # Hash a password for the first time, with a randomly-generated salt
# >>> hashed = bcrypt.hashpw(password, bcrypt.gensalt())
# >>> # Check that an unhashed password matches one that has previously been
# >>> # hashed
# >>> if bcrypt.checkpw(password, hashed):
# ...     print("It Matches!")
# ... else:
# ...     print("It Does not Match :(")
@app.route("/createUser", methods=["POST"])
def createUser():
    mycursor = mydb.cursor(dictionary=True)
    try:
        username = request.form.get("username")
        password = request.form.get("password")
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        print(hashed.decode())
        
        sql = "INSERT INTO buyers(username, password) VALUES(%s, %s)"
        val = (username, hashed.decode())
        executeWithNoRows(mycursor, sql, val)
    except:
        return jsonify({'result': False})
    return jsonify({'result': True})

@app.route("/loginUser", methods=["POST"])
def loginUser():
    mycursor = mydb.cursor(dictionary=True)
    try:
        username = request.form.get("username")
        password = request.form.get("password")
    
        passwordInDB = hasUserPermission(mycursor, username, password)
        if passwordInDB:
            response = jsonify({'result': True, "ID": passwordInDB})
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
    
    except:
        response = jsonify({'result': False})
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    response = jsonify({'result': False})
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route("/addToCart", methods=["POST"])
def addToCart():
    mycursor = mydb.cursor(dictionary=True)
    try:
        username = request.cookies.get("user")
        password = request.cookies.get("ID")
    
        productName = request.form.get("productName")

        print(f"username: {username} password: {password}")
    
        passwordInDB = hasUserPermission(mycursor, username, password, True)
        if(passwordInDB):

            sql = "SELECT stock FROM products WHERE productName = %s"
            val = (productName ,)
            result = executeWithRows(mycursor, sql, val, False)
            stock = result[0]["stock"]
            if stock == 0:
                response = jsonify({'result': False})
            else:
                response = jsonify({'result': True})
                sql = "INSERT INTO cart(username, productName) VALUES(%s, %s)"
                val = (username, productName)
                executeWithNoRows(mycursor, sql, val)
        
    except:
        response = jsonify({'result': False})
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route("/getCart", methods=["GET"])
def getCart():
    mycursor = mydb.cursor(dictionary=True)
    try: 
        username = request.cookies.get("user")
        password = request.cookies.get("ID")
        if hasUserPermission(mycursor, username, password, True):
            sql = "CALL getCart(%s)"
            val = (username, )
            result = executeWithRows(mycursor, sql, val)
            

            response = jsonify({'result': result})
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
            
    except:
        response = jsonify({'result': False})
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    response = jsonify({'result': False})
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route("/checkout", methods=["POST"])
def checkout():
    mycursorDict = mydb.cursor(dictionary=True)
    try:
        username = request.cookies.get("user")
        password = request.cookies.get("ID")
        address = request.form.get("address")
        port = request.form.get("port")
        if hasUserPermission(mycursorDict, username, password, True):
            sql = "CALL getValuesForPurchase(%s)"
            val = (username, )
            result = executeWithRows(mycursorDict, sql, val, close=False)
            valueList = []

            for entry in result:
                startDate = datetime.datetime.now()
                arriveDate = datetime.date(startDate.year, startDate.month, startDate.day)
                startDate = startDate.strftime("%Y-%m-%d")

                randomNumber = random.randint(3, 10)
                arriveDate = arriveDate + datetime.timedelta(randomNumber)
                arriveDate = arriveDate.strftime("%Y-%m-%d")


                valueList.append((startDate, 
                                  arriveDate, 
                                  entry["productName"],
                                  entry["username"],
                                  entry["basePrice"],
                                  address,
                                  int(port)))
                
            sql = "INSERT INTO purchases(orderedDate, deliveryDate, productName, username, price, address, port) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            executeWithNoRows(mycursorDict, sql, valueList, close=True, many=True)

            response = jsonify({'result': True})
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
        
    except:
        response = jsonify({'result': False})
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    response = jsonify({'result': False})
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response



@app.route("/deleteCartItem", methods=["DELETE"])
def deleteCartItem():
    mycursor = mydb.cursor(dictionary=True)
    try:
        username = request.form.get("user")
        password = request.form.get("ID")
        productName = request.form.get("productName")

    
        passwordInDB = hasUserPermission(mycursor, username, password, True)
        if(passwordInDB):
            sql = "DELETE FROM cart WHERE username = %s AND productName = %s"
            val = (username, productName)
            executeWithNoRows(mycursor, sql, val)
        
    except:
        return jsonify({'result': False})
    return jsonify({'result': True})
  


@app.route('/home/<int:num>', methods=['GET'])
def disp(num):
    return jsonify({'data': num ** 2})

if __name__ == '__main__':
    app.run(debug=True)






# SELECT * FROM project.products;
# USE project;

# DROP PROCEDURE IF EXISTS updateProduct;

# DELIMITER %%
# CREATE PROCEDURE updateProduct(
# IN productNameIN VARCHAR(120), 
# IN basePriceIN INT, 
# IN stockIN INT, 
# IN typeOfMerchIN VARCHAR(80), 
# IN imageFilennameIN VARCHAR(200),
# IN descriptionIN VARCHAR(4096)
# )
# BEGIN
# 	DECLARE newFilename VARCHAR(200);
# 	IF(imageFilenameIN = "") THEN
# 		SELECT filename INTO newFilename 
#         FROM products WHERE productName = productNameIN;
# 	ELSE
# 		SET newFilename = imageFilenameIN;
#     END IF;
#     UPDATE products SET productName = productNameIN, 
#     basePrice = basePriceIN, 
#     stock = stockIN, 
#     typeOfMerch = typeOfMerchIN, 
#     imageFilename = imageFilenameIN, 
#     description = descriptionIN;
# END; %%




# DROP PROCEDURE IF EXISTS getCart;
# DELIMITER %%
# CREATE PROCEDURE getCart(IN usernameIN VARCHAR(45))
# BEGIN
# 	SELECT p.productName, p.basePrice, p.typeOfMerch FROM products p
# 	INNER JOIN cart c ON p.productName = c.productName WHERE c.username = usernameIN;
# END; %% 



# USE project;
# DROP PROCEDURE IF EXISTS getValuesForPurchase;
# DELIMITER %%
# CREATE PROCEDURE getValuesForPurchase(IN usernameIN VARCHAR(45))
# BEGIN
# 	SELECT c.productName, c.username, p.basePrice FROM cart c 
# 	INNER JOIN products p ON p.productName = c.productName
# 	WHERE c.username = "bob";
# END; %%



# DELIMITER %%
# CREATE TRIGGER forEachPurchasedItem
# AFTER INSERT ON purchases FOR EACH ROW
# BEGIN
# 	DELETE FROM cart WHERE username = NEW.username AND productName = NEW.productName;
# END; %%


#remember ON DELETE CASCADE WHEN CREATING TABLES


# DELIMITER %%
# CREATE TRIGGER updateCountDelete
# AFTER DELETE ON products FOR EACH ROW
# BEGIN
# 	CALL updateMerchStock(OLD.typeOfMerch);
# END; %%



# CREATE DEFINER=`root`@`localhost` PROCEDURE `getCart`(IN usernameIN VARCHAR(45))
# BEGIN
# 	SELECT p.productName, p.basePrice, p.typeOfMerch FROM products p
# 	INNER JOIN cart c ON p.productName = c.productName WHERE c.username = usernameIN;
# END