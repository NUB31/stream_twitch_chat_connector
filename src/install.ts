import defaultSettings from "./bundledAssets/settings.json";
import download from "download";
import fs from "fs-extra";

const path = process.env.APPDATA + "\\nub31\\stream\\twitch_chat_connector";

async function setup() {
  try {
    await fs.mkdirs(path);
    await resetSettings();
    await resetServer();
  } catch (err) {
    console.error("Something went wrong installing the application. ERROR:");
    throw err;
  }
}

async function resetSettings() {
  try {
    console.log("Resetting settings");
    await fs.writeFile(
      path + "\\settings.json",
      JSON.stringify(defaultSettings, null, 2)
    );
  } catch (err) {
    console.error("Something went wrong resetting the settings. ERROR:");
    throw err;
  }
}

async function resetServer() {
  try {
    console.log("Downloading main server file");
    await download(
      "https://github.com/nub31/twitch_twitch_chat_connector/releases/latest/download/server.exe",
      path
    );
  } catch (err) {
    console.error("Something went wrong the server file. ERROR:");
    throw err;
  }
}

setup();
