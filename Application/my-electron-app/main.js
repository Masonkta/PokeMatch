const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

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

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

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

ipcMain.handle('fetch-profile', async (event, profile) => {
    try {
        const response = await axios.post('http://localhost:8000/fetch-profile/', profile);
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
