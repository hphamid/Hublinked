/**
 * Created by hamid on 10/16/19.
 */
'use strict';

function getApiKey(){
    return get({apiKey: undefined}).then(function(data){return data.apiKey});
}

function setApiKey(apiKey){
    return save({apiKey: apiKey}).then(function(){
        return apiKey;
    });
}

function getPortal(){
    return get({portal: undefined}).then(function(data){return data.portal});
}

function setPortal(portal){
    return save({portal: portal}).then(function(){
        return portal;
    });
}

function getEmail(){
    return get({email: undefined}).then(function(data){return data.email});
}

function setEmail(email){
    return save({email: email}).then(function(){
        return email;
    });
}

function saveUsers(usersStr){
    return save({usersStr: usersStr}).then(function(){
        return JSON.parse(usersStr);
    });
}

function getUsers(){
    return get({usersStr: undefined}).then(function(data){
        if(data.usersStr){
            try{
                return JSON.parse(data.usersStr)
            }catch (e) {}
        }
        return undefined;


    });
}