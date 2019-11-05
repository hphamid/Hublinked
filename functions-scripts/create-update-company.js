// FUNCTION TO CREATE HUBSPOT COMPANY TROUGH API

const createOrUpdateCompany = async (data, ownerId) => {
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api ke not found";
    }
    let companyId = await getCompanyByUniversalName(data.company.universalName);
    console.log("company id ", companyId);
    if(!companyId && data.company.url){
        console.log("finding with domain", data.company.url);
        let host = new URL(data.company.url).hostname;
        companyId = await getCompanyByDomain(host)
        console.log("company by domain", companyId)
    }
    if(companyId){ //old company
        console.log("company already exists");
        return await updateCompany(apiKey, companyId, data, ownerId);
    }

    return await createCompanyHubspot(apiKey, data, ownerId);

};

async function updateCompany(apiKey, companyId, data, ownerId){
    console.log("updating company", companyId);
    let url = `https://api.hubapi.com/companies/v2/companies/${companyId}?hapikey=${apiKey}`;
    return await fetch(url, {
        method: "PUT",
        body: JSON.stringify({
            "properties": [
                {
                    "name": "name",
                    "value": data.companyName
                },
                {
                    "name": "description",
                    "value": data.company.description
                },
                {
                    "name": "linkedin_uname",
                    "value": data.company.universalName
                },
                {
                    "name": "website",
                    "value": data.company.url
                },
                {
                    "name": "hubspot_owner_id",
                    "value": ownerId
                }
            ]
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json()).then((response)=>{
        console.log("result ", response);
        return response["companyId"];
    })
}


async function createCompanyHubspot(apiKey, data, ownerId){
    let url = `https://api.hubapi.com/companies/v2/companies?hapikey=${apiKey}`;
    return await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            "properties": [
                {
                    "name": "name",
                    "value": data.companyName
                },
                {
                    "name": "description",
                    "value": data.company.description
                },
                {
                    "name": "linkedin_uname",
                    "value": data.company.universalName
                },
                {
                    "name": "website",
                    "value": data.company.url
                },
                {
                    "name": "hubspot_owner_id",
                    "value": ownerId
                }
            ]
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json()).then((response)=>{
        console.log("result ", response);
        return newCompany(data.company.universalName, response["companyId"]);

    });
}
