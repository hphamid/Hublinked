console.log("startup");
let contactData = new ContactDataHolder(5 * 60 * 1000); //5min
let companyData = new CompanyDataHolder(5 * 60 * 1000); //5min

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("message", request);
        if(request.action === "contact"){
            if(request.method === "linkedin"){
                contactData.getContactByLinkedinId(request.linkedinId).then(id=>{
                    sendResponse(id)
                });
            }else if(request.method === "new"){
                contactData.newContact(request.hubspotId, request.linkedinId).then(id=>{
                    sendResponse(request.hubspotId);
                });
            }else if(request.method === "email"){
                contactData.getContactByEmail(request.email).then(id=>{
                    sendResponse(id)
                });
            }
            return true;
        }else if(request.action === "company"){
            if(request.method === "universalName"){
                companyData.getCompanyByUniversalName(request.universalName).then(id=>{
                    sendResponse(id)
                });
            }else if(request.method === "domain"){
                companyData.getCompanyByDomain(request.domain).then(id=>{
                    sendResponse(id)
                });
            }else if(request.method === "new"){
                companyData.newCompany(request.universalName, request.id).then(id=>{
                    sendResponse(request.hubspotId);
                });
            }
            return true;
        }
    });
