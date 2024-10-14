async function fetchJson(url) {
  let response = await fetch(url);
  let responseJson = await response.json();
  return responseJson;
  // if (response.ok) {
  //   responseJson = await response.json();
  //   return responseJson;
  // } else {
  //   console.log(url, "not available");
  // }
}

async function fetchJsonArray(urlList) {
  let detailsPromises = urlList.results.map((element) => fetchJson(element.url));
  return await Promise.all(detailsPromises);
}

function capitalizeString(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getValueFromInput(containerId) {
  let container = document.getElementById(containerId);
  return container.value;
}

function parseTextInput(textInput) {
  return textInput.trim().toLowerCase();
}

function renderMessage(textMessage) {
  let container = document.getElementById("pokemon-card-container");
  container.innerHTML = `
      <p>${textMessage}</p>
    `;
}

function toggleLoadingStatus() {
  isBusy = isBusy ? false : true;
  loadingBox = document.getElementById("loadingBox");
  loadingBox.classList.toggle("d-none");
}

function getEntryInLanguage(array, lang) {
  let translation;
  translation = array.filter((e) => e.language.name == lang)[0];
  if (!translation) {
    translation = array.filter((e) => e.language.name == "en")[0];
  }
  return translation;
}
