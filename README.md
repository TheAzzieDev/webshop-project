# webshop-project

### ABOUT
This is a simple webshop project, with adminstrator page and a user page.
As of currently the administrator is able to add, edit, delete and preview the products
while the users are able to make mock purchases. 
This is however only the begining, There will be more features:
* filtering
* searching 
* actuall purchases!

Furthermore the ammbition is that the administrator will be able to see what **products sell well**, aswell as users getting
**customized recomendations** of products using **cookies**. Before all this the project will be heavily refractored, as in
its current state, its accumilated lots of technical debt.


### HOW TO RUN
1. Create a schema i MYSQL Workbench
2. Create an .env file, add the following content:
```
DB_USER=USERNAME_YOUR_DB
DB_PASSWORD=PASSWORD_YOUR_DB
DB=NAME_OF_YOUR_SCHEMA
ADMIN=USERNAME_FOR_ADMIN_ACCOUNT
ADMIN_PASS=PASSWORD_FOR_ADMIN_ACOUNT
```
3. change directory to the backend folder. Then in terminal type:
```pip install requirements.txt```
4. Run the backendServer.py file first, then run index.html as the webserver(there is a button in the right corner in vscode)


### INTENDED USAGE IMPORTANT!!!!!
There is an ADMIN PANEL which can be reached by typing adminPage.html in the url. Then Enter your admin account credentials. 
From there you have access to the admin panel! **NOTE** that you do not need to provide an image when making a product nor do you need to provide when editing. In the latter case of editing the image provided when creating product will be used if left blank.
From there you can create/login to a user account and purchase a product.




