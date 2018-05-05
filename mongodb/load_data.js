const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database name
const dbName = 'jackstagram';

// Our two collections
const usersColl = 'users';
const mediaColl = 'media';

// Types of media
const photoType = "photo";
const videoType = "video";

// Image and video sizes
const minPhotoSize = 3000;
const photoWeight = 300000;
const minVidSize = 1000000;
const vidWeight = 100000000;

// Our three users
const usersData = [{
    _id: 1,
    name : "Jack Ricci",
    followers : [2],
    following : [2, 3],
    activity: [ {
        media_id: 1,
        type: "reaction",
        time: new Date('May 1, 2018 03:24:00'),
        reaction: {
            poster: 1,
            recipient: 2,
            type: "heart"
        }
    }, {
        media_id: 2,
        type: "reaction",
        time: new Date('April 30, 2018 03:24:00'),
        reaction: {
            poster: 1,
            recipient: 2,
            type: "like"
        }
    }, {
        media_id: 3,
        type: "comment",
        time: new Date('May 5, 2018 12:00:00'),
        comment: {
            poster: 1,
            recipient: 1,
            value: "Love this pic."
        }
    }],
    posted_media: [3, 5, 7, 9, 11, 13]
}, {
    _id: 2,
    name : "Ben Stephens",
    followers : [1, 3],
    following : [1],
    activity: [ {
        media_id: 1,
        type: "comment",
        time: new Date('May 1, 2018 03:30:00'),
        reaction: {
            poster: 2,
            recipient: 2,
            value: "Thanks for all the love!"
        }
    }, {
        media_id: 3,
        type: "reaction",
        time: new Date('August 30, 2018 03:24:00'),
        reaction: {
            poster: 2,
            recipient: 1,
            type: "like"
        }
    }],
    posted_media: [1, 2, 4, 6, 8, 10, 12]
}, {
    _id: 3,
    name : "Greg Smith",
    followers : [1],
    following : [2],
    activity: [ {
        media_id: 1,
        type: "reaction",
        time: new Date('May 1, 2018 03:25:00'),
        reaction: {
            poster: 3,
            recipient: 2,
            type: "like"
        }
    }, {
        media_id: 2,
        type: "comment",
        time: new Date('May 30, 2018 03:24:00'),
        reaction: {
            poster: 3,
            recipient: 2,
            value: "You're my hero"
        }
    }],
    posted_media: [14, 15]
}];


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
/*
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
        console.log("Successfully updated rated field for " + result.modifiedCount + " documents...");
        callback();
    });
}
*/

/**
 * Function to insert pandas short
 */
/*
function insertPandas(db, callback){
//    console.log("Inserting pandas short...");

    const collection = db.collection(collName);

    // Simple insertion of panda doc
    collection.insertOne(pandasDoc, function(err, result){
        assert.equal(err, null);
        console.log("Insertion of " + result.result.n + " Pandas movie document successful...");
        callback();
    });
}
*/

/**
 * Function that prints the number of shorts in the movies
 * collection
 */
/*function countShorts(db, callback){
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
            documents.forEach(function(doc){
                console.log(doc);
            });

            callback();
        });
    });
}
*/

/**
 * Function to count US movies
 */
/*function countUSMovies(db, callback){
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
            documents.forEach(function(doc){
                console.log(doc);
            });

            callback();
        });
    });
}
*/
/*
function addVotes(db, callback){
    const joinColl = db.collection("test");

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
        callback();
    });


}
*/
/*
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
*/

function printMedia(entry){
    var str = "";

    str += "_id: " + entry._id + ",\n";
    str += "type: " + entry.type + ",\n";
    str += "photo_data: ";
    if(entry.photoData){
        str += "{\n\t file_size: " + entry.photoData.file_size + ",\n\t"
            + "filter: " + entry.photoData.filter + "\n},\n";
    }else{
        str += "null\n";
    }

    str += "video_data: ";
    if(entry.videoData){
        str += "video_data: {\n\t file_size: " + entry.videoData.file_size + ",\n\t"
            + "length: " + entry.videoData.length + "\n},\n";
    }else {
        str += "null\n";
    }

    console.log(str);
}

/**
 * Function to insert pandas short
 */
function addUsers(db, callback){
    console.log("Adding users...");

    const collection = db.collection(usersColl);

    // Simple insertion of panda doc
    collection.insertMany(usersData, function(err, result){
        assert.equal(err, null);
        console.log("Insertion of " + result.result.n + " users successful...");
        callback();
    });
}

/**
 * Simple function to pick media type
 */
function genMediaType(mediaEntry){
    mediaEntry.type = Math.floor(2*Math.random()) === 1 ? photoType : videoType;
    return mediaEntry.type;
}

/**
 * Fill data field based upon type of media
 * @param mediaEntry
 */
function fillMediaData(mediaEntry){
    var dataObject = {};

    // Fill in data field with photo or video object
    if(mediaEntry.type === photoType){
        dataObject.file_size = Math.floor(photoWeight*Math.random()) + minPhotoSize;
        dataObject.filter = "Valencia";
        mediaEntry.photoData = dataObject;
    }else{
        dataObject.file_size = Math.floor(vidWeight*Math.random()) + minVidSize;
        dataObject.length = dataObject.file_size/minVidSize;
        mediaEntry.videoData = dataObject;
    }

    return 1;
}
/**
 * Add media using user info
 */
function addMedia(db, callback){
    var mediaData = [];

//    const collection = db.collection(usersColl);

    // Iterate through users objects
    for(var i = 0; i < usersData.length; i++){
        const user = usersData[i];
        console.log("ADD_MEDIA: User is: " + user);
        if(!user.hasOwnProperty("posted_media")){
            console.log("ADD_MEDIA: Error - no posted_media property for user. Exiting");
            callback(mediaData);
            return;
        }

        // Craft media object
        for(var j = 0; j < user.posted_media.length; j++){
            const postId = user.posted_media[j];
            var mediaEntry = {};

            mediaEntry._id = postId;
            if(genMediaType(mediaEntry) === null){
                console.log("ADD_MEDIA: Error - unable to initialize type property. Exiting.");
                callback(mediaData);
                return;
            }

            if(fillMediaData(mediaEntry) === null){
                console.log("ADD_MEDIA: Error - unable to initialize data property. Exiting.");
                callback(mediaData);
                return;
            }

            mediaData.push(mediaEntry);
        }
    }


    for(i = 0; i < mediaData.length; i++){
        printMedia(mediaData[i]);
    }

    callback();
}



/**
    On connection:
 1.) Add users
 2.) Add media
**/
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    // Get database object
    const db = client.db(dbName);

    // Insert users
//    addUsers(db, function(){
        addMedia(db, function(){
            // Close connection
            closeConn(client);
        });

//    });
});



