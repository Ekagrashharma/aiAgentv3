import "dotenv/config"
import { google } from "@google/genai"


const apikey = process.env.GEMINI_API_KEY;

if(!apikey){
    throw new Error("gemini api key is not found")
}

const ai = new google({
    apikey
});

getweather("bareilly")