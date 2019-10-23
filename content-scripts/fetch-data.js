function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function fetchLinkedinCompanyData (companyUniversalName){
    //be carefull accept: application/vnd.linkedin.normalized+json+2.1 header would change result format for linkedin
    return Promise.resolve(getCookie("JSESSIONID"))
        .then(data=>data.replace(/"/g, ""))
        .then(function(data){
            return fetch(
                `https://www.linkedin.com/voyager/api/organization/companies?decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-18&q=universalName&universalName=`+companyUniversalName,
                {
                    headers: {
                        "csrf-token": data
                    }
                }
            )
                .then(response => response.json())
                .then(data => {
                    return {
                        description: data.elements[0].description,
                        url: data.elements[0].companyPageUrl,
                        universalName: companyUniversalName,
                        linkedinUrl: data.elements[0].url,
                        tagline: data.elements[0].tagline,
                    }

                })
                .catch(err => console.log(err));
        });
}

function fetchAccountData (contactAddress){
    //be carefull accept: application/vnd.linkedin.normalized+json+2.1 header would change result format for linkedin
    return Promise.resolve(getCookie("JSESSIONID"))
        .then(data=>data.replace(/"/g, ""))
        .then(function(data){
            return fetch(
                `https://www.linkedin.com/voyager/api/identity/miniprofiles/${contactAddress}`,
                {
                    headers: {
                        "csrf-token": data
                    }
                }
            )
                .then(response => response.json())
                .then(data => {
                    var toReturn = {
                        name: data.firstName,
                        lastName: data.lastName,
                        occupation: data.occupation,
                        id: getId(data.objectUrn),
                        entity: getUrn(data.entityUrn),
                    };
                    return toReturn;
                })
                .catch(err => console.log(err));
        });
}

async function getLinkedinMessages(contactUrn){
    let conversationId = await fetchConversationId(contactUrn);
    if(!conversationId){
        return []; //no message yet!
    }
    return await getMessagesWithConversationId(conversationId);
}

function fetchConversationId (contactUrn){
    //be carefull accept: application/vnd.linkedin.normalized+json+2.1 header would change result format for linkedin
    // x-restli-protocol-version: 2.0.0 header is required for this request
    return Promise.resolve(getCookie("JSESSIONID"))
        .then(data=>data.replace(/"/g, ""))
        .then(function(data){
            return fetch(
                `https://www.linkedin.com/voyager/api/messaging/conversations?keyVersion=LEGACY_INBOX&q=participants&recipients=List(${contactUrn})`,
                {
                    headers: {
                        "csrf-token": data,
                        "x-restli-protocol-version": "2.0.0"
        }
                }
            )
                .then(response => response.json())
                .then(data => {
                    if(data.elements && data.elements.length > 0){
                        return getConversationId(data.elements[0].entityUrn)
                    }
                    return;
                })
                .catch(err => console.log(err));
        });
}

async function getMessagesWithConversationId(conversationId){
    //be carefull accept: application/vnd.linkedin.normalized+json+2.1 header would change result format for linkedin
    let cookie = await getCookie("JSESSIONID");
    cookie = cookie.replace(/"/g, "");
    let timeStamp = undefined;
    let messages = [];
    do{
        let url = `https://www.linkedin.com/voyager/api/messaging/conversations/${conversationId}/events`;
        if(timeStamp){
            url = url + "?createdBefore=" + timeStamp;
        }
        let result = await fetch(url,
            {
                headers: {
                    "csrf-token": cookie
                }
            }
        ).then(response => response.json());
        console.log("result", result);
        if(result.elements && result.elements.length > 0){
            result.elements.forEach(item=>{
                let message = formatMessageData(item);
                messages.push(message);
                if(!timeStamp || timeStamp > message.timeStamp){
                    timeStamp = message.timeStamp;
                }
            })
        }else{
            break;
        }
    }while(true);
    messages = messages.sort((a, b) => {return a.timeStamp - b.timeStamp});//sort
    return messages;
}

function formatMessageData(messageItem){
    //helper function to map different message types
    let data = {
        timeStamp: messageItem.createdAt,
        id: "linkedin:" + messageItem.backendUrn,
        message: messageItem
    };


    if(messageItem.from){
        data["from"] = messageItem.from["com.linkedin.voyager.messaging.MessagingMember"].miniProfile;
    }

    //if is known message type
    if(messageItem.subtype !== "MEMBER_TO_MEMBER" ){
        return addMessageBody(data);
    }

    //message text
    if(messageItem.eventContent && messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"]){
        data["text"] = messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"].body ||
            messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"].attributedBody.text;
        if(messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"].attachments){
            data["attachment"] = messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"].attachments;
        }
    }

    //forwarded message
    if(messageItem.eventContent && messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"]
        && messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"].customContent
        && messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"]
            .customContent["com.linkedin.voyager.messaging.event.message.ForwardedContent"]){

        //text
        data["forwardedText"] = messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"]
            .customContent["com.linkedin.voyager.messaging.event.message.ForwardedContent"].forwardedBody.text;

        //user
        data["forwardedFrom"] = messageItem.eventContent["com.linkedin.voyager.messaging.event.MessageEvent"]
            .customContent["com.linkedin.voyager.messaging.event.message.ForwardedContent"]
            .originalFrom["com.linkedin.voyager.messaging.MessagingMember"].miniProfile;
    }


    return addMessageBody(data);
}

function addMessageBody(data){
    //helper function to generate body
    let result = "Linkedin conversation: <br/>";
    if(data.from){
        result = result + data.from.firstName + " " + data.from.lastName + "(" + data.from.publicIdentifier + "): " + "<br/>"
    }
    result = result + data.text + "<br/>";

    if(data.forwardedFrom){
        result = result + " ,forwarded from: " +data.from.firstName + " " + data.from.lastName + " (" + data.from.publicIdentifier + "): " + "<br/>"
    }

    if(data.forwardedText){
        result = result + " ,forwarded text: " + data.forwardedText + "<br/>"
    }

    if(data.attachment){
        result = result + " <br/> attachments: <br/>" + JSON.stringify(data.attachment) + "<br/>"
    }

    if(!data.text && !data.forwardedText && !data.attachment){
        result= "UNKNOWN MESSAGE type <br/><br/><br/><br/><br/> MessageContent: <br/>" + JSON.stringify(data.message);
    }
    data.body = result;

    return data;
}

function fetchLinkedinContactInfo (contactAddress){
    return Promise.resolve(getCookie("JSESSIONID"))
        .then(data=>data.replace(/"/g, ""))
        .then(function(data){
            return fetch(
                `https://www.linkedin.com/voyager/api/identity/profiles/${contactAddress}/profileContactInfo`,
                {
                    headers: {
                        "csrf-token": data
                    }
                }
            )
                .then(response => response.json())
                .then(data => {
                    var toReturn = {
                        email: data.emailAddress,
                    };
                    if(data.phoneNumbers){
                        for(let i = 0; i < data.phoneNumbers.length; i++){
                            let phone = data.phoneNumbers[i];
                            if(phone.type == "MOBILE"){
                                toReturn.phone = phone.number;
                                break;
                            }
                        }
                        toReturn.numbers = data.phoneNumbers;
                    }
                    return toReturn;
                })
                .catch(err => console.log(err));
        });
}



function getCompanyGlobalName (url){
    let reg = /\/company\/(.+?)(\/|$)/;
    let result = reg.exec(url);
    if(result){
        return result[1];
    }
    return undefined;
}

function getAccountName (url){
    let reg = /\/in\/(.+?)(\/|$)/;
    let result = reg.exec(url);
    if(result){
        return result[1];
    }
    return undefined;
}

function getId (id){
    let reg = /urn:li:member:(\d+?)$/;
    let result = reg.exec(id);
    if(result){
        return result[1];
    }
    return undefined;
}
function getUrn (entityUrn){
    let reg = /urn:li:fs_miniProfile:(.+?)$/;
    let result = reg.exec(entityUrn);
    if(result){
        return result[1];
    }
    return undefined;
}

function getConversationId (conversationUrn){
    let reg = /urn:li:fs_conversation:(.+?)$/;
    let result = reg.exec(conversationUrn);
    if(result){
        return result[1];
    }
    return undefined;
}

async function getAccountData() {
    const fullName = document.querySelector(
        ".pv-top-card-v3--list.inline-flex.align-items-center li"
    ).innerText;
    const firstName = fullName.split(" ")[0] || "not found";
    const lastName =
        fullName
            .split(" ")
            .slice(1, 5)
            .join(" ")
            .trim() || "not found";

    const linkedinUrl = window.location.href;
    const accountName = getAccountName(linkedinUrl);
    const companyName = document.querySelector(
        ".pv-top-card-v3--experience-list-item"
    ).innerText;

    const jobTitle = document.querySelector(".flex-1.mr5 h2").innerText;

    const companyUrl = document.querySelector("#experience-section li:nth-child(1) a").href;

    const location = document.querySelector(
        ".pv-top-card-v3--list.pv-top-card-v3--list-bullet li"
    ).innerText;

    let result = {
        fullName: fullName,
        linkedinUrl: linkedinUrl,
        firstName: firstName,
        lastName: lastName,
        jobTitle: jobTitle,
        location: location,
        companyName: companyName,
        companyUrl: companyUrl,
        accountName: accountName,
        companyGlobalName: getCompanyGlobalName(companyUrl)
    };

    result.accountData = await fetchAccountData(accountName);
    return result;
}

async function getContactData(){ //incremental data first account then contact
    let result = await getAccountData();
    result.contact = await fetchLinkedinContactInfo(result.accountName);
    return result;
}

async function getCompanyData(){ //incremental data first account and contact then company
    let result = await getContactData();
    result.company = await fetchLinkedinCompanyData(result.companyGlobalName);
    return result;
}

async function getMessages(){ //incremental data first company then messages
    let result = await getCompanyData();
    result.messages = await getLinkedinMessages(result.accountData.entity);
    console.log("page data ", result);
    return result;
}



console.log("fetch data loaded");
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.action === "linkedinAll"){
            try{
                // clickMessageButton();
                getMessages().then(result=>{sendResponse(result)});
                return true;
            }catch(e){
                alert(e);
            }
            sendResponse()
        }else if(request.action === "linkedinAccount"){
            try{
                // clickMessageButton();
                getContactData().then(result=>{sendResponse(result)});
                return true;
            }catch(e){
                alert(e);
            }
            sendResponse()
        }
    }
);



