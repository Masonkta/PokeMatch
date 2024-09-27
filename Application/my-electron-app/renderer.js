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
