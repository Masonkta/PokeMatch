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