const { ipcRenderer } = require('electron');

// Initialize a click sound effect
const clickSound1 = new window.Howl({
    src: ['music/sounds/sound_1.mp3'], // Path to your click sound effect
    volume: 0.1
});

// Initialize a click sound effect
const clickSound2 = new window.Howl({
    src: ['music/sounds/sound_2.mp3'], // Path to your click sound effect
    volume: 0.1
});

// Initialize a click sound effect
const clickSound3 = new window.Howl({
    src: ['music/sounds/sound_3.mp3'], // Path to your click sound effect
    volume: 0.1
});

// Function to play sound when any element is clicked
function playClickSound1() {
    clickSound1.play();
}

// Function to play sound when any element is clicked
function playClickSound2() {
    clickSound2.play();
}

// Function to play sound when any element is clicked
function playClickSound3() {
    clickSound3.play();
}

// Add event listeners to all clickable elements (for example, buttons and links)
document.querySelectorAll('button').forEach(element => {
    element.addEventListener('click', playClickSound2);
});

// Initialize the main background music
const mainBackgroundMusic = new window.Howl({
    src: ['music/PokeMatch Main.mp3'],
    loop: true,
    volume: 0.5
});

// Initialize the Pokémon match music tracks
const pokeMatchMusic1 = new window.Howl({
    src: ['music/match_music/PokeMatch Match_1.mp3'],
    loop: false,
    volume: 0.5
});

const pokeMatchMusic2 = new window.Howl({
    src: ['music/match_music/PokeMatch Match_2.mp3'],
    loop: false,
    volume: 0.5
});

const pokeMatchMusic3 = new window.Howl({
    src: ['music/match_music/PokeMatch Match_3.mp3'], 
    loop: false,
    volume: 0.5
});

// Track the current match music to alternate between Match_1, Match_2, and Match_3
let currentMatchTrack = 1;

// Start playing the main background music when the app loads
document.addEventListener('DOMContentLoaded', () => {
    mainBackgroundMusic.play();
});

// Function to handle the matching music
function playMatchMusic() {
    // Stop the main background music when a match music starts
    mainBackgroundMusic.stop();

    // Alternate between Match_1, Match_2, and Match_3
    if (currentMatchTrack === 1) {
        pokeMatchMusic2.stop();
        pokeMatchMusic3.stop();
        pokeMatchMusic1.play();
        currentMatchTrack = 2;  // Set the next track to Match_2
    } else if (currentMatchTrack === 2) {
        pokeMatchMusic1.stop();
        pokeMatchMusic3.stop();
        pokeMatchMusic2.play();
        currentMatchTrack = 3;  // Set the next track to Match_3
    } else {
        pokeMatchMusic1.stop();
        pokeMatchMusic2.stop();
        pokeMatchMusic3.play();
        currentMatchTrack = 1;  // Set the next track to Match_1
    }

    // Return to the main background music after match music finishes
    pokeMatchMusic1.once('end', () => {
        if (currentMatchTrack === 2) { // Match_1 just finished
            mainBackgroundMusic.play();
        }
    });

    pokeMatchMusic2.once('end', () => {
        if (currentMatchTrack === 3) { // Match_2 just finished
            mainBackgroundMusic.play();
        }
    });

    pokeMatchMusic3.once('end', () => {
        if (currentMatchTrack === 1) { // Match_3 just finished
            mainBackgroundMusic.play();
        }
    });
}

// Simulate the user matching with a Pokémon (this should be called when a match occurs in your app)
function onPokemonMatchMusic() {
    playMatchMusic();
}


let poke_count = 0;
let matched_pokemon = [];
const emptyState = document.querySelector('.empty-state');
const loginMessage = document.querySelector('.loginMessage');
const createUserMessage = document.querySelector('.createUserMessage');

let insession = false;

const selectedTypes = new Set();
const selectedNatures = new Set();

document.addEventListener('DOMContentLoaded', () => {
    const typeButtons = document.querySelectorAll('.type-buttons');
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const img = button.querySelector("img"); // Find the image inside the button
            const type = img.getAttribute("alt"); // Get the 'alt' attribute value
            console.log(type)

            if (selectedTypes.has(type)) {
                selectedTypes.delete(type);
            } else if (selectedTypes.size < 3) {
                selectedTypes.add(type);
            }

            console.log("selectedTypes: ", Array.from(selectedTypes)); // For debugging purposes
        });
    });

    const natureButtons = document.querySelectorAll('.nature-buttons');
    natureButtons.forEach(button => {
        button.addEventListener('click', () => {
            const img = button.querySelector("img"); // Find the image inside the button
            const nature = img.getAttribute("alt"); // Get the 'alt' attribute value
            console.log(nature)

            if (selectedNatures.has(nature)) {
                selectedNatures.delete(nature);
            } else if (selectedNatures.size < 3) {
                selectedNatures.add(nature);
            }

            console.log("selectedNatures: ", Array.from(selectedNatures)); // For debugging purposes
        });
    });
});


// Listen for the 'createUserButton' click
document.getElementById('createUserButton').addEventListener('click', () => {
    const username = document.getElementById('createUserName').value;
    const password = document.getElementById('createUserPassword').value;
    const bio = document.getElementById('bioProfile').value;

    if (username && password && bio) {
        sendProfile({ username: username, password: password, bio: bio, selectedTypes: Array.from(selectedTypes), selectedNatures: Array.from(selectedNatures) });  // Pass all profile values
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
            bio: profile.bio,
            selectedTypes: profile.selectedTypes,
            selectedNatures: profile.selectedNatures
        });
        console.log(response.message);
        createUserSuccessMessage(profile)
        playClickSound3()
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
            playClickSound3()
            fetchPokemon(currentPokemonId);
        }   
    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to get user information and populate fields
async function populateUserInfo() {
    // Assume getuserInfo() returns an object with user details
    const userInfo = await getuserInfo();
    console.log("userInfo", userInfo);
    // Get elements by ID and populate with user info
    document.getElementById("loggedInName").innerText = `Username: ${userInfo.username}`;
    console.log("userinfo username ", userInfo.username);
    document.getElementById("loggedInBio").innerText = `Bio: ${userInfo.bio}`;
    console.log("userinfo bio ", userInfo.bio);
    document.getElementById("loggedInTypes").innerText = `Types: ${userInfo.types}`;
    console.log("userinfo types ", userInfo.types);
    document.getElementById("loggedInNatures").innerText = `Natures: ${userInfo.natures}`;
    console.log("userinfo natures ", userInfo.natures);
}

// Get user info
async function getuserInfo() {
    try {
        const response = await ipcRenderer.invoke('check_user_logged_in'); 
        if (response.profile) {
            console.log(`User with ID ${response.userID} info retrieved.`);
            console.log(response.profile.username);
            console.log(response.profile.natures);
            console.log(response.profile.selectedTypes);
            console.log(response.profile.selectedNatures);
            return {
                username: response.profile.username,
                bio: response.profile.bio,
                types: response.profile.selectedTypes,
                natures: response.profile.selectedNatures
            };
        } else {
            console.log('No user data found.');
            return {};
        }
    } catch (error) {
        console.error("Error checking user status:", error);
    }
}

// Sets the login message to be displayed when the user is logged in.
async function loginSuccessMessage(profile) {
    if (profile) {
        loginMessage.style.display = 'block';
        await wait(1500);
        loginComplete();
        loginMessage.style.display = 'none';
    } else {
        loginMessage.style.display = 'none';
    }
}

// Sets the create user message to be displayed when the user is created.
async function createUserSuccessMessage(profile) {
    if (profile) {
        createUserMessage.style.display = 'block';
        await wait(1500);
        createUserMessage.style.display = 'none';
    } else {
        createUserMessage.style.display = 'none';
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
            matchPokemon(currentPokemonId); // Match liked Pokemon
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

    document.getElementById('messagesButton').addEventListener('click', async () => {
        if (await checkIfUserLoggedIn()) {
            console.log("logged in and trying to matchlist");
            MatchedList();
        }
        else {
            console.error("Not logged in but trying to matchlist");
            console.log(await checkIfUserLoggedIn());
        }
    });
})


// The initial sequence of requests that lead to the database to properly display a new Pokémon to the user.
async function fetchPokemon(current) {
    try {
        showLoadingAnimation();
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
            newId = generateRandomId(0, uniquePokemonCount-1, currentPokemonId, attemptedIds);
            response = await ipcRenderer.invoke('fetch-pokemon-profile', newId);
            console.log(`Trying Pokémon ID: ${newId}`);
            attempts++;

            // Add newId to attempted IDs
            attemptedIds.add(newId);

            // Check if we have tried all unique Pokémon
            if (attempts >= uniquePokemonCount) {
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
    } finally {
        await wait(500); // waits for 0.2 seconds (200 milliseconds)
        hideLoadingAnimation();
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// Ensures the user is being provided with visual information of the current pokemon.
function displayPokemon(profile) {
    if (profile) {
        document.querySelector('.pokemon-name').textContent = profile.pokemon;
        document.querySelector('.pokemon-image').src = profile.image;
        document.querySelector('.pokemon-type').textContent = `Type: ${profile.type}`;
        document.querySelector('.pokemon-ability').textContent = `Bio: ${profile.bio}`;

        // Clear existing nature images
        for (let i = 1; i <= 3; i++) {
            const natureDisplay = document.getElementById(`nature-display-${i}`);
            natureDisplay.innerHTML = '';
        }
        
        // Create and append nature images
        profile.natures.forEach((nature, index) => {
            if (index < 3) { // Ensure we only handle up to 3 natures
                const natureDisplay = document.getElementById(`nature-display-${index + 1}`);
                if (natureDisplay) {
                    const natureImage = document.createElement('img');
                    natureImage.src = `images/pokenatures/${nature.toLowerCase()}.png`;
                    natureImage.alt = nature;
                    natureDisplay.appendChild(natureImage);
                    console.log(`Appended image for nature: ${nature} to display-${index + 1}`); // Debugging log
                } else {
                    console.error(`Nature display container not found for index: ${index + 1}`); // Debugging log
                }
            }
        });
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

async function matchPokemon(pokemonId){
    try {
        console.log(`Attempting to match with liked Pokemon with ID: ${pokemonId}`);
        const response = await ipcRenderer.invoke('matching',pokemonId);
        console.log(response.rating);
        if (response.matchSuccess) {
            console.log(`User successfully matched with Pokemon ID ${pokemonId}`);
            const animationContainer = document.getElementById('lottie');
            animationContainer.style.display = 'block'; // Show the animation container
            window.animation.goToAndPlay(0,true);

            // Hide the animation after a few seconds
            setTimeout(() => {
                window.animation.stop(); // Stop the animation
                animationContainer.style.display = 'none'; // Hide the animation container
            }, 5500); // Adjust the duration as needed
            playClickSound1();
            onPokemonMatchMusic()
        } else {
            console.error("Failed to match with Pokemon:", response.matchFail);
        }
    } catch (error) {
        console.error("Error marking Pokemon as Matched", error);
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

async function MatchedList() {
    try { 
        const response = await ipcRenderer.invoke('Matched-Pokemon-List');
        const matched_pokemon = response.matched_pokemon;
        console.log(`The Matched List was found: ${matched_pokemon}`);
        const messageProfileForm = document.getElementById('messageProfileForm');

        const pokemonList = matched_pokemon;
        const existingProfiles = messageProfileForm.querySelectorAll('h6.pokemon-message-name');

        // Loop over each Pokémon in the matched list
        pokemonList.forEach(pokemonName => {
            // Check if the Pokémon name is already in the list
            let profileExists = false;

            existingProfiles.forEach(profile => {
                if (profile.textContent === pokemonName) {
                    profileExists = true;
                }
            });

            if (profileExists == false) {
                const imageElement = document.createElement('button');
                imageElement.classList.add('pokemon-button-image'); // Add a CSS class for styling
                imageElement.alt = pokemonName;

                // Create the name element
                const nameElement = document.createElement('h6');
                nameElement.classList.add('pokemon-message-name');
                nameElement.textContent = pokemonName;

                // Append the image and name to the messageProfileForm container
                messageProfileForm.appendChild(imageElement);
                messageProfileForm.appendChild(nameElement);
            }
        });
    } catch (error) {
        console.error("Error retrieving Matched List", error);
    }
}

async function message(pokemon_name, user_message) {
    try {
        const response = await ipcRenderer.invoke('pokemon_chatbot_message', pokemon_name, user_message);
        pokemon_chatbot_reply = response.reply;
        console.log(`Pokemon ChatBot Message: ${pokemon_chatbot_reply} `);
        return pokemon_chatbot_reply
    } catch (error) {
        console.error("Error retrieving Pokemon chatbot message", error);
    }
}

document.getElementById('enterButton').addEventListener('click', () => {
    const inputField = document.getElementById('MessageFormInput');
    const messageText = inputField.value.trim();

    if (messageText) {
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.innerHTML = messageText;  // Set the user's message text
        document.getElementById('messageDisplayArea').appendChild(userMessage);

        // Clear input
        inputField.value = '';

        // Add Pokémon reply message (example response)
        setTimeout(() => {
            const pokemonMessage = document.createElement('div');
            pokemonMessage.className = 'pokemon-message';
            pokemonMessage.innerHTML = "Hello, I'm your Pokémon companion!"; // Example response text
            document.getElementById('messageDisplayArea').appendChild(pokemonMessage);

            // Scroll to the latest message
            const messageDisplayArea = document.getElementById('messageDisplayArea');
            messageDisplayArea.scrollTop = messageDisplayArea.scrollHeight;
        }, 1000); // Simulate a delay for the Pokémon response
    }
});
