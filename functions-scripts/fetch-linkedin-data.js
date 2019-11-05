// function to fetch data from Linkedin profile page


const fetchLinkedinAccount = async function(){
    return await new Promise(function(resolve, reject){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "linkedinAccount"}, function(response) {
                if(response){

                    resolve(response);
                }else{
                    reject("nothing found");
                }
            });
        });
    })
};


const fetchLinkedinAll = async function(){
    return await new Promise(function(resolve, reject){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "linkedinAll"}, function(response) {
                if(response){
                    // let message = response;
                    // document.querySelector("#first_name").value = message.firstName;
                    // document.querySelector("#last_name").value = message.lastName;
                    // document.querySelector("#company").value = message.companyName;
                    // document.querySelector("#location").value = message.location;
                    // document.querySelector("#job_title").value = message.jobTitle;
                    // // document.querySelector("#linkedin_url").value = message.linkedinUrl;
                    // // document.querySelector("#level").value = message.jobTitle;
                    // document.querySelector("#email").value = message.contact.email;
                    // messagesArray = message.messages;
                    // console.log(messagesArray);
                    resolve(response);
                }else{
                    reject("nothing found");
                }
            });
        });
    })
};
