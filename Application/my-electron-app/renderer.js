const { ipcRenderer } = require('electron');

// Listen for the 'createUserButton' click
document.getElementById('createUserButton').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const pokemonType = document.getElementById('pokemonType').value;
    const bio = document.getElementById('bio').value;

    if (username && pokemonType && bio) {
        sendProfile({ pokemon: username, type: pokemonType, bio });  // Pass all profile values
    } else {
        console.error("All fields must be filled");
    }
});

// Function to send profile data
async function sendProfile(profile) {
    try {
        const response = await ipcRenderer.invoke('create-profile', {
            pokemon: profile.pokemon, 
            type: profile.type,       
            bio: profile.bio
        });
        console.log(response.message);
    } catch (error) {
        console.error("Error:", error);
    }
}

document.getElementById('likeButton').addEventListener('click', fetchPokemon);
document.getElementById('dislikeButton').addEventListener('click', fetchPokemon);

async function fetchPokemon(currentPokemonId) {
    try {
        const newId = generateRandomId(1, 2, currentPokemonId); 
        const response = await ipcRenderer.invoke('fetch-profile', { id: newId });
        
        if (response.pokemon && response.pokemon.length > 0) {
            displayPokemon(response.pokemon);
            currentPokemonId = newId; // Update the current ID
        } else {
            console.error("No Pokémon data received");
        }
    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}



function displayPokemon(pokemonData) {
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = ''; // Clear previous entries

    pokemonData.forEach(pokemon => {
        const pokemonItem = document.createElement('div');
        pokemonItem.textContent = `${pokemon.name} - Type: ${pokemon.type}`;
        pokemonList.appendChild(pokemonItem);
    });
}
