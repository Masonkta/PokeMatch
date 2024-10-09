const { ipcRenderer } = require('electron');

let poke_count = 0;
const emptyState = document.querySelector('.empty-state');

// Listen for the 'registerUserButton click
document.getElementById('registerUserButton').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const bio = document.getElementById('bio').value;

    if (username && password && bio) {
        sendProfile({ username: username, password: password, bio: bio });  // Pass all profile values
    } else {
        console.error("All fields must be filled");
    }
});

// Ensures the information is provided when it is needed later on to send the request to the FastAPI for registering the new user.
async function sendProfile(profile) {
    try {
        const response = await ipcRenderer.invoke('create-profile', {
            username: profile.username, 
            password: profile.password,       
            bio: profile.bio
        });
        console.log(response.message);
    } catch (error) {
        console.error("Error:", error);
    }
}

// To ensure the next displayed pokemon is randomly selected and not the same as the previously shown one. 
function generateRandomId(min, max, exclude) {
    console.log('Min:',min,"max:",max,"exclude:",exclude)
    let randomId;
    do {
        randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (randomId === exclude); 
    return randomId;
}

let currentPokemonId = 0;

// Button Interactiblity Scripts
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('likeButton').addEventListener('click', () => fetchPokemon(currentPokemonId));
    document.getElementById('dislikeButton').addEventListener('click', () => fetchPokemon(currentPokemonId));
});

// The inital sequence of request that lead to the datbaase in order to properly display a new pokemon to the user.
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
// Ensures the user is being provided with visual information of the current pokemon.
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