const anilist_Check =
  /https?:\/\/(www\.)?anilist\.co\/(anime|manga)\/(\d+)\/([a-zA-Z0-9-]+)/i;
const inputUrl_Check =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
  const domainName = /([a-z0-9A-Z]\.)*[a-z0-9-]+\.([a-z0-9]{2,24})+(\.co\.([a-z0-9]{2,24})|\.([a-z0-9]{2,24}))*/i;
var dataArray = [];
let currentTabUrl;
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var currentTab = tabs[0];
  currentTabUrl = currentTab.url;
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
      return dataArray;
      // var select_form = document.getElementById("dropdown");
      // select_form.innerHTML = "";
      // storedData.forEach((data) => {
      //   var option = document.createElement("option");
      //   option.value = data.url;
      //   option.textContent = data.externalLink;
      //   select_form.appendChild(option);
      // });
    }
  });
}

// Function to store data
function storeData(dataArray) {
  chrome.storage.local.set({ AnilistConnect: dataArray }, function () {
    document.getElementById("inputError").textContent =
      "Link Connected Successfully";
    retrieveData();
    var dropdown = document.querySelector(".dropdown");
        dropdown.innerHTML = "";
    showConnectedLinks(dataArray);
  });
}

function clearStore() {
  chrome.storage.local.remove("AnilistConnect", function () {
    console.log("Stored data removed");
    var inputErrorTooltip = document.getElementById("inputError");
    inputErrorTooltip.textContent = "Stored data removed";
    // // Clear the dropdown options
    // var selectForm = document.getElementById("dropdown");
    // selectForm.innerHTML = "";
    // var option = document.createElement("option");
    // option.value = "...";
    // selectForm.appendChild(option);
    chrome.storage.local.get("AnilistConnect", function (result) {
      const storedData = result["AnilistConnect"];
      if (storedData == undefined) {
        dataArray = [];
        const inicialdata = {
          url: "...",
          externalLink: "...",
        };
        dataArray.push(inicialdata);
        console.log(dataArray);
        chrome.storage.local.set({ AnilistConnect: dataArray }, function () {});
        var dropdown = document.querySelector(".dropdown");
        dropdown.innerHTML = "";
        showConnectedLinks(dataArray);
      }
    });
  });
}
function showConnectedLinks(dataArray) {
  if (dataArray.length > 1) {
    for (let index = 1; index < dataArray.length; index++) {
      let anilistUrl = dataArray[index].url;
      if (currentTabUrl === anilistUrl) {
        let endUrl = dataArray[index].externalLink;
        var anchor = document.createElement("a");
        anchor.href = endUrl;
        anchor.target = "_blank";

        var dropdownItem = document.createElement("div");
        dropdownItem.className = "dropdown_item";

        var img = document.createElement("img");
        var match = endUrl.match(domainName);
        let imageLink = match[0];
        img.src = "https://"+imageLink+"/favicon.ico";
        img.alt = "image";
        img.id = "dropdown";

        dropdownItem.appendChild(img);

        anchor.appendChild(dropdownItem);

        var dropdown = document.querySelector(".dropdown");

        dropdown.appendChild(anchor);
      }
    }
  }
}

window.onload = function () {
  retrieveData();
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
    showConnectedLinks(dataArray);
  });
};
