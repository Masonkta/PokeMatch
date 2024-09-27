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
