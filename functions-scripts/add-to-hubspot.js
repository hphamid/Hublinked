const addToHubspot = async function () {
    // hide the 2 buttons and display the loader

    createElement("p", "logs", "Fetching LinkedIn Data");
    let data = await fetchLinkedinAll();
    if(!data){
        alert("could not get data");
        return;
    }

    console.log("data", data);
    createElement("p", "logs", "Adding to Hubspot Started");
    let companyId = await createOrUpdateCompany(data, hubSpotOwnerId);
    createElement("p", "logs", "Company Synced " + companyId);
    let contactId = await createOrUpdateContact(data, hubSpotOwnerId);
    createElement("p", "logs", "Contact Synced " + contactId);
    await createAssociations(companyId, contactId);
    createElement("p", "logs", "associations created " + contactId);
    createElement("p", "logs", "getting hubspot messages ");
    let hubspotsMessages = await getHubspotMessages(contactId);
    console.log("hubspot messages", hubspotsMessages);
    createElement("p", "logs", "got messages. last sync " + hubspotsMessages.timeStamp + ", id " + hubspotsMessages.lastMessageId);
    createElement("p", "logs", "adding notes " + data.messages.length);
    await addNotes(hubSpotOwnerId, contactId, companyId, data.messages, hubspotsMessages);
    createElement("p", "logs", "Sync Done");
};
