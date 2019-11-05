// FUNCTION TO CREATE HUBSPOT CONTACT TROUGH API

const createAssociations = async (companyId, contactVid) => {
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api ke not found";
    }
    let url = `https://api.hubapi.com/crm-associations/v1/associations?hapikey=${apiKey}`;
    await fetch(url, {
        method: "PUT",
        body: JSON.stringify({
            "fromObjectId": companyId,
            "toObjectId": contactVid,
            "category": "HUBSPOT_DEFINED",
            "definitionId": 2
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).catch(()=>{console.log("company is already linked")});
    await fetch(url, {
        method: "PUT",
        body: JSON.stringify({
            "fromObjectId": contactVid,
            "toObjectId": companyId,
            "category": "HUBSPOT_DEFINED",
            "definitionId": 1
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).catch(()=>{console.log("contact is already linked")});
};