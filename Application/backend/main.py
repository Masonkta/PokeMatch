from fastapi import FastAPI, HTTPException
from py2neo import Graph
from pydantic import BaseModel
from typing import List, Optional  # Import Optional here
import os
import pokemon_data 
import random

app = FastAPI()

# Connect to the Neo4j instance using environment variable
neo4j_uri = os.getenv("NEO4J_URI")
graph = Graph(neo4j_uri, auth=("neo4j", "password"))  # Adjust based on your auth settings

# Define the PokemonProfile model
class Pokemon(BaseModel):
    pokemon: str
    image: str
    type: str
    bio: str
    pokeID: int
    natures: List[str]

class User(BaseModel):
    username: str
    password: str
    bio: Optional[str]
    userID: int = 0
    inSession: bool = False
    selectedTypes: List[str]
    selectedNatures: List[str]

userID = 0

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
    global userID
    profile.userID = userID
    query = """
    CREATE (u:User {name: $username, password: $password, bio: $bio, inSession: $inSession, userID: $userID, selectedTypes: $selectedTypes, selectedNatures: $selectedNatures}) 
    RETURN u
    """
    graph.run(query, username=profile.username, password=profile.password, bio=profile.bio, inSession=profile.inSession, userID=profile.userID, selectedTypes=profile.selectedTypes, selectedNatures=profile.selectedNatures)
    userID += 1
    return {"message": f"Profile created for {profile.username}!"}

@app.get("/login_user/")
async def login_user(username: str, password: str):
    query = """
    MATCH (u:User {name: $username, password: $password})
    SET u.inSession = true
    RETURN u
    """
    result = graph.run(query, username=username, password=password).data()

    if not result:
        raise HTTPException(status_code=404, detail="Profile not found")

    node_data = result[0]['u']
    profile = User(username=node_data['name'], password=node_data['password'], bio=node_data['bio'], inSession=node_data['inSession'], selectedTypes=node_data['selectedTypes'], selectedNatures=node_data['selectedNatures'])
    
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
        natures_count = 0
        natures = []
        natures_count = random.randint(1,3)
        for _ in range(natures_count):
            chosen = pokemon_data.natures_list[random.randint(0,24)]
            if chosen in natures:
                continue
            else:
                natures.append(chosen)
            
        query = """
        CREATE (p:Pokemon {name: $pokemon, image: $image, type: $type, bio: $bio, pokeID: $pokeID, natures: $natures}) 
        RETURN p
        """
        graph.run(query, pokemon=pokemon["pokemon"], image=pokemon["image"], type=pokemon["type"], bio=pokemon["bio"], pokeID=pokeID, natures=natures)
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
        query = """
        MATCH (p:Pokemon) 
        WHERE p.pokeID = $id 
        AND NOT EXISTS((:User {inSession: true})-[:LIKES|DISLIKES]->(p))
        RETURN p
        """
        result = graph.run(query, id=id).data()
    else:
        raise HTTPException(status_code=400, detail="id must be provided")

    if not result:
        raise HTTPException(status_code=404, detail="Profile not found")

    node_data = result[0]['p']
    profile = Pokemon(pokemon=node_data['name'], image=node_data['image'], type=node_data['type'], bio=node_data['bio'], pokeID=node_data['pokeID'], natures=node_data['natures'])
    
    if profile:
        return {"profile": profile.model_dump(), "message": "Profile fetched successfully!"}
    else:
        raise HTTPException(status_code=423, detail="profile not fetched correctly.")

@app.get("/like_pokemon/")
async def like_pokemon(id: int):
    query = """
    MATCH (u:User)
    WHERE u.inSession = true
    MATCH (p:Pokemon)
    WHERE p.pokeID = $id
    MERGE (u)-[:LIKES]->(p)
    RETURN u
    """
    result = graph.run(query, id=id).data()

    if not result:
        return {"likePokemonFail": "Failed to like Pokémon with ID: {}".format(id)}
    
    return {"likePokemonSucess": "User likes Pokémon with ID: {}".format(id)}

@app.get("/dislike_pokemon/")
async def dislike_pokemon(id: int):
    query = """
    MATCH (u:User)
    WHERE u.inSession = true
    MATCH (p:Pokemon)
    WHERE p.pokeID = $id
    MERGE (u)-[:DISLIKES]->(p)
    RETURN u
    """
    result = graph.run(query, id=id).data()

    if not result:
        return {"dislikePokemonFail": "Failed to dislike Pokémon with ID: {}".format(id)}
    
    return {"dislikePokemonSucess": "User dislikes Pokémon with ID: {}".format(id)}

@app.get("/matching/")
async def matching(id: int):
    query = """
    MATCH (u:User)
    WHERE u.inSession = true
    MATCH (p:Pokemon)
    WHERE p.pokeID = $id
    MERGE (u)-[:LIKES]->(p)
    RETURN u, p
    """
    result = graph.run(query,id=id).data()
    
    userTypes = result[0]['u']['selectedTypes']
    userNatures = result[0]['u']['selectedNatures']
    pokeTypes = result[0]['p']['type']
    pokeNatures = result[0]['p']['natures']
    rating = 0
    typePoints = 0
    natPoints = 0
    
    if "/" in pokeTypes:
        pT = pokeTypes.split("/")
    else:
        pT = [pokeTypes]
    
    if len(userTypes) >= len(pT):
        denomTypes = len(userTypes)
    else:
        denomTypes = len(pT)
    
    if len(userNatures) >= len(pokeNatures):
        denomNatures = len(userNatures)
    else:
        denomNatures = len(pokeNatures)
    
    for i in range(len(userTypes)):
        cur = userTypes[i]
        if cur in pT:
            typePoints+=1
            #continue
        
    for i in range(len(userNatures)):
        cur = userNatures[i]
        if cur in pokeNatures:
            natPoints+=1
            #continue
    
    rating = (typePoints/denomTypes) * .6 + (natPoints/denomNatures) * .4
    #rating = natPoints/denomNatures
    #rating = 1 # Debug value
    
    if rating >= .7:
        return {"matchSuccess": "Pokemon match success"}
    else: 
        return {"matchFail": "Pokemon match failed"}

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

@app.get("/is_user_logged_in/")
async def is_user_logged_in():
    query = """
    MATCH (u:User)
    WHERE u.inSession = true
    RETURN u
    """
    result = graph.run(query).data()
    if result and result[0]:
        node_data = result[0]['u']
        
        profile = User(username=node_data['name'], password=node_data['password'], bio=node_data['bio'], userID=node_data['userID'], inSession=node_data['inSession'], selectedTypes=node_data['selectedTypes'], selectedNatures=node_data['selectedNatures'])
    
    # Check if the result contains any data
    if result:
        return {"profile": profile.model_dump(), "isLoggedIn": True, "userID": profile.userID}
    else:
        return {"isLoggedIn": False}