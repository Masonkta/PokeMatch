const { ipcRenderer } = require('electron');

let poke_count = 0;
const emptyState = document.querySelector('.empty-state');
const loginMessage = document.querySelector('.loginMessage');

let insession = false;

// Listen for the 'createUserButton' click
document.getElementById('createUserButton').addEventListener('click', () => {
    const username = document.getElementById('createUserName').value;
    const password = document.getElementById('createUserPassword').value;
    const bio = document.getElementById('bioProfile').value;

    if (username && password && bio) {
        sendProfile({ username: username, password: password, bio: bio });  // Pass all profile values
    } else {
        console.error("All fields must be filled");
    }
});

// Ensures the information is provided when it is needed later on to send the request to the FastAPI for registering the new user.
async function sendProfile(profile) {
    try {
        const response = await ipcRenderer.invoke('create-user-profile', {
            username: profile.username, 
            password: profile.password,       
            bio: profile.bio
        });
        console.log(response.message);
    } catch (error) {
        console.error("Error:", error);
    }
}

// Listen for the 'passwordLoginButton' click
document.getElementById('passwordLoginButton').addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username && password) {
        retrieveProfile(username, password);  // Pass username and password values
    } else {
        console.error("All fields must be filled");
    }
});

// Ensures the information is provided when it is needed later on to send the request to the FastAPI for receiving user.
async function retrieveProfile(username, password) {
    try {
        const response = await ipcRenderer.invoke('login_user', username, password);

        if (response.profile) {
            console.log('HERE');
            loginSuccessMessage(response.profile);
            fetchPokemon(currentPokemonId);
        }   
    } catch (error) {
        console.error("Error:", error);
    }
}

// Sets the login message to be displayed when the user is logged in.
async function loginSuccessMessage(profile) {
    if (profile) {
        loginMessage.style.display = 'block';
    } else {
        loginMessage.style.display = 'none';
    }
}

function generateRandomId(min, max, exclude, attemptedIds) {
    let randomId;
    do {
        randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (randomId === exclude || attemptedIds.has(randomId)); // Check against the attempted IDs set
    return randomId;
}


let currentPokemonId = 0;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('likeButton').addEventListener('click', async () => {
        if (await checkIfUserLoggedIn()) {
            likePokemon(currentPokemonId); // Like the current Pokemon
            fetchPokemon(currentPokemonId); // Fetch the next Pokemon
        } else {
            console.error("Not Logged In");
            console.log(await checkIfUserLoggedIn());
        }
    });

    document.getElementById('dislikeButton').addEventListener('click', async () => {
        if (await checkIfUserLoggedIn()) {
            dislikePokemon(currentPokemonId); // Dislike the current Pokemon
            fetchPokemon(currentPokemonId); // Fetch the next Pokemon
        } else {
            console.error("Not Logged In");
            console.log(await checkIfUserLoggedIn());
        }
    });
});

// The initial sequence of requests that lead to the database to properly display a new Pokémon to the user.
async function fetchPokemon(current) {
    try {
        console.log('Button clicked');
        currentPokemonId = current;
        console.log(`Current Pokémon ID: ${currentPokemonId}`);
        
        let newId;
        let response;
        const uniquePokemonCount = poke_count; // Total number of unique Pokémon
        let attempts = 0;

        // Store already attempted IDs to prevent infinite loops
        const attemptedIds = new Set();

        // Loop to find a new Pokémon profile
        do {
            // Generate a new ID that hasn't been attempted yet
            newId = generateRandomId(1, uniquePokemonCount, currentPokemonId, attemptedIds);
            response = await ipcRenderer.invoke('fetch-pokemon-profile', newId);
            console.log(`Trying Pokémon ID: ${newId}`);
            attempts++;

            // Add newId to attempted IDs
            attemptedIds.add(newId);

            // Check if we have tried all unique Pokémon
            if (attempts >= uniquePokemonCount-1) {
                console.error("No more Pokémon in this region.");
                alert("No more Pokémon in this region."); // Notify the user
                return; // Exit the function
            }

        } while (!response.profile && attempts < uniquePokemonCount); // Loop until a valid profile is found or max attempts reached

        if (response.profile) {
            displayPokemon(response.profile);
            currentPokemonId = newId; // Update the current ID
            console.log(`Displayed Pokémon ID: ${currentPokemonId}, New ID: ${newId}`);

            // Reset attempted IDs for future fetches
            attemptedIds.clear(); // Clear the set after a valid profile is found
        } else if (attempts >= uniquePokemonCount) {
            console.error("No more Pokémon in this region.");
            alert("No more Pokémon in this region."); // Notify the user
            return; // Exit the function gracefully
        } else {
            console.error("No valid Pokémon profile found after maximum attempts");
            return; // Exit the function gracefully
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
        document.querySelector('.pokemon-nature').textContent = profile.natures;
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

async function likePokemon(pokemonId) {
    try {
        console.log(`Liking Pokémon with ID: ${pokemonId}`);
        const response = await ipcRenderer.invoke('like-pokemon', pokemonId); 
        if (response.likePokemonSucess) {
            console.log(`Pokémon ID ${pokemonId} marked as liked`);
        } else {
            console.error("Failed to like Pokémon:", response.likePokemonFail);
        }
    } catch (error) {
        console.error("Error marking Pokémon as liked:", error);
    }
}

async function dislikePokemon(pokemonId) {
    try {
        console.log(`Disliking Pokémon with ID: ${pokemonId}`);
        const response = await ipcRenderer.invoke('dislike-pokemon', pokemonId); 
        if (response.dislikePokemonSucess) {
            console.log(`Pokémon ID ${pokemonId} marked as Disliked`);
        } else {
            console.error("Failed to Dislike Pokémon:", response.dislikePokemonFail);
        }
    } catch (error) {
        console.error("Error marking Pokémon as Disliked:", error);
    }
}

// Check if user is logged in with userId
async function checkIfUserLoggedIn() {
    try {
        const response = await ipcRenderer.invoke('check_user_logged_in'); 
        if (response.isLoggedIn) {
            console.log(`User with ID ${response.userID} is logged in.`);
            return true;
        } else {
            console.log('User is not logged in.');
            return false;
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
}