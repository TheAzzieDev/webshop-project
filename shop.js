

setCookie = (username, id) => {
    const date = new Date();
    date.setMinutes(10+date.getMinutes());
    
    let cookieText = "user=" + username + ";"  + date.toUTCString() + ";" + "path=/";
    document.cookie = cookieText;
    cookieText = "ID="+ id + ";"  +date.toUTCString() + ";" + "path=/";
    document.cookie = cookieText;
}


getCookie = (cookieName) => {
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieList = decodedCookie.split(';');
    let cookieNameLength = (cookieName + "=").length;
    for(i = 0; i < cookieList.length; i++)
    {
        let cookie = cookieList[i];
        cookie = cookie.trim();
        if(cookie.substring(0, cookieNameLength) == cookieName+"="){
            return cookie.substring(cookieNameLength);
        }
    }
    return false;
}

logout = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "ID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}

toggleLoginModal = () => {
    let loginOuterBox= document.getElementsByClassName("login-box-outer")[0];
    let loginObject = "";

    console.log(loginOuterBox.style.visibility );
    if(loginOuterBox.style.visibility == "hidden")
    {
        
        loginOuterBox.style.visibility = "visible";
        loginOuterBox.style.opacity = 1;
        let username = getCookie("user")
        if(username) {
            loginObject = `
              <div class = "login-box">
                  <div class="login-box-text">
                   
                      <div class="login-box-username-text">
                       WELCOME  ⋆.  ${username}  ࿔*:
                      </div>
            
                      <div>
                          <input type = "button" value="Log Out" onclick="logout()">
                      </div>
                  </div>
              </div>
          `;
        }
        else{
            loginObject = `
              <div class = "login-box">
                  <div class="login-box-text">
                      <div class="login-box-username-text">
                          Enter Username UWU
                      </div>
                      <input type="text" class="username" id="username">
                      <div class="login-box-username-text">
                          Enter the Password nya~~
                      </div>
                      <input type="password" class="username" id="password">
                      <div>
                          <input type = "button" value="Login" onclick="login()">
                      </div>
                      <div>
                          <input type = "button" value="Register" onclick="register()">
                      </div>
                  </div>
              </div>
          `;
          
        }
        
        loginOuterBox.innerHTML = loginObject;
    }
    else{
        loginOuterBox.style.visibility = "hidden";
        loginOuterBox.style.opacity = 0;
    }
        

  
}


closeModal = () => {
    element = document.getElementById("product-view-modal");
    element.style.opacity = 0;
    element.style.visibility = "hidden";
    console.log("modal has been closed");
}


addToCart = async(productName) =>{
    console.log("I have been run");
    let username = getCookie("username");
    let password = getCookie("ID");
    
    let formData = new FormData();
    
    formData.append("username", username);
    formData.append("password", password);
    formData.append("productName", productName);
// $2b$12$UWtOPOgY2DLaEgZM.Pa5Yeqk7lD16fjBsPBiyaY33Z.UED3Zb6LM
//  $2b$12$UWtOPOgY2DLaEgZM.Pa5Yeqk7lD16fjBsPBiyaY33Z.UED3Zb6LMi
    let response = await (await fetch("http://127.0.0.1:5000/addToCart", {
        "method": "POST",
        "Content-Type": "multipart/form-data",
        "credentials": "include",
        "body": formData
    })).json();
    console.log(response);
    response = response["result"];

}

openViewModal= async(productName) =>{
    console.log(productName);
    let element = document.getElementById("product-view-modal");
    let formData = new FormData();
    formData.append("productName", productName)

    let paramsObj = {"productName": productName};
    let searchParams = new URLSearchParams(paramsObj);
    let response = await (await fetch("http://127.0.0.1:5000/getProduct" +"?" + searchParams, {
        "method": "GET",
        "Content-Type": "multipart/form-data",
    })).json();
    response = response["result"][0];

    let title = document.getElementsByClassName("product-title")[0];
    let price = document.getElementsByClassName("price")[0];
    let description = document.getElementsByClassName("description-text")[0];
    let merchType  = document.getElementsByClassName("merch-type-product-text")[0];
    let image = document.getElementsByClassName("image-container")[0];
    let addToCartElem = document.getElementsByClassName('add-to-cart-container')[0];

    

    title.innerHTML = `${response["productName"]}`;
    price.innerHTML = `${response["basePrice"]}$`;
    description.innerHTML = `${response["description"]}`;
    merchType.innerHTML = `<b>CATAGORY:</b> ${response["typeOfMerch"]}`;
    image.style.backgroundImage =  `url('assets/${response["imageFilename"]}')`;
    image.style.backgroundPosition = "center";
    addToCartElem.onclick = () => addToCart(response["productName"]);


    element.style.opacity = 1;
    element.style.visibility = "visible";
    console.log("open View modal has been run");
    
}


register = async() =>{
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    
    let formData = new FormData();

    console.log(username);
    
    formData.append("username", username.value);
    formData.append("password", password.value);

    let response = await (await fetch("http://127.0.0.1:5000/createUser", {
        "method": "POST",
        "Content-Type": "multipart/form-data",
        "body": formData
    })).json();
    console.log(response);
    response = response["result"];
    location.reload();

}


login = async() =>{
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let id = "";
    
    let formData = new FormData();

    
    formData.append("username", username.value);
    formData.append("password", password.value);

    let response = await (await fetch("http://127.0.0.1:5000/loginUser", {
        "method": "POST",
        "Content-Type": "multipart/form-data",
        "body": formData
    })).json();
    console.log(response);
    id = response["ID"];
    
    setCookie(username.value, id);
    location.reload();

}


document.addEventListener("DOMContentLoaded", async()=>{

    if (getCookie("user")){
        let loginButton = document.getElementById("login");
        loginButton.innerHTML = getCookie("user");
    }
    let shopContainer = document.getElementsByClassName("products-inner")[0];
    let loginOuterBox= document.getElementsByClassName("login-box-outer")[0]
    loginOuterBox.visibility = "hidden";

 
    let itemObjects = "";

    let response = await (await fetch("http://127.0.0.1:5000/getAllProducts", {
        "method": "GET",
        "Content-Type": "multipart/form-data",
    })).json();

    let merchTypes = response["merchType"];
    response = response["result"];

    
    for(let index = 0; index < response.length; index++)
    {

        if(index % 2 == 0){
            itemObjects += `<div class = "product-item" onclick="openViewModal('${response[index]["productName"]}')" id = "MOCHI" style= 'background-image: url("assets/${response[index]["imageFilename"]}");'>
    <div class = "product-item-title">
        ${response[index]["productName"]}
    </div>
    <div>
        ⋆.ೃ࿔*:･⋆.ೃ࿔*:･⋆.ೃ࿔*:･⋆.ೃ࿔*
    </div>
    <div>
        ${response[index]["description"]}
    </div>
</div>`;
        }

        else{
            itemObjects += `<div class = "product-item" onclick="openViewModal('${response[index]["productName"]}')" id = "MOCHI" style= 'background-image: url("assets/${response[index]["imageFilename"]}");'>
    <div class = "product-item-title">
        ${response[index]["productName"]}
    </div>
    <div>
        ■□■□■□■□■□■■□■□■□■□
    </div>
    <div>
        ${response[index]["description"]}
    </div>
</div>`;
        }
    }

    shopContainer.innerHTML = itemObjects;

});






