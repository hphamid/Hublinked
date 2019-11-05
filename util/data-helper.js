/**
 * Created by hamid on 10/21/19.
 */
'use strict';

function getContactByLinkedinId(linkedinId){
    return new Promise(function(resolve, reject){
        chrome.runtime.sendMessage({action: "contact", method: "linkedin", linkedinId: linkedinId}, function(response) {
            resolve(response);
        });
    });

}

function newContact(linkedinId, hubspotId){
    return new Promise(function(resolve, reject){
        chrome.runtime.sendMessage({action: "contact", method: "new", hubspotId: hubspotId, linkedinId: linkedinId}, function(response) {
            resolve(hubspotId);
        });
    });
}

function getContactByEmail(email){
    return new Promise(function(resolve, reject){
        chrome.runtime.sendMessage({action: "contact", method: "email", email: email}, function(response) {
            console.log("contact by domain", response);
            resolve(response);
        });
    });

}

function getCompanyByUniversalName(universalName) {
    return new Promise(function (resolve, reject) {
        chrome.runtime.sendMessage({action: "company", method: "universalName", universalName:universalName}, function (response) {
            resolve(response);
        });
    });
}

function getCompanyByDomain(domain){
    return new Promise(function(resolve, reject){
        chrome.runtime.sendMessage({action: "company", method: "domain", domain: domain}, function(response) {
            console.log("compnay by domain", response);
            resolve(response);
        });
    });

}

function newCompany(universalName, id){
    return new Promise(function(resolve, reject){
        chrome.runtime.sendMessage({action: "company", method: "new", universalName: universalName, id: id}, function(response) {
            resolve(id);
        });
    });
}
