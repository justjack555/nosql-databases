const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';

const dbName = 'movies';
const collName = 'movies';

/**
  * Function to be invoked at connection closing time
 */
function closeConn(client){
    console.log("Closing connection with server...");
    client.close();
}

/*function handleUnrated(err, result){
    assert.equal(err, null);

    console.log("Handle Unrated: Found following docs: " + result);

    //Close connection

} */

/**
 * Function to find all unrated movies in SHORT genre
 */
function findUnrated(db, callback){
    const collection = db.collection(collName);

    // Genre must be short, rating must be UNRATED
    const unratedParam = {
        "genres" : "Short",
        "rated" : "Pending rating"
    };

    collection.find(unratedParam).toArray(function (err, result){
        assert.equal(err, null);

        console.log("Handle Unrated: Found following docs: ");

        result.forEach(function(movie){
            console.log("NEW MOVIE:");
            console.log(movie);
        });

        console.log("Number of results is: " + result.length);

        //Close connection
        callback();
    });
}

/**
 * Function to update unrated shorts
 */
function updateUnrated(db, callback){
    const collection = db.collection(collName);

    // Genre must be short, rating must be UNRATED
    const unratedParam = {
        "genres" : "Short",
        "rated" : "NOT RATED"
    };

    const unratedUpdate = { $set: { rated : "Pending rating" } };

    collection.updateMany(unratedParam, unratedUpdate, function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.ok);
        console.log("Number of updated docs is: " + result.modifiedCount);
        callback();
    });
}


MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    //Find unrated shorts
    updateUnrated(db, function(){
        findUnrated(db, function(){
            closeConn(client);
        });
    });

});
