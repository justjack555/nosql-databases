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
        comment: {
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
        comment: {
            poster: 3,
            recipient: 2,
            value: "You're my hero"
        }
    }],
    posted_media: [14, 15]
}];

/*
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

    // Date
    str += "time_posted: " + entry.time_posted.toISOString() + ",\n";

    //Stats
    str += "stats: {\n\tnum_reax: " + entry.stats.num_reax + ",\n\tnum_comments: " + entry.stats.num_comments + "\n}"

    console.log(str);
}
*/

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
 * Load comments and reactions into media objects
 */
function loadReactions(mediaEntry){
    var i;
    mediaEntry.reactions = [];
    mediaEntry.comments = [];
    mediaEntry.stats = {
        num_reax : 0,
        num_comments : 0
    };

    // Iterate through each user
    for(i = 0; i < usersData.length; i++){
        const user = usersData[i];
        // Iterate through user's activity
        var j;
        for(j = 0; j < user.activity.length; j++){
            const action = user.activity[j];
            if(action.media_id === mediaEntry._id){
                if(action.type === "reaction"){
                    mediaEntry.reactions.push(action.reaction);
                }else{
                    mediaEntry.comments.push(action.comment);
                }
            }
        }
    }

    mediaEntry.stats.num_reax = mediaEntry.reactions.length;
    mediaEntry.stats.num_comments = mediaEntry.comments.length;
    return 1;
}

/**
 * Add media using user info
 */
function addMedia(db, callback){
    var mediaData = [];

    const collection = db.collection(mediaColl);
    console.log("Adding media objects...");

    // Iterate through users objects
    for(var i = 0; i < usersData.length; i++){
        const user = usersData[i];
        if(!user.hasOwnProperty("posted_media")){
            console.log("ADD_MEDIA: Error - no posted_media property for user. Exiting");
            callback();
            return;
        }

        // Craft media object
        for(var j = 0; j < user.posted_media.length; j++){
            const postId = user.posted_media[j];
            var mediaEntry = {};

            mediaEntry._id = postId;
            // Type of media
            if(genMediaType(mediaEntry) === null){
                console.log("ADD_MEDIA: Error - unable to initialize type property. Exiting.");
                callback();
                return;
            }

            // Video/photo statistics
            if(fillMediaData(mediaEntry) === null){
                console.log("ADD_MEDIA: Error - unable to initialize data property. Exiting.");
                callback();
                return;
            }

            // Add date
            const day = Math.floor(31*Math.random()) + 1;
            mediaEntry.time_posted = new Date('March ' + day + ', 2018 03:24:00');

            // Add reactions and comments
            if(loadReactions(mediaEntry) === null){
                console.log("ADD_MEDIA: Error - unable to load reactions. Exiting.");
                callback();
                return;
            }

            mediaData.push(mediaEntry);
        }
    }

    // Simple insertion of panda doc
    collection.insertMany(mediaData, function(err, result){
        assert.equal(err, null);
        console.log("Insertion of " + result.result.n + " media entries successful...");
        callback();
    });
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
    addUsers(db, function(){
        addMedia(db, function(){
            // Close connection
            closeConn(client);
        });

    });
});



