// FUNCTION TO CREATE HUBSPOT CONTACT TROUGH API

const loadHubspotUsers = async () => {
    var apiKey = await getApiKey();
    const hubSpotGetUsersUrl = `https://api.hubapi.com/owners/v2/owners?hapikey=${apiKey}`;

    return await getUsers().then(data=>{
            if(data){
                console.log("data existss", data);
                return data;
            }
        console.log("fetching data");
                return fetch(hubSpotGetUsersUrl, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                }).then(response=> response.text())
                .then(response => {

                    return saveUsers(response)
                })
                // If impossible to create the contact, log the response from the Hubspot API who tells us why
                .catch(err => {
                    console.log(err);
                });
            })

};
