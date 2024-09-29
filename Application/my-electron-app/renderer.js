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

document.getElementById('fetch-pokemon').addEventListener('click', fetchPokemon);

async function fetchPokemon() {
    try {
        const response = await fetch('http://127.0.0.1:8000/pokemon');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const pokemonData = await response.json();
        displayPokemon(pokemonData);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
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
