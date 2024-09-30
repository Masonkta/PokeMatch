from fastapi import FastAPI
from py2neo import Graph
from pydantic import BaseModel

app = FastAPI()

# Connect to the local Neo4j instance
graph = Graph("bolt://localhost:7687", auth=("neo4j", "password"))

# Define the PokemonProfile model
class Pokemon(BaseModel):
    pokemon: str
    type: str
    bio: str

@app.get("/")
async def read_root():
    return {"message": "Welcome to the PokéMatch!"}

@app.get("/pokemon")
async def get_pokemon():

    return [
        {"name": "Ditto", "type": "Normal"},
    ]

@app.post("/create_profile/")
async def create_profile(profile: Pokemon):
    query = """
    CREATE (p:Pokemon {name: $pokemon, type: $type, bio: $bio}) 
    RETURN p
    """
    graph.run(query, pokemon=profile.pokemon, type=profile.type, bio=profile.bio)
    return {"message": f"Profile created for {profile.pokemon}!"}

# Define the Pokemon data to preload
initial_data = [
    {"pokemon": "Ditto", "type": "Normal", "bio": "I am a pink blob"},
    {"pokemon": "Grookey", "type": "Grass", "bio": "Monkey Time"},
    {"pokemon": "Malamar", "type": "Dark/Psychic", "bio": "Mysterious, Destructive, Curious, Bizzare creature who is on a mission to reshape humanity"},
    # Add more Pokémon as needed
]

# Function to preload data into Neo4j
def preload_pokemon_data():
    for pokemon in initial_data:
        query = """
        MERGE (p:Pokemon {name: $pokemon, type: $type, bio: $bio}) 
        RETURN p
        """
        graph.run(query, pokemon=pokemon["pokemon"], type=pokemon["type"], bio=pokemon["bio"])

# Hook into FastAPI startup event
@app.get("/startup/") 
async def startup_event():
    preload_pokemon_data()
#    print("Preloaded Pokémon data into Neo4j")
    return {"message": "Pokémon data preloaded successfully!"}