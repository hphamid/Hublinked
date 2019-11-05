openInHubspotButton.addEventListener("click", e => {
    let accountData = undefined;
    showLoading();
    fetchLinkedinAccount().then(account=>{
        return getCurrentContact(account)
    }).then((account)=>{
        accountData = account;
        return getPortal()
    }).then((portal)=>{
        if(accountData && portal)
            openInNewTab(`https://app.hubspot.com/contacts/${portal}/contact/${accountData}`);
        else
            alert("user not found in hubspot")
        hideLoading();
    })
});

// listen to add to hubspot button, then launch the function
syncWithHubspotButton.addEventListener("click", e => {
    showLoading();
    addToHubspot().then(done=>{
        hideLoading();
        console.log("saved")
    }).catch(()=>{
        hideLoading();
        alert("failed");
    });

});
