function run() {
    var apiKey = document.getElementById('apiKey');
    var email = document.getElementById('email');
    var portal = document.getElementById('portal');
    var saveButton = document.getElementById('save');

    loadData();

    function loadData(){
        getApiKey().then(function(apiKeyStr){
            apiKey.value = apiKeyStr;
        });
        getEmail().then(function(emailStr){
            email.value = emailStr;
        });
        getPortal().then(function(portalstr){
            portal.value = portalstr;
        })
    }


    saveButton.addEventListener("click", save);
    function save(){
        saveAsync().then(()=>{console.log("saved")});
    }

    async function saveAsync(){
        await removeAll();
        await setApiKey(apiKey.value);
        await setEmail(email.value);
        await setPortal(portal.value);
        await makeLinkedinRequiredFields();
        loadData();
    }

}

document.addEventListener('DOMContentLoaded', run);
