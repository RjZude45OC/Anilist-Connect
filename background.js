const anilist_Check =
  /https?:\/\/(www\.)?anilist\.co\/(anime|manga)\/(\d+)\/([a-zA-Z0-9-]+)/i;
const inputUrl_Check =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
var dataArray = [];
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var currentTab = tabs[0];
  let currentTabUrl = currentTab.url;
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
  document.getElementById("remove").addEventListener("click", function (event) {
    event.preventDefault();
    clearStore();
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
    chrome.storage.local.get("AnilistConnect", function (result) {
      let validate = false;
      const storedData = result["AnilistConnect"];
      if (storedData) {
        storedData.forEach((element) => {
          if (element.externalLink == inputField.value) {
            validate = true;
          }
        });
      }
      if (validate == true) {
        inputErrorTooltip.textContent = "Link Already Connected";
      } else {
        const data = {
          url: url,
          externalLink: externalLink,
        };
        dataArray.push(data);
        storeData(dataArray);
      }
    });
  }
}

function retrieveData() {
  chrome.storage.local.get("AnilistConnect", function (result) {
    const storedData = result["AnilistConnect"];
    console.log("Retrieved stored data:", storedData);
    if (storedData) {
      dataArray = storedData;
      var select_form = document.getElementById("dropdown");
      select_form.innerHTML = "";
      storedData.forEach((data) => {
        var option = document.createElement("option");
        option.value = data.url;
        option.textContent = data.externalLink;
        select_form.appendChild(option);
      });
    }
  });
}

// Function to store data
function storeData(dataArray) {
  chrome.storage.local.set({ AnilistConnect: dataArray }, function () {
    document.getElementById("inputError").textContent =
      "Link Connected Successfully";
    retrieveData();
  });
}

function clearStore() {
  chrome.storage.local.remove("AnilistConnect", function () {
    console.log("Stored data removed");
    // Clear the dropdown options
    var selectForm = document.getElementById("dropdown");
    selectForm.innerHTML = "";
    var option = document.createElement("option");
    option.value = "...";
    selectForm.appendChild(option);
    chrome.storage.local.get("AnilistConnect", function (result) {
      const storedData = result["AnilistConnect"];
      if (storedData == undefined) {
        dataArray = [];
        const inicialdata = {
          url: "...",
          externalLink: "...",
        };
        dataArray.push(inicialdata);
        chrome.storage.local.set({ AnilistConnect: dataArray }, function () {});
      }
    });
  });
}

window.onload = function () {
  chrome.storage.local.get("AnilistConnect", function (result) {
    const storedData = result["AnilistConnect"];
    if (storedData) {
      dataArray = storedData;
    } else {
      const inicialdata = {
        url: "...",
        externalLink: "...",
      };
      dataArray.push(inicialdata);
      chrome.storage.local.set({ AnilistConnect: dataArray }, function () {});
    }
  });
  retrieveData();
};
