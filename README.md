# PokeMatch - A Tinder-Style Pokémon Matching App

PokeMatch is a fun, Tinder-inspired app where users can like or dislike Pokémon profiles. It uses a database to store Pokémon profiles and user interactions, and allows users to explore Pokémon, select their favorite types and natures, and swipe through Pokémon profiles.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Developers and Contributions](#developers-and-contributions)
- [Credits](#credits)

---

## Features

- **Create User Profile**: Users can create a profile and select Pokémon types and natures to filter the profiles they want to see.
- **Log in User Profile**: Users can log in and view each Pokémon profile.
- **Swipe Left or Right**: Users can dislike or like Pokémon profiles.
- **Match Pokémon**: Users can match with Pokémon according to matching algorithm.
- **Message with Matched Pokémon**: Users can message with matched Pokémon and engage in conversation.

---

## Technologies Used

- **Electron**: For building the cross-platform desktop app.
- **Neo4j**: Graph database to store and query Pokémon and User data.
- **FastAPI**: For backend API to interact with the Neo4j database.
- **JavaScript, HTML, and CSS**: For building the user interface.

---

## Setup Instructions

### Prerequisites

- Node.js (for Electron)
- FastAPI
- Neo4j
- Docker 

### Installation

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/Masonkta/PokeMatch
    cd PokeMatch
    ```

2. **Install Docker (if needed)**:

    - Refer to the following website for installation: https://docs.docker.com/engine/install/
    
3. **Install Node Modules**:

    Navigate to the Electron app directory and install dependencies:

    ```bash
    cd Application/my-electron-app
    npm install electron --save-dev
    ```
    
    - Refer to the following website for more information: https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app

4. **Run the Application**:

    - **Run Docker**: 

        Open up a terminal window, navigate to Application app directory, and run the following command:

        ```bash
        docker compose up --build
        ```
        
        This will install the FastAPI and Neo4J images as well as build the containers for them

        When you see this in the terminal window, you are ready to run the application:
        ```
        neo4j    | 2024-10-27 19:46:42.764+0000 INFO  Anonymous Usage Data is being sent to Neo4j, see https://neo4j.com/docs/usage-data/                                                                                
        neo4j    | 2024-10-27 19:46:42.788+0000 INFO  Bolt enabled on 0.0.0.0:7687.
        neo4j    | 2024-10-27 19:46:43.265+0000 INFO  HTTP enabled on 0.0.0.0:7474.
        neo4j    | 2024-10-27 19:46:43.266+0000 INFO  Remote interface available at http://localhost:7474/
        neo4j    | 2024-10-27 19:46:43.268+0000 INFO  id: CC53446F5100EAC79FC49DA5F06AB30E5509EE4F02EE05766E96D91F192B0380                                                                                               
        neo4j    | 2024-10-27 19:46:43.269+0000 INFO  name: system                                                                                                                                                       
        neo4j    | 2024-10-27 19:46:43.269+0000 INFO  creationDate: 2024-10-02T01:05:37.934Z                                                                                                                             
        neo4j    | 2024-10-27 19:46:43.269+0000 INFO  Started.                                                                                                                                                           
        fastapi  | INFO:     Started server process [1]                                                                                                                                                                  
        fastapi  | INFO:     Waiting for application startup.
        fastapi  | INFO:     Application startup complete.                                                                                                                                                               
        fastapi  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)   
        ```

    - **Run Electron App**: Start the Electron application.

        Open up another terminal window, navigate to the Electron app directory, and run the following command:

        ```bash
        npm start
        ```
5. **Stop the Application**:
    - **Stop Docker**:

        In the terminal window running docker, run the following command:
                
        ```bash
        docker compose down --v
        ```
    - **Stop Electron App**:

        In the terminal window running the application, you can close the app by clicking **X** on the top right of the application window.
        Alternatively, you can do **Ctrl+C** in the terminal window. A termination message will show up. Type 'Y' or 'y' to stop:
        ```bash
        Terminate batch job (Y/N)? C:\Users\sjohn\Documents\GitHub\PokeMatch\Application\my-electron-app\node_modules\electron\dist\electron.exe exited with signal SIGINT
        y
        ```
---

## Project Structure
```plaintext
PokeMatch/
├── Application/
|   ├── backend/
│   │   ├── chat_histories.json
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   ├── pokemon_data.py
│   |   ├── requirements.txt     
│   ├── my-electron-app/
|   │   └── animations/
|   │   └── images/
|   │   └── music/
|   │   └── node_modules/
│   │   ├── index.html
│   │   ├── main.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── preload.js
│   │   └── renderer.js   
│   ├── neo4j/   
|   ├── .gitignore
|   ├── docker-compose.yml        
└── README.md                    
```

### `PokeMatch/`
This is the root directory for the PokeMatch application.

#### `Application/`
Contains all application components, including the backend server and the Electron app interface.

- **`backend/`**  
    The backend environment for the Electron application
    - `chat_histories.json` - The JSON file for storing chat history data for messaging.
    - `Dockerfile` - Defines the Docker setup for the backend environment, outlining dependencies and setup steps.
    - `main.py` - The main FastAPI application file that handles API endpoints and manages Neo4j connections.
    - `pokemon_data.py` - Contains all pokemon data along with natures
    - `requirements.txt` - Lists the dependencies required by FastAPI and any other backend Python packages.

- **`my-electron-app/`**  
    The directory for the Electron application, which is the user interface for PokeMatch.
    
    - `animations/` - Contains animation files for added interactivity and a polished user experience.
    - `images/` - Stores images, including Pokémon types, natures, and app and profile icons.
    - `music/` - Stores music/sound effect files for main background along with matching.
    - `node_modules/` - Contains packages and dependencies required by Node.js to run the Electron app.
    - `index.html` - The main HTML file for the Electron app, defining the app’s layout and structure.
    - `main.js` - The primary JavaScript file for the Electron app’s main process, managing app lifecycle events and backend communication.
    - `package-lock.json` - Records the exact versions of each dependency installed, ensuring consistent setups across different environments.
    - `package.json` - Specifies project metadata, scripts, and dependencies needed for the Electron app.
    - `preload.js` - A script that runs in Electron’s context, allowing secure interaction between the main and renderer processes.
    - `renderer.js` - The script for managing UI interactions in the Electron app, including Pokémon data display and user actions.

--- 

## Usage Guide

### Using the App

1. **Create Your Profile**:
    - Click the **Settings** button in the top left corner, then select **Register**.
    - Fill in your **username** and **password**. Optionally, you can add a **bio**.
    - Choose your preferred Pokémon **types** and **natures**. You can select up to three for both.
    - Click **Create User** to complete your registration. A green success message will confirm your registration.

2. **Login Your Profile**:
    - Click **Back** to return to the main screen, click **Login**, enter your credentials, and log in. A green success message will confirm your login.
    - A new page show up with your profile information: username, bio, types, and natures.
    - Your matched pokemon will show in the left side of the messaging box.
    - You also have the option to logout and log into another profile.

3. **Explore and Swipe on Pokémon**:
    - Use the **Like** and **Dislike** buttons to navigate through Pokémon profiles.
    - Your liked and disliked Pokémon will be saved in the Neo4j database for personalized recommendations.
    - Previously seen Pokémon will not reappear if they have been liked or disliked already. 
    - When you successfully match with a Pokémon, an animation will appear.
    - The newly matched Pokémon will added to your other matched Pokémon in the left side of the messaging box.

4. **Messaging System**:
    - When you click on a Pokémon, it will load your chat history with it.
    - Use the text box to enter in a message as well as the send button to send the message.
    - In a few seconds, the Pokémon will send back a message of its own.
    - **Green**: User, **Yellow**: Pokémon

5. **Music**:
    - When the apps initially loads, a lofi track will play on loop.
    - When you match with a Pokémon, the music will switch according to the order of operation.
    - **Order of Operation**: 1: Lofi   2. Bossa Nova   3. R&B   4. Jersey Club

---

# Developers and Contributions

## Anamaria Montes
### Main Contributions:
  - Set up front end for matching with Pokemon
  - Set up front end for user profile
  - Set up front end for messaging window
  - Set up button functionality within index.html file
  - Designed logo and custom buttons for entire front end
  - Created all animations and implemented them

## Mason Maddox
### Main Contributions:
  - Set up front and back end for liking and disliking Pokemon.
  - Assisted in the creation of the message page and its functionality.
  - Allowed for the currently displayed pokemon to swap when like or disliked by the user.
  - Created all the logic for fetching pokemon based on a given id that is randomly generated.
  - Added constraints to the fetch logic to ensure all pokemon shown to the user are ones that they have not previously liked or disliked.
  - Assisted in the implementation of animations and ensuring they ran at correct timings.

## Chad Auchard
### Main Contributions:
  - Created algorithm for matching with liked Pokemon.
  - Gathered and populated Pokemon data to be input into database.
  - Helped conceptualize structure of database.
  - Helped connect backend matching to frontend.

## Stephan Johnson
### Main Contributions:
  - Set up Docker for containerizing the backend service.
  - Configured deployment using Docker Compose and a Dockerfile to set up and orchestrate the application's services (FastAPI, Neo4J).
  - Integrated FastAPI as the application programming interface for the communication between the frontend and database.
  - Integrated Neo4j as the database for storing Pokémon and user-related data making nodes and relationships.
  - Developed the backend using Python for communicating with the frontend and database.
  - Created all music as well as added sound effects.
  - Implemented AI chatbot generating responses behind the Pokémon talking to the users in the frontend as well as maintaining the chat history

---

## Credits

    Developer: Stephan Johnson
    Designer/Developer: Anamaria Montes
    Developer: Mason Maddox
    Developer: Chad Auchard
