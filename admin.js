

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


login = async() =>{
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let id = "";
    
    let formData = new FormData();

    
    formData.append("username", username.value);
    formData.append("password", password.value);

    let response = await (await fetch("http://127.0.0.1:5000/loginAdmin", {
        "method": "POST",
        "Content-Type": "multipart/form-data",
        "body": formData
    })).json();
    console.log(response);
    id = response["ID"];
    
    if(response["result"]){
        setCookie(username.value, id);
    }
    location.reload();

}




openEditModal = async(productName) => {
    let element = document.getElementById("edit-modal");

    let paramsObj = {"productName": productName};
    let searchParams = new URLSearchParams(paramsObj);
    let response = await (await fetch("http://127.0.0.1:5000/getProduct" +"?" + searchParams, {
        "method": "GET",
        "Content-Type": "multipart/form-data",
        "credentials": "include"
    })).json();
    response = response["result"][0];

    let title = document.getElementById("product-title-edit");
    let price = document.getElementById("product-price-edit");
    let description = document.getElementById("product-description-edit");
    let merchType  = document.getElementById("product-select-edit");
    let stock = document.getElementById("product-stock-edit");
    

    title.value = `${response["productName"]}`;
    stock.value = `${response["stock"]}`
    price.value = `${response["basePrice"]}`;
    description.innerHTML = `${response["description"]}`;
    merchType.innerHTML = `${response["typeOfMerch"]}`;
    
 
    element.style.opacity = 1;
    element.style.visibility = "visible";


    console.log("open modal has been run");
}


openAddModal = () => {
    element = document.getElementById("add-modal");
    element.style.opacity = 1;
    element.style.visibility = "visible";
    console.log("open Add modal has been run");
}

closeModal = (id) => {
    element = document.getElementById(id);
    element.style.opacity = 0;
    element.style.visibility = "hidden";
    console.log("modal has been closed");
}




openViewModal = async(productName) => {
    console.log(productName);
    element = document.getElementById("product-view-modal");
    let formData = new FormData();
    formData.append("productName", productName)

    let paramsObj = {"productName": productName};
    let searchParams = new URLSearchParams(paramsObj);
    let response = await (await fetch("http://127.0.0.1:5000/getProduct" +"?" + searchParams, {
        "method": "GET",
        "Content-Type": "multipart/form-data",
        "credentials": "include"
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
    merchType.innerHTML = `<b>CATAGORY:</b> ${response["typeOfMerch"]}`;
    image.style.backgroundImage =  `url('assets/${response["imageFilename"]}')`;
    image.style.backgroundPosition = "center";

    element.style.opacity = 1;
    element.style.visibility = "visible";
    console.log("open View modal has been run");
    
}

addProduct = async() => {
    let productName = document.getElementById("product-name-add");
    let productPrice = document.getElementById("product-price-add");
    let merchType = document.getElementsByClassName("product-select")[0];
    let description = document.getElementById("product-description-add");
    let image = document.getElementById("product-image-add");
    let stock = document.getElementById("product-stock-add");

    let formData = new FormData();
    formData.append("productName", `${productName.value}`);
    formData.append("price", productPrice.value);
    formData.append("merchType", `${merchType.innerHTML}`);
    formData.append("description", description.value);
    formData.append("stock", `${stock.value}`);

    if(image.files.length != 0) 
        formData.append("imageFile", image.files[0]);
    else
        formData.append("imageFile", false);

    console.log(`${productName.value} ${productPrice.value} ${merchType.innerHTML} ${description.value} ${productPrice.value}`);

    const response = await fetch("http://127.0.0.1:5000/add", {
        "method": "POST",
        "Content-Type": "multipart/form-data",
        "credentials": "include",
        "body": formData
      });
    console.log(await response.json());
    location.reload();
}

editProduct = async() =>{
    element = document.getElementById("edit-modal");


    let title = document.getElementById("product-title-edit");
    let price = document.getElementById("product-price-edit");
    let description = document.getElementById("product-description-edit");
    let merchType  = document.getElementById("product-select-edit");
    let stock = document.getElementById("product-stock-edit");
    let image = document.getElementById("product-image-edit");
    

    let formData = new FormData();
    formData.append("productName", `${title.value}`);
    formData.append("price", price.value);
    formData.append("merchType", `${merchType.innerHTML}`);
    formData.append("description", description.innerHTML);
    formData.append("stock", `${stock.value}`);

    if(image.files.length != 0) 
        formData.append("imageFile", image.files[0]);
    else
        formData.append("imageFile", false);

    const response = await fetch("http://127.0.0.1:5000/editProduct", {
        "method": "PUT",
        "Content-Type": "multipart/form-data",
        "credentials": "include",
        "body": formData
      });
    console.log(await response.json());

    element.style.opacity = 0;
    element.style.visibility = "hidden";
    location.reload();
}

deleteProduct = async(productName) => {
    if(confirm(`Are you sure you want to DELETE:    ${productName}`)){
        let formData = new FormData()
        formData.append("productName", productName);
        const response = await fetch("http://127.0.0.1:5000/deleteProduct", {
            "method": "POST",
            "Content-Type": "multipart/form-data",
            "credentials": "include",
            "body": formData
        });
        console.log(await response.json());
        location.reload();
    }
}


toggleProductHelper = (optionsBox, selectContainer) =>{
    if(optionsBox.style.visibility == "visible")
    {
        optionsBox.style.visibility = "hidden";
        selectContainer.style.borderRadius = "var(--default-border-radius";
    } 
    else{
        optionsBox.style.visibility = "visible";
        selectContainer.style.borderRadius = "var(--default-border-radius) var(--default-border-radius) 0 0";
    }
}
    
toggleProductSelect = () =>{
    let optionsBox = document.getElementById("options-add");
    let selectContainer = document.getElementById("select-container-add");
    toggleProductHelper(optionsBox, selectContainer);
}



toggleProductSelectEdit = () => {
    let optionsBox = document.getElementById("options-edit");
    let selectContainer = document.getElementById("product-select-edit");
    toggleProductHelper(optionsBox, selectContainer);
}






document.addEventListener("DOMContentLoaded", async()=>{

    //let objects = [{"productType": "bottleee", "price": 200, "description": " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"}, {"productType": "WINNEEE", "price": 500, "description": " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"}, {"productType": "Cute Bear", "price": 1000, "description": " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"}];
    //let objectString = JSON.stringify(objects);
    //localStorage.setItem("objects", objectString);
    let loginOuterBox = document.getElementsByClassName("login-box-outer")[0];
    let productBox = document.getElementsByClassName("list-of-items-outer")[0];
    let addButton = document.getElementsByClassName("add-button")[0];
    console.log("hey");
    let response = await (await fetch("http://127.0.0.1:5000/getProductsAdmin", {
        "method": "GET",
        "credentials": "include",
        "Content-Type": "multipart/form-data",
    })).json();

    merchTypes = response["merchType"];
    response = response["result"];

    
    
    if(response && merchTypes){
        
        console.log("HEYYY THERE");
        loginOuterBox.style.visibility = "hidden";
        productBox.style.visibility = "visible";
        addButton.style.visibility = "visible";
        
        let productObject = "";
        for(let index = 0; index < response.length; index++)
        {
            productObject += `<div class = "list-of-items-inner">
        <div class = "item-text-holder-inner" style="margin-left: 40px; width: 200px;">
            <div class = "item-text">${response[index]["productName"]}</div>
        </div>
        <div class = "item-stock"><div><b style="">STOCK:</b> ${response[index]["stock"]}</div></div>
        <div class = "item-text-holder-inner">
            <div class = "item-text">${response[index]["basePrice"]}$</div>
        </div>
    <div>
        <div class = "item-button" onclick="openEditModal('${response[index]["productName"]}')">
            EDIT
        </div>
    </div>

    <div>
        <div class = "item-button" onclick="openViewModal('${response[index]["productName"]}')">
            VIEW
        </div>
    </div>

    <div>
        <div class = "item-button" onclick="deleteProduct('${response[index]["productName"]}')">
            DELETE
        </div>
    </div>
</div>
`;

            
        }   
        let ListOfElements = document.getElementsByClassName("list-of-items-inner-container")[0];
        ListOfElements.innerHTML = productObject;  



        for(let index = 0; index < merchTypes.length; index++){
            let container = document.createElement("div");
            let containerEdit = document.createElement("div");


            let optionsBox = document.getElementById("options-add");
            let optionsBoxEdit = document.getElementById("options-edit");
    
            container.className = "option";
            containerEdit.className = "option";
            let headingText = document.createTextNode(`${merchTypes[index]["name"]}`);
            let headingTextEdit = document.createTextNode(`${merchTypes[index]["name"]}`);
            

            container.appendChild(headingText);
            optionsBox.appendChild(container);
            containerEdit.appendChild(headingTextEdit);
        
            optionsBoxEdit.appendChild(containerEdit);

    
            container.addEventListener("click", () =>{
                let optionsDisplay= document.getElementById("product-select-add");
                optionsDisplay.innerHTML = merchTypes[index]["name"];
                toggleProductSelect();
            });

            containerEdit.addEventListener("click", () =>{
                let optionsDisplay= document.getElementById("product-select-edit");
                optionsDisplay.innerHTML = merchTypes[index]["name"];
                toggleProductSelectEdit();
            });

        }
    
    }
    else{
        loginOuterBox.style.visibility = "visible";
        productBox.style.visibility = "hidden";
        let loginObject = `
              <div class = "login-box">
                  <div class="login-box-text">
                      <div class="login-box-username-text">
                          Enter Admin Username
                      </div>
                      <input type="text" class="username" id="username">
                      <div class="login-box-username-text">
                          Enter Password
                      </div>
                      <input type="password" class="username" id="password">
                      <div>
                          <input type = "button" value="Login" onclick="login()">
                      </div>
                  </div>
              </div>
          `;
      let loginElement = document.getElementsByClassName("login-box-outer")[0];
      loginElement.innerHTML = loginObject;
    }
});