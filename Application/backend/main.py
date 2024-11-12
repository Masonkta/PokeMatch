from fastapi import FastAPI, HTTPException
from py2neo import Graph
from pydantic import BaseModel
from typing import List, Optional  # Import Optional here
import os
import pokemon_data 
import random
import sys
import io
import json
from gradio_client import Client

app = FastAPI()

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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
async def preload_pokemon_data(new_pokemon_to_add_in_database):
    count = await count_pokemon()
    pokeID = count['pokemon_count'] + 1
    for pokemon in new_pokemon_to_add_in_database:
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
    current_pokemon_in_database_query = """
    MATCH (p:Pokemon)
    RETURN p.name AS name
    """
    result = graph.run(current_pokemon_in_database_query).data()

    current_pokemon_in_database = [record['name'] for record in result]
    current_pokemon_in_pokemondata = []
    new_pokemon_to_add_in_database = []

    for pokemon in pokemon_data.data:
        current_pokemon_in_pokemondata.append(pokemon['pokemon'])
    if set(current_pokemon_in_database) == set(current_pokemon_in_pokemondata):
        pass
    else:
        for pokemon in pokemon_data.data:
            if pokemon['pokemon'] in current_pokemon_in_database:
                continue
            for key, value in pokemon.items():
                if isinstance(value, str) and value.strip() == '':
                    continue
            print("Adding this Pokemon", pokemon)
            new_pokemon_to_add_in_database.append(pokemon)

    if not new_pokemon_to_add_in_database:
        pass
    else:
        await preload_pokemon_data(new_pokemon_to_add_in_database)
    print("New Pokemon To Add in Database", new_pokemon_to_add_in_database)
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
    liking_query = """
    MATCH (u:User)
    WHERE u.inSession = true
    MATCH (p:Pokemon)
    WHERE p.pokeID = $id
    MERGE (u)-[:LIKES]->(p)
    RETURN u, p
    """
    result = graph.run(liking_query, id=id).data()
    
    userTypes = result[0]['u']['selectedTypes']
    userNatures = result[0]['u']['selectedNatures']
    pokeTypes = result[0]['p']['type']
    pokeNatures = result[0]['p']['natures']
    pT = []
    rating = 0
    typePoints = 0
    natPoints = 0
    bonus = 0
    
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
    
    if typePoints/len(pT) == 1:
        bonus += .1
    elif typePoints/len(pT) >= .33 :
        bonus += .05
    
    if natPoints/len(pokeNatures) == 1:
        bonus += .2
    elif natPoints/len(pokeNatures) >= .33:
        bonus += .1
        
        
    rating = (typePoints/denomTypes) * .4 + (natPoints/denomNatures) * .6 + bonus
    
    #rating = 1 # Debug value
    
    if rating >= .1:
        matching_query = """
        MATCH (u:User)
        WHERE u.inSession = true
        MATCH (p:Pokemon)
        WHERE p.pokeID = $id
        MERGE (u)-[:MATCHES]->(p)
        RETURN u, p
        """
        graph.run(matching_query, id=id).data()
        return {"matchSuccess": "Pokemon match success","rating":rating}
    else:
        return {"matchFail": "Pokemon match failed","rating":rating}
    

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
    
@app.get("/matched_list/")
async def matched_list():
    query = """
    MATCH (u:User)-[:MATCHES]->(p:Pokemon)
    WHERE u.inSession = true
    RETURN p.name AS name
    """
    result = graph.run(query).data()

    if result:
        matched_pokemon = [record['name'] for record in result]
        return {"matched_pokemon": matched_pokemon}
    else:
        return {"matched_pokemon": []}
    
@app.get("/pokemon_chatbot_message/")
async def chatbot_message(pokemon_name: str, user_message: str):
    # Attempt to load chat histories from a JSON file if it exists
    try:
        with open('chat_histories.json', 'r', encoding='utf-8') as f:
            chat_histories = json.load(f)
    except FileNotFoundError:
        chat_histories = {}

    pokemon_information_query = """
    MATCH (p:Pokemon)
    WHERE p.name = $pokemon_name
    RETURN p
    """
    result = graph.run(pokemon_information_query, pokemon_name=pokemon_name).data()

    pokemon = result[0]['p']
    personality_traits = pokemon['natures']

    client = Client("yuntian-deng/ChatGPT")

    prompt = (
        f"{pokemon_name} is a Pokémon with the following personality traits: {personality_traits}. "
        f"The user said: '{user_message}'. As {pokemon_name}, start your reply by saying your own name (for example: 'Pika, Pika') and then respond in character. "
        f"Make the reply sound like something {pokemon_name} would say." 
        f"These are your previous conversations: {chat_histories.get(pokemon_name)}."
        f"If you don't have any previous conversations, then introduce yourself otherwise don't introduce yourself."
    )

    # Initialize chat history if it doesn't exist
    if pokemon_name not in chat_histories:
        chat_histories[pokemon_name] = []

    # Add the user message to chat history
    chat_histories[pokemon_name].append({"role": "user", "content": user_message})

    # Send the prompt to the model
    response = client.predict(
        inputs=prompt,
        api_name="/predict",  # Use the correct API name
        top_p=0.8,  # You can adjust the top_p and temperature if needed
        temperature=1.2
    )

    reply = response[0][0][1]
    print("Reply:", reply)

    # Add AI response to chat history
    chat_histories[pokemon_name].append({"role": "assistant", "content": reply})
    print("Chat history for", pokemon_name, ":", chat_histories[pokemon_name])

    with open('chat_histories.json', 'w', encoding='utf-8') as f:
        json.dump(chat_histories, f, ensure_ascii=False, indent=4)

    return {"reply": reply}