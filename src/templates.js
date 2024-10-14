function insertLoadingSpinnerHTML() {
  return `
      <div class="loading-box rotate" id="loadingBox">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;
}

function insertCardHTML(pokemon, i) {
  return `
      <div class="card small-card flex-col" id="card${
        pokemon.id
      }" onclick="showBigCard(${i})">
        <div class="card-header flex-col widthLimit">
          <span class="card-id widthLimit">#${pokemon.id}</span>
          <h2>${capitalizeString(pokemon.species.name)}</h2>
        </div>
        <div class="card-details flex-col widthLimit">
          <!-- <img src="${pokemon.sprites.other.dream_world.front_default}"> -->
          <!-- <img src="${pokemon.sprites.other.home.front_default}"> -->
          <img src="${insertBestImage(pokemon)}" class="pokemon-icon-small">
          <div class="flex-space widthLimit types-container">${insertPokemonTypes(
            pokemon
          )}</div>
        <div>
      </div>
      `;
}

function insertBigCardHTML(pokemon) {
  return `
      <div class="big-card card flex-col" id="bigCard${pokemon.id}">
        <div class="card-header flex-col widthLimit">
          <span class="card-id widthLimit">#${pokemon.id}</span>
          <h2>${capitalizeString(pokemon.species.name)}</h2>
        </div>
        <div class="big-card-details flex-col widthLimit">
          <img src="${insertBestImage(pokemon)}" class="pokemon-icon">
        
        </div>
        <div class="stats-container flex-col widthLimit" onclick="event.stopPropagation()">
          
          <div class="flex-col widthLimit stats-inner-container" id="bigCardStats">
          </div>
        </div>
      </div>
    `;
}

function insertStatsHTML() {
  return `
      <nav class="stats-nav flex-space widthLimit">
        <span class="stats-heading button" onclick="renderBaseStats()" id="headingBase">Stats</span>  
        <span class="stats-heading button" onclick="renderAbout()" id="headingAbout">About</span>  
        <span class="stats-heading button" onclick="renderAbilities()" id="headingAbilities">Abilities</span>
      </nav>
      <div id="statsContent" class="stats-content widthLimit flex-col">
      </div>
      
    `;
}

function insertBaseStatsHTML(stats) {
  return `
      <div class="widthLimit flex-space">
        <span class="stats-label">${stats.stat.name.replace("special-", "sp. ")}</span>
        <div class="stats-bar widthLimit">
          <div class="stats-bar-color 
                stat-${stats.stat.name}" 
                id="stats-bar-${stats.stat.name}">
          </div>
        </div>
        <span class="stats-value "> ${stats.base_stat}</span>
      </div>
    `;
}

function insertAbilityHTML(ability) {
  return `
    <div class="flex-col">
      <b class="ability-header">${capitalizeString(ability.name)}</b>
      <p class="ability-description"></p>
    </div>
  `;
}
