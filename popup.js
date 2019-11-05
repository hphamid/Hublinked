// ---------VARIABLES----------
// const hubspotOwner = document.querySelector("#hubspot-owner");
const syncWithHubspotButton = document.querySelector("#add-to-hubspot");
// const emailInput = document.querySelector("#email");
const openInHubspotButton = document.querySelector("#open-in-hubspot");
// const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let hubSpotOwnerEmail = "";
var hubSpotOwnerId = undefined;
const addUserData = async () => {
    return getEmail()
        .then(email=>{
            hubSpotOwnerEmail = email;
            return loadHubspotUsers();
        })
        .then(users => {
            // //removing old items
            // for(let i = 0 ; i < hubspotOwner.length; i++){
            //     hubspotOwner.remove(i);
            // }
            for(let i = 0; i < users.length; i ++){
                // let option = document.createElement("option");
                // option.value = users[i].ownerId;
                // option.text = users[i].email;

                // hubspotOwner.add(option, i);
                if(users[i].email === hubSpotOwnerEmail){
                    // hubspotOwner.selectedIndex = i;
                    hubSpotOwnerId = users[i].ownerId;
                }
            }
        })
};

addUserData();


const createElement = (childElement, parentElementId, content, value = "") => {
    const newChildElement = document.createElement(childElement);
    const parentElement = document.getElementById(parentElementId);
    const appendChildElement = parentElement.appendChild(newChildElement);
    appendChildElement.innerHTML = content;

    value !== "" ? (newChildElement.value = value) : (value = "");
};

const clearLogs = (parentElementId) => {
    const parentElement = document.getElementById(parentElementId);
    parentElement.innerHTML = "";
};


const showLoading = function(){
    syncWithHubspotButton.style.visibility = "hidden";
    openInHubspotButton.style.visibility = "hidden";
    document.querySelector("#loader").style.display = "block";
    clearLogs("logs");
};

const hideLoading = function(){
    syncWithHubspotButton.style.visibility = "visible";
    openInHubspotButton.style.visibility = "visible";
    document.querySelector("#loader").style.display = "none";
};