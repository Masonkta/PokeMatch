from fastapi import FastAPI, HTTPException
from py2neo import Graph
from pydantic import BaseModel
from typing import List, Optional  # Import Optional here
import os
import pokemon_data 

app = FastAPI()

# Connect to the Neo4j instance using environment variable
neo4j_uri = os.getenv("NEO4J_URI")
graph = Graph(neo4j_uri, auth=("neo4j", "password"))  # Adjust based on your auth settings

# Define the PokemonProfile model
class Pokemon(BaseModel):
    pokemon: str
    image: Optional[str]
    type: str
    bio: str
    pokeID: int

class User(BaseModel):
    username: str
    password: str
    bio: Optional[str]
    inSession: bool = False

@app.get("/")
async def read_root():
    return {"message": "Welcome to the PokéMatch!"}

@app.get("/pokemon")
async def get_pokemon():

    return [
        {"name": "Ditto", "type": "Normal"},
    ]

@app.post("/create_profile/")
async def create_profile(profile: User):
    query = """
    CREATE (u:User {name: $username, password: $password, bio: $bio, inSession: $inSession}) 
    RETURN u
    """
    graph.run(query, username=profile.username, password=profile.password, bio=profile.bio, inSession=profile.inSession)
    return {"message": f"Profile created for {profile.username}!"}

@app.get("/retrieve_user_profile/")
async def retrieve_user_profile(username: str, password: str):
    query = """
    MATCH (u:User {name: $username, password: $password})
    SET u.inSession = true
    RETURN u
    """
    result = graph.run(query, username=username, password=password).data()

    if not result:
        raise HTTPException(status_code=404, detail="Profile not found")

    node_data = result[0]['u']
    profile = User(username=node_data['name'], password=node_data['password'], bio=node_data['bio'], inSession=node_data['inSession'])
    
    if profile:
        return {"profile": profile.model_dump(), "message": f"{profile.username} logged in!"}
    else:
        raise HTTPException(status_code=422, detail="profile not fetched correctly.")


# Function to preload data into Neo4j
def preload_pokemon_data():
    # Clear all nodes and relationships in Neo4j
    delete_query = """
    MATCH (p:Pokemon)
    DETACH DELETE p
    """
    graph.run(delete_query)

    pokeID = 0   
    for pokemon in pokemon_data.data:
        query = """
        CREATE (p:Pokemon {name: $pokemon, image: $image, type: $type, bio: $bio, pokeID: $pokeID}) 
        RETURN p
        """
        graph.run(query, pokemon=pokemon["pokemon"], image=pokemon["image"], type=pokemon["type"], bio=pokemon["bio"], pokeID=pokeID)
        pokeID += 1

# Hook into FastAPI startup event
@app.get("/startup/") 
async def startup_event():
    preload_pokemon_data()
#    print("Preloaded Pokémon data into Neo4j")
    return {"message": "Pokémon data preloaded successfully!"}

# Count the amount of pokemon in Neo4J
@app.get("/count_pokemon/")
async def count_pokemon():
    count_query = """
    MATCH (n:Pokemon)
    RETURN COUNT(n) AS pokemon_count
    """
    result_count = graph.run(count_query).data()  # Fetch the result as a list of dictionaries
    count = result_count[0]['pokemon_count']  # Access the 'pokemon_count' value
    return {"pokemon_count": count}  # Return the count as a JSON response

@app.get("/fetch_pokemon_profile/")
async def fetch_pokemon_profile(id: int):
    if id is not None:
        query = "MATCH (p:Pokemon) WHERE p.pokeID = $id RETURN p"
        result = graph.run(query, id=id).data()
    else:
        raise HTTPException(status_code=400, detail="id must be provided")

    if not result:
        raise HTTPException(status_code=404, detail="Profile not found")

    node_data = result[0]['p']
    profile = Pokemon(pokemon=node_data['name'], image=node_data['image'], type=node_data['type'], bio=node_data['bio'], pokeID=node_data['pokeID'])
    
    if profile:
        return {"profile": profile.model_dump(), "message": "Profile fetched successfully!"}
    else:
        raise HTTPException(status_code=423, detail="profile not fetched correctly.")


@app.post("/logout_user/")
async def logout_user():
    query = """
    MATCH (u:User)
    WHERE u.inSession = true
    SET u.inSession = false
    RETURN u
    """
    result = graph.run(query).data()

    if not result:
        return {"message": "No users logged out"}
    
    return {"message": "All logged-in users have been logged out!"}