const makeLinkedinRequiredFields = async () => {
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "apikey not found";
    }
    await makeCompanyFields(apiKey);
    await makeContactFields(apiKey);

};


async function makeCompanyFields(apiKey){
    await fetch(
        `https://api.hubapi.com/properties/v1/companies/properties?hapikey=${apiKey}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": "linkedin_uname",
                "label": "linkedin Universal Name",
                "description": "linkedin Universal Name.",
                "groupName": "companyinformation",
                "type": "string",
                "fieldType": "text",
                "formField": true
            })
        }
    ).catch(error=>{
        console.log("error creating company fields", error);
    });

}

async function makeContactFields(apiKey){
    await fetch(
        `https://api.hubapi.com/properties/v1/contacts/properties?hapikey=${apiKey}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": "linkedin_uid",
                "label": "linkedin User ID",
                "description": "linkedin User ID.",
                "groupName": "contactinformation",
                "type": "string",
                "fieldType": "text",
                "formField": true
            })
        }
    ).catch(error=>{
        console.log("error creating contact fields", error);
    });
    await fetch(
        `https://api.hubapi.com/properties/v1/contacts/properties?hapikey=${apiKey}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": "linkedin",
                "label": "linkedin",
                "description": "Linkedin url",
                "groupName": "contactinformation",
                "type": "string",
                "fieldType": "text",
                "formField": true
            })
        }
    ).catch(error=>{
        console.log("error creating contact fields", error);
    });
}