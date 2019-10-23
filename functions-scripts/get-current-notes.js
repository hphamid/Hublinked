// when the contact is already existing in our hubspot base, we launch this function to create an array of all the messages to check if already existing
const checkNotes = async (contactId) => {
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api key not found";
    }
    let timeStamp = 0;
    let lastMessageId = undefined;
    let messages = [];
    let hasMore = false;
    let offset = undefined;
    do{
        let result = await getContactEngagements(contactId, apiKey, offset);
        console.log("result", result);
        if(result.results){
            result.results.forEach(result=>{
                if (result.engagement.type === "NOTE" && result.engagement.uid && result.engagement.uid.indexOf("linkedin") >= 0) {
                    if(result.engagement.timestamp > timeStamp){
                        timeStamp = result.engagement.timestamp;
                        lastMessageId = result.engagement.uid;
                    }
                    if (!messages.includes(result.metadata.uid)) {
                        messages.push(result.metadata.uid);
                    }
                }
            })
        }
        hasMore = result["hasMore"];
        offset = result["offset"];

    }while(hasMore);
    return {lastMessageId: lastMessageId, timeStamp: timeStamp, messages: messages}
};

async function getContactEngagements(contactId, apiKey, offset){
    let url = `https://api.hubapi.com/engagements/v1/engagements/associated/contact/${contactId}/paged?hapikey=${hubspotApiKey}&limit=100`;
    if(offset){
        url = url +"&offset=" + offset;
    }
    return await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json());
};
