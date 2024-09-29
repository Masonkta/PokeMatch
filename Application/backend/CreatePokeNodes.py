#######################################
##  Pokemon data inserted into Neo4j database
##  Very Early 
##
#######################################

from neo4j import GraphDatabse

URI = ""
AUTH = ("<Username>","<Password>")

# STEPS
# Receive information from API
# Connect to Neo4j Database
# Verify connection
# Create the nodes and input the information into the database


def addPokemon (name,pic,desc,type):
    driver.execute_query(
        "CREATE (n:Pokemon {name: $name, type: $type}) "
        "CREATE (m:Picture {url: $url, picpn: $name}) "
        "CREATE (n)-[:LOOKSLIKE]->(m) "
        "CREATE (p:Description {desc: $desc, descpn: $name}) "
        "CREATE (n)-[:DESCBY]->(p) "

    )


with GraphDatabse.driver(URI, auth=AUTH) as driver:
    driver.verify_connectivity






