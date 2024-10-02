const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

let isDataPreloaded = false; // Flag to track if data has been preloaded

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,

        },
        autoHideMenuBar: true // Hide the menu bar
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    startup()
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Function to call the FastAPI startup endpoint
async function startup() {
    if (isDataPreloaded) return; // If data is already preloaded, exit early

    try {
        const response = await axios.get('http://localhost:8000/startup/');
        if (response.status === 200) {
            console.log('Pokémon data preloaded:', response.data.message);
            isDataPreloaded = true; // Set the flag to true after successful preloading
        } else {
            console.error('Failed to preload Pokémon data');
        }
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

ipcMain.handle('fetch-profile', async (event, profile, id) => {
    try {
        const response = await axios.post('http://localhost:8000/fetch_profile/', {
            params: {
                profile: profile,
                id, id
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error has occured fetching data", error);
        return { message: "Error fetching data."};
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
