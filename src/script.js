let pokemonIndex = [];
let speciesDetails = [];
let pokemonSelection = [];
let pokemonCount = 1025;
let currentPokemon;
let currentStartIndex = 1;
let currentShowCount = 12;
let isBusy = false;
let updateIndex = true;
let currentStatCategory = "baseStats";
let selectedLanguage = "de";s

async function init() {
  await getSelectionById();
  renderPokemonCards();
  if (updateIndex == false) {
    console.log(
      "Updating index is",
      updateIndex,
      ". Will always use existing data from local store."
    );
  }
  console.log("setting up index");
  await setupPokemonIndex();
  console.log("index ready");
  pokemonCount = pokemonIndex.count;
}

function switchLanguage() {
  if (selectedLanguage == "de") {
    selectedLanguage = "en";
    document.querySelector(".lang-btn").innerHTML = "EN";
  } else {
    selectedLanguage = "de";
    document.querySelector(".lang-btn").innerHTML = "DE";
  }
}

// Working with index and keep pokemon count up to date (there might be new ones added in future)

// create an index of available pokemon, make sure that info is up to date
async function setupPokemonIndex() {
  loadStoredIndex();
  if (pokemonIndex.length == 0) {
    toggleLoadingStatus();
    console.log("setting up index for search");
    await updatePokemonNameIndex();
    toggleLoadingStatus();
  } else if (updateIndex) {
    let checkCount = await checkPokemonCount();
    if (checkCount != pokemonIndex.results.length) {
      console.log("updating index");
      updatePokemonNameIndex();
    }
  }
}

async function getSpeciesDetails() {
  speciesDetails = await fetchJsonArray(pokemonIndex);
  console.log(speciesDetails);
}

async function setupTranslationIndex() {

}

async function checkPokemonCount() {
  // use shortest list possible (1 element) for comparison to avoid bigger download
  let checkCount = await fetchJson(
    "https://pokeapi.co/api/v2/pokemon-species?offset=0&limit=1"
  );
  return checkCount.count;
}

async function updatePokemonNameIndex() {
  pokemonIndex = await fetchJson(
    `https://pokeapi.co/api/v2/pokemon-species?offset=0&limit=${pokemonCount}`
  );
  // console.log("success! new index is:", pokemonIndex);
  if (pokemonIndex.count) {
    savePokemonIndex();
  }
}

function savePokemonIndex() {
  let indexAsText = JSON.stringify(pokemonIndex);
  localStorage.setItem(`pokemonIndex`, indexAsText);
}

function loadStoredIndex() {
  let indexAsString = localStorage.getItem(`pokemonIndex`);
  if (indexAsString) {
    pokemonIndex = JSON.parse(indexAsString);
  } else {
    // console.log("nothing found in storage");
  }
}

// loading selected Pokemon

let pokedexUrl = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";
let pokemonSelectionNew = [];

async function fetchPokemonData() {
  let indexUrl = `https://pokeapi.co/api/v2/pokemon?offset=${
    currentStartIndex - 1
  }&limit=${currentShowCount}`;
  let urlList = await fetchJson(indexUrl);
  let pokemonDetailsPromises = urlList.results.map((pokemon) => fetchJson(pokemon.url));
  allPokemonDetails = await Promise.all(pokemonDetailsPromises);
  console.log(allPokemonDetails);
}

async function getSelectionById() {
  let urlList = await fetchJson(
    `https://pokeapi.co/api/v2/pokemon?offset=${
      currentStartIndex - 1
    }&limit=${currentShowCount}`
  );
  pokemonSelection = await fetchJsonArray(urlList);
}

function renderPokemonCards() {
  let container = document.getElementById("pokemon-card-container");
  container.innerHTML = ``;
  for (let i = 0; i < pokemonSelection.length; i++) {
    const pokemon = pokemonSelection[i];
    container.innerHTML += insertCardHTML(pokemon, i);
    addingTypeColor(pokemon, `card${pokemon.id}`);
  }
  addShowMoreButton();
}

function insertPokemonTypes(pokemon) {
  let insertTypes = "";
  for (types of pokemon.types) {
    insertTypes += `<img class="type-icon" src="./img/${
      types.type.name
    }.png", alt="${types.type.name.toUpperCase()}", title="type: ${types.type.name}">`;
  }
  return insertTypes;
}

function insertBestImage(pokemon) {
  if (pokemon.sprites.other.dream_world.front_default) {
    return pokemon.sprites.other.dream_world.front_default;
  } else if (pokemon.sprites.other.home.front_default) {
    return pokemon.sprites.other.home.front_default;
  } else {
    return pokemon.sprites.front_default;
  }
}

function addingTypeColor(pokemon, cardId) {
  card = document.getElementById(cardId);
  card.style.background =
    pokemon.types.length == 1
      ? `linear-gradient(to right top, ${
          colours[pokemon.types[0].type.name]
        }, 7%, rgb(30,30,30), 86%, ${colours[pokemon.types[0].type.name]})`
      : `linear-gradient(60deg, ${
          colours[pokemon.types[0].type.name]
        }, 7%, rgb(30,30,30), 86%, ${colours[pokemon.types[1].type.name]})`;
}

function addShowMoreButton() {
  document.getElementById("show-more-btn").classList.remove("d-none");
  if (pokemonSelection[pokemonSelection.length - 1].id == 1025) {
    document.getElementById("show-more-btn").classList.add("d-none");
  }
}

async function searchByPokemonId() {
  if (isBusy) {
    confirmNewSearch();
  } else {
    toggleLoadingStatus();
    document.getElementById("pokemon-card-container").innerHTML = "";
    pokemonSelection = [];
    currentStartIndex = getValueFromInput("input-start-index")
      ? parseInt(getValueFromInput("input-start-index"))
      : 1;
    currentShowCount = parseInt(getValueFromInput("input-show-count"));
    await getSelectionById();
    renderPokemonCards();
    toggleLoadingStatus();
  }
}

function confirmNewSearch() {
  if (
    confirm(
      `Neue Suche starten?
      Servers seem to be busy, start new search?
      (Might cause double entries.)`
    )
  ) {
    toggleLoadingStatus();
    searchByPokemonId();
  }
}

async function showMorePokemon() {
  if (isBusy) {
    console.log("Still working, try again later");
  } else {
    toggleLoadingStatus();
    if (currentStartIndex + currentShowCount <= 1025) {
      currentStartIndex = currentShowCount + currentStartIndex;
      await getSelectionById();
      renderPokemonCards();
    }
    toggleLoadingStatus();
  }
}

document.getElementById("input-name").addEventListener("keyup", (event) => {
  if (event.key != "ArrowLeft" && event.key != "ArrowRight") {
    searchPokemonName();
  }
});

async function searchPokemonName() {
  let nameInput = getValueFromInput("input-name");
  nameInput = parseTextInput(nameInput);
  if (nameInput.length >= 3 && !isBusy) {
    toggleLoadingStatus();
    let matchedIds = evaluateMatches(nameInput);
    if (matchedIds) {
      await renderSelectionByName(matchedIds);
    }
    toggleLoadingStatus();
  } else if (nameInput.length == 0) {
    searchByPokemonId();
  }
  checkInputUpToDate(nameInput);
}

function evaluateMatches(nameInput) {
  let matches = findNameMatches(nameInput);
  if (matches.length > 0) {
    let matchedIds = extractPokemonIds(matches);
    renderMessage(`found ${matchedIds.length} pokemon.`);
    return matchedIds;
  } else {
    renderMessage("No matches.");
    return false;
  }
}

function checkInputUpToDate(nameInput) {
  if (nameInput != getValueFromInput("input-name")) {
    searchPokemonName();
  }
}

function findNameMatches(input, searchMode = "includes") {
  let result = "";
  result = pokemonIndex.results.filter((element) => {
    switch (searchMode) {
      case "startsWith": {
        return element.name.startsWith(input);
      }
      default:
        return element.name.includes(input);
    }
  });
  return result;
}

function extractPokemonIds(speciesList) {
  let idList = [];
  for (species of speciesList) {
    let splitElements = species.url.split("/");
    idList.push(splitElements[splitElements.length - 2]);
  }
  return idList;
}

async function renderSelectionByName(matchedIds) {
  pokemonSelection = [];
  for (id of matchedIds) {
    let selected = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`);
    pokemonSelection.push(selected);
  }
  renderPokemonCards();
  document.getElementById("show-more-btn").classList.add("d-none");
}

function clearInput() {
  let input = document.getElementById("input-name");
  input.value = "";
  searchByPokemonId();
}

function togglePopup() {
  let popup = document.getElementById("popupBigCard");
  popup.classList.toggle("d-none");
}

function showBigCard(i) {
  let bigCard = document.getElementById("bigCard");
  currentPokemon = i;
  pokemon = pokemonSelection[currentPokemon];
  togglePopup();
  bigCard.innerHTML = insertBigCardHTML(pokemon);
  addingTypeColor(pokemon, `bigCard${pokemon.id}`);
  renderStatsContainer(pokemon);
  addNameTranslation(pokemon, selectedLanguage);
}

async function addNameTranslation(pokemon, selectedLanguage) {
  if (selectedLanguage != "en") {
    let nameContainer = document.querySelector("#bigCard h2");
    let pokemonSpecies = await fetchJson(pokemon.species.url);
    translatedName = getEntryInLanguage(pokemonSpecies.names, selectedLanguage).name;
    nameContainer.innerHTML += `
    / ${translatedName}
  `;
  }
}

function renderStatsContainer() {
  let statsContainer = document.getElementById("bigCardStats");
  statsContainer.innerHTML = insertStatsHTML();
  renderSelectedStats();
}

function renderSelectedStats() {
  switch (currentStatCategory) {
    case "abilities":
      renderAbilities();
      break;
    case "about":
      renderAbout();
      break;
    default:
      renderBaseStats();
      break;
  }
}

function setStatHeadingBold() {
  let headings = document.getElementsByClassName("stats-heading");
  let headingId =
    currentStatCategory == "abilities"
      ? "headingAbilities"
      : currentStatCategory == "about"
      ? "headingAbout"
      : "headingBase";
  let selected = document.getElementById(headingId);
  for (heading of headings) {
    heading.classList.remove("bold");
  }
  selected.classList.add("bold");
}

function renderBaseStats() {
  let container = document.getElementById("statsContent");
  let pokemon = pokemonSelection[currentPokemon];
  currentStatCategory = "baseStats";
  setStatHeadingBold();
  container.innerHTML = "";
  for (let i = 0; i < pokemon.stats.length; i++) {
    stats = pokemon.stats[i];
    container.innerHTML += insertBaseStatsHTML(stats);
    calcBarWidth(stats);
  }
}

function calcBarWidth(stats) {
  let statBar = document.getElementById(`stats-bar-${stats.stat.name}`);
  stat = `${stats.stat.name}`;
  statPercent = (stats.base_stat / baseStatAverage[stat]) * 100;
  if (statPercent > 100) {
    statPercent = 100;
    statBar.style.border = "1px solid yellow";
    statBar.title = "above average";
  }
  statBar.style.width = statPercent * 0.95 + "%";
}

async function renderAbilities() {
  let container = document.getElementById("statsContent");
  let pokemon = pokemonSelection[currentPokemon];
  currentStatCategory = "abilities";
  setStatHeadingBold();
  container.innerHTML = "";
  for (let i = 0; i < pokemon.abilities.length; i++) {
    if (pokemon.abilities[i].is_hidden == false) {
      const ability = pokemon.abilities[i].ability;
      container.innerHTML += insertAbilityHTML(ability);
    }
  }
  await renderAbilityDetails(pokemon);
}

async function renderAbilityDetails(pokemon) {
  let headers = document.getElementsByClassName("ability-header");
  let descriptionContainers = document.getElementsByClassName("ability-description");
  for (let i = 0; i < pokemon.abilities.length; i++) {
    if (pokemon.abilities[i].is_hidden == false) {
      const ability = pokemon.abilities[i].ability;
      const descrContainer = descriptionContainers[i];
      const headerContainer = headers[i];
      let abilityJson = await fetchJson(ability.url);
      let description = await getDescription(abilityJson);
      let nameTranslation = await getEntryInLanguage(abilityJson.names, selectedLanguage)
        .name;
      headerContainer.innerHTML += " / " + nameTranslation;
      descrContainer.innerHTML = description;
    }
  }
}

async function getDescription(abilityJson) {
  let entries;
  if (abilityJson.effect_entries.length > 0) {
    entries = abilityJson.effect_entries;
    return getEntryInLanguage(entries, selectedLanguage).short_effect;
  } else {
    entries = abilityJson.flavor_text_entries;
    return getEntryInLanguage(entries, selectedLanguage).flavor_text;
  }
}

async function renderAbout() {
  let container = document.getElementById("statsContent");
  let pokemon = pokemonSelection[currentPokemon];
  currentStatCategory = "about";
  setStatHeadingBold();
  container.innerHTML = insertLoadingSpinnerHTML();
  let pokemonSpecies = await fetchJson(pokemon.species.url);
  for (let i = pokemonSpecies.flavor_text_entries.length - 1; i >= 0; i--) {
    entry = pokemonSpecies.flavor_text_entries[i];
    if (entry.language.name == selectedLanguage) {
      container.innerHTML = `
        <p>${entry.flavor_text}</p>
      `;
      break;
    }
  }
}

function showNextPokemon() {
  togglePopup();
  currentPokemon++;
  currentPokemon = currentPokemon == pokemonSelection.length ? 0 : currentPokemon;
  showBigCard(currentPokemon);
}

function showPreviousPokemon() {
  togglePopup();
  currentPokemon--;
  currentPokemon = currentPokemon < 0 ? pokemonSelection.length - 1 : currentPokemon;
  showBigCard(currentPokemon);
}

document.addEventListener("keydown", (event) => {
  if (!document.getElementById("popupBigCard").classList.contains("d-none")) {
    if (event.key == "ArrowRight") {
      showNextPokemon();
    } else if (event.key == "ArrowLeft") {
      showPreviousPokemon();
    }
  }
});
