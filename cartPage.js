

async function openViewModal(productName) {
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
    

    title.innerHTML = `${response["productName"]}`;
    price.innerHTML = `${response["basePrice"]}$`;
    description.innerHTML = `${response["description"]}`;
    merchType.innerHTML = `<b>Stock:</b>${response["stock"]} <b>  CATAGORY:</b> ${response["typeOfMerch"]}`;
    image.style.backgroundImage =  `url('assets/${response["imageFilename"]}')`;
    image.style.backgroundPosition = "center";

    element.style.opacity = 1;
    element.style.visibility = "visible";
    console.log("open View modal has been run");
    
}
closeModal = (id) => {
    element = document.getElementById(id);
    element.style.opacity = 0;
    element.style.visibility = "hidden";
    console.log("modal has been closed");
}


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


register = async() =>{
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    
    let formData = new FormData();
    
    formData.append("username", username);
    formData.append("password", password);

    let response = await (await fetch("http://127.0.0.1:5000/createUser", {
        "method": "POST",
        "Content-Type": "multipart/form-data",
        "body": formData
    })).json();
    console.log(response);
    response = response["result"];

    formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    response = await (await fetch("http://127.0.0.1:5000/loginUser", {
        "method": "POST",
        "Content-Type": "multipart/form-data",
        "body": formData
    })).json();

    let id = response["ID"];
    if(response["result"]){
        setCookie(username, id);
    }
    location.reload();
}


logout = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "ID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
    if(response["result"])
        setCookie(username.value, id);
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
                          Enter Username
                      </div>
                      <input type="text" class="username" id="username">
                      <div class="login-box-username-text">
                          Enter the Password
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

toggleCheckoutModal = () =>{
    let checkoutModal = document.getElementById("purchase-modal");
    
    if(checkoutModal.style.visibility == "visible")
    {
        checkoutModal.style.opacity = 0;
        checkoutModal.style.visibility = "hidden";
    }
    else{
        checkoutModal.style.opacity = 1;
        checkoutModal.style.visibility = "visible";
    }
}



checkout = async() => {
    let addressElem = document.getElementById("address");
    let portElem = document.getElementById("port");

    let formData = new FormData();
    formData.append("address", addressElem.value);
    formData.append("port", portElem.value);
    

    let response = await (await fetch("http://127.0.0.1:5000/checkout", {
        "method": "POST",
        "Content-Type": "multipart/form-data",
        "credentials" : "include",
        "body": formData
    })).json();

    response = response["result"];
    console.log(response);

    toggleCheckoutModal();
    location.reload();
}


removeCartItem = async(productName) => {
    let formData = new FormData();
    formData.append("productName", productName);
    formData.append("user", getCookie("user"));
    formData.append("ID", getCookie("ID"));

    let response = await (await fetch("http://127.0.0.1:5000/deleteCartItem", {
        "method": "DELETE",
        "Content-Type": "multipart/form-data",
        "body": formData
    })).json();

    response = response["result"];
    console.log(response);

    location.reload();
}



document.addEventListener("DOMContentLoaded", async()=>{
    console.log("im running");
    userCookie = getCookie("user");
    Id = getCookie("ID");

    if (getCookie("user")){
        let loginButton = document.getElementById("login");
        loginButton.innerHTML = getCookie("user");

    }
    
    console.log(userCookie);

    //let objects = [{"productType": "bottleee", "price": 200, "description": " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"}, {"productType": "WINNEEE", "price": 500, "description": " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"}, {"productType": "Cute Bear", "price": 1000, "description": " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"}];
    //let objectString = JSON.stringify(objects);
    //localStorage.setItem("objects", objectString);
    let loginOuterBox = document.getElementById("login-box-outer");
    let productBox = document.getElementsByClassName("list-of-items-outer")[0];
    let checkOutButton = document.getElementsByClassName("purchase-button-container")[0];
    let emptyText = document.getElementsByClassName("is-empty-text")[0];

    let response = await (await fetch("http://127.0.0.1:5000/getCart", {
        "method": "GET",
        "Content-Type": "multipart/form-data",
        "credentials" : "include"
    })).json();

    //merchTypes = response["merchType"];
    response = response["result"];
    console.log("im running");

    if(response){
        

        loginOuterBox.style.visibility = "hidden";
        productBox.style.visibility = "visible";
        
        let productObject = "";
        for(let index = 0; index < response.length; index++)
        {
            console.log(response[index]["basePrice"]);
            productObject += `<div class = "list-of-items-inner">
        <div class = "item-text-holder-inner" style="margin-left: 40px; width: 200px;">
            <div class = "item-text">${response[index]["productName"]}</div>
        </div>
        <div class = "item-text-holder-inner">
            <div class = "item-text">${response[index]["basePrice"]}$</div>
        </div>
 
    <div>
        <div class = "item-button" onclick="openViewModal('${response[index]["productName"]}')">
            VIEW
        </div>
    </div>

    <div>
        <div class = "item-button" onclick="removeCartItem('${response[index]["productName"]}')">
            REMOVE
        </div>
    </div>
</div>
`;     
        }   
        productBox.innerHTML = productObject;
        if(response.length != 0){
            checkOutButton.style.visibility = "visible";
            emptyText.style.visibility = "hidden";
        }
        else{
            emptyText.style.visibility = "visible";
        }   
  
            
    
    }
    else{
        loginOuterBox.style.visibility = "visible";
        productBox.style.visibility = "hidden";
        let loginObject = `
              <div class = "login-box">
                  <div class="login-box-text">
                      <div class="login-box-username-text">
                          Enter Username
                      </div>
                      <input type="text" class="username" id="username">
                      <div class="login-box-username-text">
                          Enter the Password
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
      let loginElement = document.getElementsByClassName("login-box-outer")[0];
      loginElement.innerHTML = loginObject;
      checkOutButton.style.visibility = "hidden";
    

     
    }
});

