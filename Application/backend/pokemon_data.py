import random

# Define the Pokemon data to preload
data = [
    {"pokemon": "Ditto", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//132.png","type": "Normal", "bio": "I am a pink blob"},
    {"pokemon": "Grookey", "image":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLx94R3D2o1WqiOYYQw07Z_UDCBywD-AahpQ&s","type": "Grass", "bio": "Professional Taxidermist and knife collector. Hoping to find a trainer who will help him complete his collections."},
    {"pokemon": "Malamar", "image":"https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/687.png","type": "Dark/Psychic", "bio": "Mysterious, Destructive, Curious, Bizzare creature who is on a mission to reshape humanity"},
    # Add more Pokémon as needed
    {"pokemon": "Pikachu", "image":"https://pokemonletsgo.pokemon.com/assets/img/common/char-pikachu.png","type": "Electric", "bio": "Gets pretty tired from using their electricity to charge their phone. Blames it on their loud neighbors."},
    {"pokemon": "Charizard", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//006.png","type": "Fire/Flying", "bio": "Might looks ferocious, but has a warm heart and loves to take casual flights at night."},
    {"pokemon": "Bulbasaur", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//001.png","type": "Grass/Poison", "bio": "A real green thumb who cherishes their garden."},
    {"pokemon": "Squirtle", "image":"https://miro.medium.com/v2/resize:fit:750/1*W_ITBT0_dDNGyy_yPRQO3g.jpeg","type": "Water", "bio": "Introvert looking to break out of their shell."},
    {"pokemon": "Eevee", "image":"https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/133.png","type": "Normal", "bio": "Can jump from cuddly to vicious in a moment's time. They'd give a cat a run for their money."},
    {"pokemon": "Frosslass", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//478.png","type": "Ice/Ghost", "bio": "Cold and ruthless, they are the reason paranormal occurences are chilling."}
    {"pokemon": "Mewtwo", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//150.png","type": "Psychic", "bio": "Looking for a trainer who is psychically resistant or dimwitted."},
    {"pokemon": "Lucario", "image":"https://img.pokemondb.net/artwork/large/lucario.jpg", "type": "Fighting/Steel", "bio": "Always looking for a brawl. Prone to picking fights, especially when intoxicated."},
    {"pokemon": "Snorlax", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//143.png","type": "Normal", "bio": "Narcoleptic who wishes they weren't so tired, but too sleepy to try and fix it."},
    {"pokemon": "Gengar", "image":"https://img.pokemondb.net/artwork/large/gengar.jpg","type": "Ghost/Poison", "bio": "Likes scaring friends and foes alike. Known to play pranks on anyone within a five mile radius."},
    {"pokemon": "Jigglypuff", "image":"https://img.pokemondb.net/artwork/large/jigglypuff.jpg","type": "Normal/Fairy", "bio": "Cute on the outside, a true monster on the inside. Looking for any chance to break free from the binds that hold them. "},
    {"pokemon": "Machamp", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//068.png","type": "Fighting", "bio": "Boxer during the day, expert sushi chef at night. "},
    {"pokemon": "Arcanine", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//059.png","type": "Fire", "bio": "Loves to play fetch, just don't use a stick or anything else thats flammable."},
    {"pokemon": "Dragonite", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//149.png","type": "Dragon/Flying", "bio": "Interested in learning about everything. Also a rival jokester to Gengar."},
    {"pokemon": "Blastoise", "image":"https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/009.png","type": "Water", "bio": "A walking fortress and sharpshooting champ."},
    {"pokemon": "Venusaur", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//003.png","type": "Grass/Poison", "bio": "They've mastered the hobbyist's garden, growing board with simple flora. Now cultivates potent poisons and concoctions."},
    {"pokemon": "Lugia", "image":"https://img.pokemondb.net/artwork/large/lugia.jpg","type": "Psychic", "bio": "Is definitely not an alien. No way, no how."},
    {"pokemon": "Ho-Oh", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//250.png","type": "Psychic/Flying", "bio": "Wanted in 9 provinces for flying in restricted airspaces."},
    {"pokemon": "Umbreon", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//197.png","type": "Fire/Flying", "bio": "Always trying out the new hottest foods on the maret and makes sure you know about it."},
    {"pokemon": "Espeon", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//196.png","type": "Psychic", "bio": "Uses telepathy beg for food or tell the worst puns imaginable."},
    {"pokemon": "Sylveon", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//700.png","type": "Fairy", "bio": "Happy-go-lucky and never a fair-weather friend."},
    {"pokemon": "Gyrados", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//130.png","type": "Water/Flying", "bio": "Overnight transformation from Guppy to sea god has left them looking for new clothes. Still torn about their favorite jacket."},
    {"pokemon": "Alakazam", "image":"https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/065.png","type": "Psychic", "bio": "Has immense pyschic power, but still cannot figure out how to pull a rabbit from a hat."},
    {"pokemon": "Tyranitar", "image":"https://assets.pokemon.com/assets/cms2/img/pokedex/full//248.png","type": "Rock/Dark", "bio": "Once mistaken for Godzilla. King Kong was busy, so the government brought in Grookey."},
    {"pokemon": "Garchomp", "image":"https://img.pokemondb.net/artwork/large/garchomp.jpg","type": "Dragon/Ground", "bio": "Loves to knit, but has trouble gripping their sewing needles. "}

]

