const { ipcRenderer } = require('electron');

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

async function fetchPokemon(currentPokemonId) {
    try {
        console.log('Button clicked');
        const newId = generateRandomId(0, 12, currentPokemonId); 
        const response = await ipcRenderer.invoke('fetch-profile', newId);
        
        if (response.profile) {
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
    document.querySelector('.pokemon-container img').src = profile.image;
    document.querySelector('.pokemon-type').textContent = `Type: ${profile.type}`;
    document.querySelector('.pokemon-ability').textContent = `Bio: ${profile.bio}`;
}

// Listen for the 'fetch-pokemon' message from the main process
ipcRenderer.on('fetch-pokemon', (event, randomId) => {
    fetchPokemon(randomId);
});
