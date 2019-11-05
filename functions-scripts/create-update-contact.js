// FUNCTION TO CREATE HUBSPOT CONTACT TROUGH API

const getCurrentContact = async (data)=>{
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api ke not found";
    }
    let contactVid = await getContactByLinkedinId(data.accountData.id);
    console.log("contact id ", contactVid);
    if(!contactVid && data.contact && data.contact.email){
        console.log("finding with email", data.contact.email);
        contactVid = await getContactByEmail(data.contact.email);
        console.log("contact by email", contactVid)
    }
    return contactVid;
};

const createOrUpdateContact = async (data, ownerId) => {
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api ke not found";
    }
    let contactVid = await getCurrentContact(data);
    if(contactVid){ //old contact
        console.log("contact already exists");
        return await updateContact(apiKey, contactVid, data, ownerId);
    }
    return await createContactHubspot(apiKey, data, ownerId);

};

function getContactBody(data, ownerId){
    let toReturn = {
        properties: [
            {
                property: "firstname",
                value: data.accountData.name
            },
            {
                property: "lastname",
                value: data.accountData.lastName
            },
            {
                property: "company",
                value: data.companyName
            },
            {
                property: "city",
                value: data.location
            },
            {
                property: "linkedin",
                value: data.linkedinUrl
            },
            {
                property: "jobtitle",
                value: data.accountData.occupation
            },
            {
                property: "linkedin_uid",
                value: data.accountData.id
            },
            {
                property: "hubspot_owner_id",
                value: ownerId
            }
        ]
    };
    if(data.contact.email){
        toReturn.properties.push({
            property: "email",
            value: data.contact.email
        })
    }
    if(data.contact.phone){
        toReturn.properties.push({
            property: "phone",
            value: data.contact.phone
        })
    }
    return JSON.stringify(toReturn);
}

async function updateContact(apiKey, contactVid, data, ownerId){
    console.log("updating contact", contactVid);
    let url = `https://api.hubapi.com/contacts/v1/contact/vid/${contactVid}/profile?hapikey=${apiKey}`;
    return await fetch(url, {
        method: "POST",
        body: getContactBody(data, ownerId),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => {}).then((response)=>{
        console.log("update result ", response);
        return newContact(data.accountData.id, contactVid);
    })
}


async function createContactHubspot(apiKey, data, ownerId){
    let url = `https://api.hubapi.com/contacts/v1/contact/?hapikey=${apiKey}`;
    return await fetch(url, {
        method: "POST",
        body: getContactBody(data, ownerId),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json()).then((response)=>{
        console.log("result ", response);
        return newContact(data.accountData.id, response["vid"]);
    });
}
