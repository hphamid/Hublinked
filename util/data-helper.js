/**
 * Created by hamid on 10/21/19.
 */
'use strict';
function getLinkedinId(hubspotId) {
    return new Promise(function (resolve, reject) {
        chrome.runtime.sendMessage({action: "contact", method: "hubspot", hubspotId: hubspotId}, function (response) {
            resolve(response);
        });
    });
}

function getHubspotId(linkedinId){
    return new Promise(function(resolve, reject){
        chrome.runtime.sendMessage({action: "contact", method: "linkedin", linkedinId: linkedinId}, function(response) {
            resolve(response);
        });
    });

}

function newContact(hubspotId, linkedinId){
    return new Promise(function(resolve, reject){
        chrome.runtime.sendMessage({action: "contact", method: "new", hubspotId: hubspotId, linkedinId: linkedinId}, function(response) {
            resolve();
        });
    });
}
