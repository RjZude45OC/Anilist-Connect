const anilist_Check =
  /https?:\/\/(www\.)?anilist\.co\/(anime|manga)\/(\d+)\/([a-zA-Z0-9-]+)/i;
const inputUrl_Check =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var currentTab = tabs[0];
  let currentTabUrl = currentTab.url;
  console.log(currentTabUrl);
  var match = currentTabUrl.match(anilist_Check);
  if (match) {
    document.getElementById("anilist_link").textContent = currentTabUrl;
    let id = match[3];
    let name = match[4];
    name = name.replace(/-/g, " ");
    console.log("ID:", id);
    console.log("Name:", name);
    document.getElementById("anilist_link").textContent = name;
  } else {
    document.getElementById("anilist_link").textContent = "Not found";
  }

  // Event listener for form submission
  document
    .getElementById("link_form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      handleSubmit(currentTabUrl);
    });
});

// Function to handle form submission
function handleSubmit(currentTabUrl) {
  let url = currentTabUrl;
  var inputField = document.getElementById("input");
  var anilist_match = inputField.value.match(inputUrl_Check);
  var match = currentTabUrl.match(anilist_Check);
  var inputErrorTooltip = document.getElementById("inputError");
  inputErrorTooltip.textContent = "";
  if (!match) {
    inputErrorTooltip.textContent = "AniList URL Not Found";
  } else if (!anilist_match) {
    inputErrorTooltip.textContent = "Invalid Link To Connect";
  } else {
    let externalLink = inputField.value;
    storeData(url, externalLink);
  }
}

function retrieveData() {
  chrome.storage.local.get("AnilistConnect", function (result) {
    const storedData = result["AnilistConnect"];
    console.log("Retrieved stored data:", storedData);

    if (storedData) {
      const storedUrl = storedData.url;
      const storedExternalLink = storedData.externalLink;
      var json = JSON.stringify(storedData);
      alert(json);
      return storedData;
      
    }
  });
}

// Function to store data
function storeData(url, externalLink) {
  const data = {
    url: url,
    externalLink: externalLink,
  };
  chrome.storage.local.set({ AnilistConnect: data }, function () {
    document.getElementById("inputError").textContent = "Link Connected Successfully";
    retrieveData(); 
  });
}

window.onload = function() {
  const storedData = retrieveData();
  if (storedData) {
    const storedUrl = storedData.url;
    const storedExternalLink = storedData.externalLink;
    alert("AniList Link: " + storedUrl + "\n" + "External Link: " + storedExternalLink);
    document.getElementById("anilist_link").textContent = storedUrl;
    document.getElementById("input").value = storedExternalLink;
  }
};