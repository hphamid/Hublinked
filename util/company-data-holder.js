/**
 * Created by hamid on 7/28/19.
 */
'use strict';

function CompanyDataHolder(updateInterval){ //update interval in ms
    this.reset(updateInterval);
}

CompanyDataHolder.prototype.getCompanyByUniversalName = async function(universalName){
    console.log("loading by universal name", universalName);
    await this.load();
    return this.data.universalName[universalName];
};


CompanyDataHolder.prototype.newCompany = async function(universalName, vid){
    this.data.universalName[universalName] = vid;
    await this.save();
};

CompanyDataHolder.prototype.getCompanyByDomain = async function(domain){
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api key not found";
    }
    let url = `https://api.hubapi.com/companies/v2/domains/${domain}/companies?hapikey=${apiKey}`;
    return await fetch(url, {
        method: "POST",
        body: JSON.stringify({
                "limit": 1,
                "requestOptions": {
                    "properties": [
                        "domain",
                    ]
                },
                "offset": {
                    "isPrimary": true,
                    "companyId": 0
                }
            }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json())
        .then(result=>{
        if(result && result.results && result.results.length > 0){
            return result.results[0]["companyId"];
        }else{
            return;
        }
    });
};

CompanyDataHolder.prototype.reset = function(updateInterval){
    this.data = {universalName:{}, lastUpdate:undefined, loaded:false};
    this.lastLoad = undefined;
    this.updateInterval = updateInterval;
};

CompanyDataHolder.prototype.getNextUpdateTime = async function(){
  if(this.lastLoad){
      return new Date(this.lastLoad + this.updateInterval);
  }else{
      return new Date();
  }
};

CompanyDataHolder.prototype.load = async function(){
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

CompanyDataHolder.prototype.getAll = async function(){
    this.data.universalName = {};
    await this.getData(this.getCompanies);
    this.data.lastUpdate = new Date().getTime();
    this.data.loaded = true;
    await this.save();
};

CompanyDataHolder.prototype.save = async function(){
    await save({companies: this.data});
};

CompanyDataHolder.prototype.get = async function(){
    let result = await get({companies: undefined});
    return result.companies;
};

CompanyDataHolder.prototype.checkForChanges = async function(){
    await this.getData(this.getChangedCompanies);
    await this.getData(this.getNewCompanies);
    this.data.lastUpdate = new Date().getTime();
    await this.save();
};


CompanyDataHolder.prototype.getData = async function(method){
    let _this = this;
    let apiKey = await getApiKey();
    if(!apiKey){
        throw "api key not found";
    }
    console.log("apiKey");
    let hasMore = false;
    let offset = undefined;
    do{
        let result = await method.apply(this, [apiKey, offset]);
        console.log("result", result);
        if(result.results){
            result.results.forEach(item=>{
                if(item["properties"]["linkedin_uname"]&& item["properties"]["linkedin_uname"].value){
                    _this.data.universalName[item["properties"]["linkedin_uname"].value] = item["companyId"];
                }
            })
        }else if(result.companies){ //get all returns in company but changed and modified return results
            result.companies.forEach(item=>{
                if(item["properties"]["linkedin_uname"]&& item["properties"]["linkedin_uname"].value){
                    _this.data.universalName[item["properties"]["linkedin_uname"].value] = item["companyId"];
                }
            })
        }
        hasMore = result["has-more"] || result["hasMore"];
        offset = result["offset"];

    }while(hasMore);
};

CompanyDataHolder.prototype.getCompanies = async function(apiKey, offset){
    let url = `https://api.hubapi.com/companies/v2/companies/paged?hapikey=${apiKey}&properties=linkedin_uname&properties=website&limit=100`;
    if(offset){
        url = url +"&offset=" + offset;
    }
    return await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json());
};

CompanyDataHolder.prototype.getChangedCompanies = async function(apiKey, offset){
    let url = `https://api.hubapi.com/companies/v2/companies/recent/modified?hapikey=${apiKey}&count=100&since=${this.data.lastUpdate}`;
    if(offset){
        url = url +"&offset=" + offset;
    }
    return await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json());
};

CompanyDataHolder.prototype.getNewCompanies = async function(apiKey, offset){
    let url = `https://api.hubapi.com/companies/v2/companies/recent/created?hapikey=${apiKey}&count=100&since=${this.data.lastUpdate}`;
    if(offset){
        url = url +"&offset=" + offset;
    }
    return await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    }).then(response => response.json());
};