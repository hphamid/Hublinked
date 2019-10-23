function run() {
    console.log("salam");

    var apiKey = document.getElementById('apiKey');
    var name = document.getElementById('name');
    var saveButton = document.getElementById('save');

    loadData();

    function loadData(){
        getApiKey().then(function(apiKeyStr){
            apiKey.value = apiKeyStr;
        });
        getName().then(function(nameStr){
            name.value = nameStr;
        })
    }


    saveButton.addEventListener("click", save);
    function save(){
        setApiKey(apiKey.value);
        setName(name.value);
        loadData();
    }

}

document.addEventListener('DOMContentLoaded', run);
