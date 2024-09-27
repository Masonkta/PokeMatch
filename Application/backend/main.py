from fastapi import FastAPI
from py2neo import Graph

app = FastAPI()

# Connect to the local Neo4j instance
graph = Graph("bolt://localhost:7687", auth=("neo4j", "password"))

@app.get("/")
async def read_root():
    return {"message": "Welcome to the PokéMatch!"}

@app.get("/pokemon")
async def get_pokemon():

    return [
        {"name": "Ditto", "type": "Normal"},
    ]

@app.post("/create_profile/")
async def create_profile(pokemon: str):
    query = "CREATE (p:Pokemon {name: $pokemon}) RETURN p"
    graph.run(query, pokemon=pokemon)
    return {"message": f"Pokemon {pokemon} created."}