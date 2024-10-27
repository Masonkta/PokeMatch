# PokeMatch - A Tinder-Style Pokémon Matching App

PokeMatch is a fun, Tinder-inspired app where users can like or dislike Pokémon profiles. It uses a database to store Pokémon profiles and user interactions, and allows users to explore Pokémon, select their favorite types and natures, and swipe through Pokémon profiles.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)

---

## Features

- **Swipe Left or Right**: Users can dislike or like Pokémon profiles.
- **Selectable Types and Natures**: Users can select Pokémon types and natures to filter the profiles they want to see.
- **Neo4j Integration**: Uses a Neo4j database to store Pokémon profile data and track likes and dislikes.
- **FastAPI Backend**: A FastAPI backend manages data exchange between the app and the Neo4j database.

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
    git clone https://github.com/your-username/pokematch.git
    cd PokeMatch
    ```

2. **Set Up Docker**:

    - Install Docker

3. **Install Node Modules**:

    Navigate to the Electron app directory and install dependencies:

    ```bash
    cd Application/my-electron-app
    npm install
    ```


4. **Run the Application**:

    - **Start Docker Compose File**: 

    - **Run Electron App**: Start the Electron application.

      ```bash
      npm start
      ```

---

## Project Structure
```plaintext
PokeMatch/
├── Application/
|   ├── backend/
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   ├── pokemon_data.py
│   |   ├── requirements.txt     
│   ├── my-electron-app/
|   │   └── animations/
|   │   └── images/
|   │   └── node_modules/
│   │   ├── index.html
│   │   ├── main.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── preload.js
│   │   └── renderer.js              
└── README.md                    
```


## Usage Guide

### Using the App



