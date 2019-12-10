/**
 * Created by hamid on 7/28/19.
 */
'use strict';

function ContactDataHolder(updateInterval){ //update interval in ms
    this.reset(updateInterval);
}

ContactDataHolder.prototype.getContactByLinkedinId = async function(id){
    await this.load();
    return this.data.linkedinId[id];
};


ContactDataHolder.prototype.newContact = async function(vid, linkedinId){
    this.data.linkedinId[linkedinId] = vid;
    await this.save();
};

ContactDataHolder.prototype.getContactByEmail = async function(email){
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api key not found";
    }

    let url = `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${apiKey}`;
    return await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json())
        .then(result=>{
            if(result){
                return result["vid"];
            }else{
                return;
            }
        });
};


ContactDataHolder.prototype.reset = function(updateInterval){
    this.data = {linkedinId:{}, lastUpdate:undefined, loaded:false};
    this.lastLoad = undefined;
    this.updateInterval = updateInterval;
};



ContactDataHolder.prototype.getNextUpdateTime = async function(){
  if(this.lastLoad){
      return new Date(this.lastLoad + this.updateInterval);
  }else{
      return new Date();
  }
};

ContactDataHolder.prototype.load = async function(){
    if(new Date().getTime() < this.getNextUpdateTime()){
        console.log("ignore");
        return;
    }
    console.log("getting from storage", this.data);
    let data = await this.get();
    if(data)
        this.data = data;
    console.log("test", this.data);
    if(this.data.loaded){
        await this.checkForChanges();
        console.log("checking for changes", this.data);
    }else{
        await this.getAll();
        console.log("getAll", this.data);
    }
};

ContactDataHolder.prototype.getAll = async function(){
    await this.getData(this.getContacts);
    this.data.lastUpdate = new Date().getTime();
    this.data.loaded = true;
    await this.save();
};

ContactDataHolder.prototype.save = async function(){
    await save({contacts: this.data});
};

ContactDataHolder.prototype.get = async function(){
    let result = await get({contacts: undefined});
    return result.contacts;
};

ContactDataHolder.prototype.checkForChanges = async function(){
    await this.getData(this.getChangedContacts);
    await this.getData(this.getNewContacts);
    this.data.lastUpdate = new Date().getTime();
    await this.save();
};


ContactDataHolder.prototype.getData = async function(method){
    let _this = this;
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api key not found";
    }
    let hasMore = false;
    let offset = undefined;
    let time = _this.data.lastUpdate;
    do{
        let contacts = await method.apply(this, [apiKey, offset]);
        if(time && contacts["time-offset"] && time > contacts["time-offset"]){
            break;
        }
        if(contacts.contacts){
            contacts.contacts.forEach(contact=>{
                if(contact["properties"]["linkedin_uid"]&& contact["properties"]["linkedin_uid"].value){
                    _this.data.linkedinId[contact["properties"]["linkedin_uid"].value] = contact.vid;
                }
            })
        }
        hasMore = contacts["has-more"];
        if(offset == contacts["vid-offset"]){
            hasMore = false; //hubspot bug...
        }
        offset = contacts["vid-offset"];

    }while(hasMore);
};

ContactDataHolder.prototype.getContacts = async function(apiKey, offset){
    let url = `https://api.hubapi.com/contacts/v1/lists/all/contacts/all?hapikey=${apiKey}&property=linkedin_uid&property=email&count=100`;
    if(offset){
        url = url +"&vidOffset=" + offset;
    }
    return await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json());
};

ContactDataHolder.prototype.getChangedContacts = async function(apiKey, offset){
    let url = `https://api.hubapi.com/contacts/v1/lists/recently_updated/contacts/recent?hapikey=${apiKey}&property=linkedin_uid&property=email&count=100`;
    if(offset){
        url = url +"&vidOffset=" + offset;
    }
    return await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json());
};

ContactDataHolder.prototype.getNewContacts = async function(apiKey, offset){
    let url = `https://api.hubapi.com/contacts/v1/lists/all/contacts/recent?hapikey=${apiKey}&property=linkedin_uid&property=email&count=100`;
    if(offset){
        url = url +"&vidOffset=" + offset;
    }
    return await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json());
};