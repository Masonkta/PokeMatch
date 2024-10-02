const { ipcRenderer } = require('electron');

// Listen for the 'createUserButton' click
document.getElementById('createUserButton').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const pokemonType = document.getElementById('pokemonType').value;
    const bio = document.getElementById('bio').value;

    if (username && pokemonType && bio) {
        sendProfile({ pokemon: username, type: pokemonType, bio: bio });  // Pass all profile values
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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('likeButton').addEventListener('click', fetchPokemon);
    document.getElementById('dislikeButton').addEventListener('click', fetchPokemon);
  });
async function fetchPokemon(currentPokemonId) {
    try {
        console.log('Button clicked');
        const newId = generateRandomId(1, 3, currentPokemonId); 
        const response = await ipcRenderer.invoke('fetch-profile', profile, newId);
        
        if (response.profile && response.profile.length > 0) {
            displayPokemon(response.profile);
            currentPokemonId = newId; // Update the current ID
        } else {
            console.error("No Pokémon data received");
        }
    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}

function displayPokemon(profile) {
    document.querySelector('.pokemon-name').textContent = profile.pokemon;
    document.querySelector('.pokemon-type').textContent = `Type: ${profile.type}`;
    document.querySelector('.pokemon-ability').textContent = `Bio: ${profile.bio}`;
}

