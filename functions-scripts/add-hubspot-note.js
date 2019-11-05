// FUNCTION TO ADD A NOTE TO A CONTACT USING HUSBPOT API
const addNotes = async (ownerId, contactId, companyId, linkedinMessages, hubspotMessages) => {
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api key not found";
    }
    if(!linkedinMessages){
        console.log("no message found");
        return;
    }
    for(let i = 0; i < linkedinMessages.length; i++){
        let message =  linkedinMessages[i];
        if(message.timeStamp > hubspotMessages.timeStamp){
            console.log("added " + i + " of " + linkedinMessages.length);
            await addNoteToHubspot(apiKey, ownerId, contactId, companyId, message.timestamp, message.id, message.body);
        }
    }


};
async function addNoteToHubspot(apiKey, ownerId, contactId, companyId, timeStamp, uid, body){
    const hubspotNoteUrl = `https://api.hubapi.com/engagements/v1/engagements?hapikey=${apiKey}`;

    await fetch(hubspotNoteUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            engagement: {
                active: true,
                ownerId: ownerId,
                type: "NOTE",
                timestamp: timeStamp,
                uid: uid
            },
            associations: {
                contactIds: [contactId],
                companyIds: [companyId]
            },
            metadata: {
                body: body
            }
        })
    }).catch(error=>console.log(error));
}
