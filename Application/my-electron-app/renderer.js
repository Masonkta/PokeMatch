const { ipcRenderer } = require('electron');

let poke_count = 0;
const emptyState = document.querySelector('.empty-state');
/*
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
*/
function generateRandomId(min, max, exclude) {
    console.log('Min:',min,"max:",max,"exclude:",exclude)
    let randomId;
    do {
        randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (randomId === exclude); // Ensures it's not the same as the current ID
    return randomId;
}

let currentPokemonId = 0;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('likeButton').addEventListener('click', () => fetchPokemon(currentPokemonId));
    document.getElementById('dislikeButton').addEventListener('click', () => fetchPokemon(currentPokemonId));
});

async function fetchPokemon(current) {
    try {
        console.log('Button clicked');
        currentPokemonId = current;
        console.log(currentPokemonId);
        console.log(current);
        const newId = generateRandomId(0, poke_count - 1, currentPokemonId); 
        const response = await ipcRenderer.invoke('fetch-profile', newId);
        
        if (response.profile) {
            displayPokemon(response.profile);
            currentPokemonId = newId; // Update the current ID
            console.log(currentPokemonId, newId);
        } else {
            console.error("No Pokémon data received");
            console.log(newId)
        }
    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}

function displayPokemon(profile) {
    if (profile) {
        document.querySelector('.pokemon-name').textContent = profile.pokemon;
        document.querySelector('.pokemon-container img').src = profile.image;
        document.querySelector('.pokemon-type').textContent = `Type: ${profile.type}`;
        document.querySelector('.pokemon-ability').textContent = `Bio: ${profile.bio}`;
        emptyState.style.display = 'none';
    } else {
        emptyState.style.display = 'block';
    }
}

// Listen for the 'fetch-pokemon' message from the main process
ipcRenderer.on('fetch-pokemon', (event, randomId) => {
    fetchPokemon(randomId);
});

// Listen for the 'pokemon-count' message from the main process to get poke_count
ipcRenderer.on('pokemon-count', (event, count) => {
    poke_count = count; // Update poke_count with the value from the main process
});