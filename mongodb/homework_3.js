const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';

const dbName = 'movies';
const collName = 'movies';

// Pandas movie document object
const pandasDoc = {
    title : "Pandas",
    year : 2018,
    countries : ["USA"],
    genres: [ "Documentary", "Short"],
    directors: [" David Douglas", "Drew Fellman"],
    imdb : {
        id : 7860270,
        rating : 7.6,
        votes : 39
    }
};

/**
  * Function to be invoked at connection closing time
 */
function closeConn(client){
    console.log("Closing connection with server...");
    client.close();
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
//        console.log("Number of updated docs is: " + result.modifiedCount);
        callback();
    });
}

/**
 * Function to insert pandas short
 */
function insertPandas(db, callback){
//    console.log("Inserting pandas short...");

    const collection = db.collection(collName);

    // Simple insertion of panda doc
    collection.insertOne(pandasDoc, function(err, result){
        assert.equal(err, null);
//        console.log("INSERT PANDAS: No err..");
        assert.equal(result.result.n, 1);
        assert.equal(result.ops.length, 1);
        console.log("Insertion of panda successful...");
        callback();
    });
}

/**
 * Function that prints the number of shorts in the movies
 * collection
 */
function countShorts(db, callback){
//    console.log("Counting number of shorts...");

    const collection = db.collection(collName);

    const pipeline = [ {
        $match: {
            genres: "Short"
        }},
        {
            $group: {
                _id: "Short",
                count: {
                    $sum: 1
                }
            }
        }];

    collection.aggregate(pipeline, function(err, cursor){
        cursor.toArray(function(error, documents){
           assert.equal(error, null);

//           console.log("countshorts: Number of docs is: " + documents.length);

           documents.forEach(function(doc){
               console.log(doc);
           });

           callback();
        });
    });
}

/**
 * Function to count US movies
 */
function countUSMovies(db, callback){
//    console.log("Counting number of US movies...");

    const collection = db.collection(collName);

    const pipeline = [ {
        $match: {
            countries: "USA",
            rated : "Pending rating"
        }},
        {
            $group: {
                _id: {
                    country: "USA",
                    rating : "Pending rating"
                },
                count: {
                    $sum: 1
                }
            }
        }];

    collection.aggregate(pipeline, function(err, cursor){
        cursor.toArray(function(error, documents){
            assert.equal(error, null);

//            console.log("countUSA: Number of docs is: " + documents.length);

            documents.forEach(function(doc){
                console.log(doc);
            });

            callback();
        });
    });
}

function addVotes(db, callback){
    const joinColl = db.collection("test");
//    console.log("Adding votes to test collection...");
    joinColl.insertMany([{
        title: "Pandas",
        vote: "bad"
    }, {
        title: "Pandas",
        vote: "good"
    }, {
        title: "Pandas",
        vote: "bad"
    }, {
        title: "Very Private Lesson",
        vote: "good"
    }], function(err, reply){
        assert.equal(err, null);
        assert.equal(reply.result.n, 4);
        assert.equal(reply.ops.length, 4);
//        console.log("Insertion of votes successful...");
        callback();
    });


}

function joinOnVotes(db, callback){
    const collection = db.collection(collName);
    const collToJoin = "test";

    const pipeline = [{
        $lookup: {
            from: collToJoin,
            localField: "title",
            foreignField: "title",
            as: "votes"
        }
    }];

    console.log("Computing lookup results...");
    collection.aggregate(pipeline, function(err, cursor){
        cursor.toArray(function(error, documents){
            assert.equal(error, null);

            documents.forEach(function(doc){
                if(doc.votes.length > 0){
                    console.log("The following movie has votes in the test collection: ");
                    console.log(doc);
                }
            });

            callback();
        });
    });
}

MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    console.log("Beginning Part A execution...");

    //Updated unrated shorts
    updateUnrated(db, function(){
        console.log("Beginning Part B execution...");

        // Insert Pandas movie
            insertPandas(db, function(){
                console.log("Beginning Part C execution...");

                // Find number of shorts
                countShorts(db, function(){
                    console.log("Beginning Part D execution...");

                    countUSMovies(db, function(){
                        console.log("Beginning Part E execution...");

                        //Add votes to test
                        addVotes(db, function(){

                            //Finally, join on Panda title
                            joinOnVotes(db, function(){

                                //Clean up
                                closeConn(client);

                                    //Callback hell much?
                            });
                        });
                    });
                });
            });
    });
});
