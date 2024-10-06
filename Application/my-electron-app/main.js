const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const axios = require('axios');

let count_num = 0;

let isDataPreloaded = false; // Flag to track if data has been preloaded

function createWindow() {

    const {width, height } = screen.getPrimaryDisplay().workAreaSize;

    
    const win = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,

        },
        autoHideMenuBar: true // Hide the menu bar
    });

    win.loadFile('index.html');

    // Listen for when the renderer is ready
    win.webContents.once('did-finish-load', () => {
        startup(win); // Pass the window instance to startup
    });
}

app.whenReady().then(() => {
    createWindow();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Function to call the FastAPI startup endpoint
async function startup(win) {
    if (isDataPreloaded) return; // If data is already preloaded, exit early

    try {
        const response = await axios.get('http://localhost:8000/startup/');
        if (response.status === 200) {
            console.log('Pokémon data preloaded:', response.data.message);
            isDataPreloaded = true; // Set the flag to true after successful preloading
        } else {
            console.error('Failed to preload Pokémon data');
        }

        const count = await axios.get('http://localhost:8000/count_pokemon/')
        if (count.status === 200)  {
            console.log('Got Pokémon count:', count.data.pokemon_count);
            count_num = count.data.pokemon_count;

            // Send count_num to the renderer process
            win.webContents.send('pokemon-count', count_num);
        } else {
            console.error('Failed to get Pokémon count');
        }

        let random = RandomId(0, count_num);
        
        // Send the random ID to the renderer to call fetchPokemon
        win.webContents.send('fetch-pokemon', random);
    } catch (error) {
        console.error('Error calling FastAPI startup:', error.message);
    }
}

/*
// Handle profile creation via IPC
ipcMain.handle('create-profile', async (event, profile) => {
    try {
        const response = await axios.post('http://localhost:8000/create_profile/', profile);
        return response.data;
    } catch (error) {
        console.error("Error creating profile:", error);
        return { message: "Error creating profile." };
    }
});
*/

ipcMain.handle('fetch-profile', async (event, id) => {
    try {
        // Send the ID as a query parameter
        const response = await axios.get('http://localhost:8000/fetch_profile/', {
            params: { id }  // Pass the ID here
        });
        return response.data; // Return the fetched data
    } catch (error) {
        console.error("Error has occurred fetching data", error);
        return { message: "Error fetching data." }; // Return an error message
    }
});

function RandomId(min, max) {
    let randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId;
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
