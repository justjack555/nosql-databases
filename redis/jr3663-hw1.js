const https = require('https');

// Base API URL
const baseURI = "https://api.nasa.gov/planetary/apod";

// Query parameters
const dateStr = "date=2017-05-26";
const myKey = "api_key=hCV67hhumMFukWvVUGoyNrw055X1g6RRxDgXdclM";

var data;

/**
 * Function to handle end event
 * Simply prints url to screen
 */
function endHandler(){
    try{
        const imgUrl = JSON.parse(data).url;
        console.log(imgUrl);
    }catch(e){
        console.error(e.message);
    }
}

/**
 * Function to handle data event.
 * Concatenates response string to
 * data string
 * @param res
 */
function dataHandler(res){
    data += res;
}

/**
 * Function to handle response to get call
 */
function handleRes(res){
    data = "";
    res.on('data', dataHandler);
    res.on('end', endHandler);
}

/**
 * Function to handle error on get attempt
 * @param err
 */
function handleErr(err){
    console.log("Error: " + err.message);
}

// Get request for URI
https.get(baseURI + "?" + myKey + "&" + dateStr, handleRes).on("error", handleErr);