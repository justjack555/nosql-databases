// Put the use case you chose here. Then justify your database choice:
//  - I selected the photo sharing site as use-case. I selected MongoDB because
// documents with nested field values served as the ideal way to represent the
// application's back-end. MongoDB allowed me to divide the data into 2 natural
// collections : users and media, one of which held user data, the other holding
// photo/video specific data. The two collections hold references to data in the
// other by storing id values (the unique identifier of Mongo documents) that
// represent documents in the other collection.
//
// Explain what will happen if coffee is spilled on one of the servers in your cluster, causing it to go down.
// - We would use replication to ensure that when that server goes down, we still have other
// servers that hold copies of the data on that machine so that content can still be served
// as thought server A never went down.
//
//
// What data is it not ok to lose in your app? What can you do in your commands to mitigate the risk of lost data?
// - Cannot lose user_ids or media_ids, as much of the cross referencing between collections
// is done by using these ids. We can use write concerns and replication in the insert/update
// commands in order to ensure that all data written to the data based is safely written to
// multiple storage locations before we proceed on with the code.
//



//// Action 1: The user named "Dan House" signs up for a Jackstagram account


// Action 2: "Dan House" follows the user "Jack Ricci"


// Action 3: "Dan House" comments on one of the user "Jack Ricci"'s photo


// Action 4: "Dan House" uploads his first photo to Jackstagram


// Action 5: "Dan House" by accident likes his own photo via a heart reaction


// Action 6: "Dan House" views the last 3 photos uploaded (by date) by people he follows


// Action 7: "Dan House" views all of the user "Jack Ricci"'s photos


// Action 8: "Dan House" unfollows "Jack Ricci"



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

// Base object for new user
const newUser = {
    name : "Dan House",
    followers : [],
    following : [],
    activity: [],
    posted_media: []
};

/**
 * Function to be invoked at connection closing time
 */
function closeConn(client){
    console.log("\nClosing connection with server...");
    client.close();
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
 * Function to insert new user
 */
function addUser(db, callback){
    const collection = db.collection(usersColl);

    // Simple insertion of Dan House
    collection.insertOne(newUser, function(err, result){
        assert.equal(err, null);
        console.log("Insertion of " + result.result.n + " user with name " + result.ops[0].name + " successful...");
        callback(result.ops[0]._id);
    });
}

/**
 * Function to have user Dan House follow user Jack
 * @param db
 * @param followingName
 * @param callback
 */
function followJack(db, newId, followingName, callback){
    const collection = db.collection(usersColl);

    // Find user to follow and update his/her followers list
    collection.findOneAndUpdate({name : followingName},
        {$push : {followers : newId}},
        {returnOriginal : false},
        function(err, result){
            assert.equal(err, null);
            console.log("New length of Jack's followers list is: " + result.value.followers.length);

            // Modify new user's following
            collection.findOneAndUpdate({_id: newId},
                {$push : {following : result.value._id}},
                {returnOriginal : false},
                function(err, result){
                    assert.equal(err, null);
                    console.log("New length of Dan's following list is: " + result.value.following.length);
                    callback();
            });
    });
}

/**
 * newId user adds comment to media posted
 * by user he/she follows
 * @param db
 * @param newid
 * @param following
 * @param callback
 */
function addComment(db, newid, following, callback){


    const usersCollection = db.collection(usersColl);
    const mediaCollection = db.collection(mediaColl);

    // Find user with following id and obtain last media_id he posted
    usersCollection.findOne({name : following}, (function(newid){
        return function(err, result){
            assert.equal(err, null);
            // Get last post
            const lastPost = result.posted_media[result.posted_media.length - 1];
            const newComment = {
                poster: newid,
                recipient: result._id,
                value: "So excited to now be following you!!"
            };
            console.log("New comment by poster: " + newComment.poster + " to recipient " + newComment.recipient + " added successfully...");

            // Find and update the media in the media collection corresponding to this image
            mediaCollection.findOneAndUpdate({_id : lastPost},
                {
                    $push : {comments : newComment},
                    $inc: { "stats.num_comments" : 1 }
                },
                {returnOriginal : false},
                function(err, result){
                    assert.equal(err, null);
                    const newEntry = result.value.comments[result.value.comments.length - 1];
                    const newActivity = {
                        media_id: result.value._id,
                        type: "comment",
                        time: new Date('May 6, 2018 08:49:00'),
                        comment: newEntry
                    };


                    // Use the comment posted to add to the newId user's activity collection
                    usersCollection.findOneAndUpdate({_id : newEntry.poster},
                        {$push : {
                            activity : newActivity
                        }}, function(err, result){
                                assert.equal(err, null);
                                callback();
                        });
                });
        };
    })(newid));
}

function uploadMedia(db, newId, callback){
    const mediaCollection = db.collection(mediaColl);
    const usersCollection = db.collection(usersColl);

    // Create new media object
    const newMedia = {
        type : photoType,
        stats : {
            num_reax : 0,
            num_comments : 0
        },
        photo_data : {
            file_size : Math.floor(photoWeight*Math.random()) + minPhotoSize,
            filter : "Valencia"
        },
        time_posted : new Date('May 6, 2018 11:53:00'),
        reactions : [],
        comments : []
    };

    // Insert it into media collection
    mediaCollection.insertOne(newMedia, function(err, result){
        assert.equal(err, null);
        console.log("Insertion of " + result.result.n + " photo with id " + result.ops[0]._id + " successful...");
        usersCollection.findOneAndUpdate({_id : newId},
            {$push : {posted_media : result.ops[0]._id}},
            {returnOriginal : false},
            function(err, result){
                assert.equal(err, null);
                callback();
            });
    });
}

function ownLike(db, newid, callback){


    const usersCollection = db.collection(usersColl);
    const mediaCollection = db.collection(mediaColl);

    // Find user with following id and obtain last media_id he posted
    usersCollection.findOne({_id : newid}, (function(newid){
        return function(err, result){
            assert.equal(err, null);
            // Get last post
            const lastPost = result.posted_media[result.posted_media.length - 1];
            const newReaction = {
                poster: newid,
                recipient: result._id,
                type: "heart"
            };

            // Find and update the media in the media collection corresponding to this image
            mediaCollection.findOneAndUpdate({_id : lastPost},
                {
                    $push : {reactions : newReaction},
                    $inc: { "stats.num_reax" : 1 }
                },
                {returnOriginal : false},
                function(err, result){
                    assert.equal(err, null);
                    const newEntry = result.value.reactions[result.value.reactions.length - 1];
                    const newActivity = {
                        media_id: result.value._id,
                        type: "reaction",
                        time: new Date('May 6, 2018 12:19:00'),
                        reaction: newEntry
                    };


                    // Use the comment posted to add to the newId user's activity collection
                    usersCollection.findOneAndUpdate({_id : newEntry.poster},
                        {$push : {
                            activity : newActivity
                        }}, function(err, result){
                            assert.equal(err, null);
                            console.log("Successfully updated " + result.value.name + "'s activity...");
                            callback();
                        });
                });
        };
    })(newid));
}

/**
 * Last two images on timeline
 * @param db
 * @param newId
 * @param callback
 */
function lastThree(db, newId, callback){
    const usersCollection = db.collection(usersColl);
    const mediaCollection = db.collection(mediaColl);

    // Find user with following id
    usersCollection.findOne({_id : newId}, function(err, result){
        assert.equal(err, null);

        // Get users you follow
        const followingList = result.following;

        // Find and update the media in the media collection corresponding to this image
        usersCollection.find({_id : { $in: followingList }}).toArray(function(err, result){
            assert.equal(err, null);

            // Combine all media into one array
            var i;
            var allMedia = [];
            for(i = 0; i < result.length; i++){
                const curUser = result[i];
                allMedia = allMedia.concat(curUser.posted_media);
            }

            // Find top three media posted by following list
            mediaCollection.find({_id : {$in: allMedia}},
                {limit : 3,
                 sort : [["time_posted", -1]]}).toArray(function(err, result){
                     var i;
                     for(i = 0; i < result.length; i++){
                         console.log("The " + i + "th newest media posted has date " + result[i].time_posted);
                     }
                    callback();
            });
        });
    });
}

/**
 * Get all photos from one other user
 */
function oneUser(db, newId, callback){
    const usersCollection = db.collection(usersColl);
    const mediaCollection = db.collection(mediaColl);

    // Find user with following id
    usersCollection.findOne({_id : newId}, function(err, result){
        assert.equal(err, null);

        // Get users you follow
        if(result.following.length < 1){
            console.log("One_User: User is not following anyone. Please follow someone...");
            return;
        }
        // Get other user's ID
        const otherUser = result.following[0];

        // Find and update the media in the media collection corresponding to this image
        usersCollection.findOne({_id : otherUser}, function(err, result){
            assert.equal(err, null);

            // Find top two media posted by following list
            mediaCollection.find({_id : {$in: result.posted_media}},
                {
                    sort : [["time_posted", -1]]
                }).toArray(function(err, result){
                var i;
                for(i = 0; i < result.length; i++){
                    console.log("The " + i + "th newest media posted by user " + otherUser + " is: " + JSON.stringify(result[i]));
                }
                callback();
            });
        });
    });
}

function unfollow(db, newId, followingName, callback) {
    const usersCollection = db.collection(usersColl);

    // Find user with following id
    usersCollection.findOneAndUpdate(
        {name : followingName},
        {$pull : {followers : newId}},
        {returnOriginal : false},
        function(err, result){
            assert.equal(err, null);
            console.log("Dan remains in Jacs followers list: " + result.value.followers.includes(newId));

            // Use unfollowed individual's id to update newId's following list
            usersCollection.findOneAndUpdate(
                {_id: newId},
                {$pull : {following : result.value._id}},
                {returnOriginal : false},
                function(err, result){
                    assert.equal(err, null);
                    console.log("Size of Dan's following list after unfollowing Jack: " + result.value.following.length);
                    callback();
                });
        });
}

MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    // Get database object
    const db = client.db(dbName);
    const followingName = "Jack Ricci";

    // Insert users
    console.log("\nLoading all preliminary data...");
    addUsers(db, function(){
        addMedia(db, function(){
            //Sign up for account
            console.log("\nSigning up for account...");
            addUser(db, function(newId){
                // Follow someone new
                console.log("\nUser " + newId + " attempting to follow someone new...");
                followJack(db, newId, followingName, function(){

                    // Comment on a post
                    console.log("\nUser " + newId + " attempting to add a comment...");
                    addComment(db, newId, followingName, function(){
                        // Upload a photo
                        console.log("\nUploading first media object...");
                        uploadMedia(db, newId, function(){
                            // Like your own photo by accident
                            console.log("\nLiking own photo by accident...");
                            ownLike(db, newId, function(){
                                // Find two most recent posts
                                console.log("\nFinding three most recent posts in feed...");
                                lastThree(db, newId, function(){
                                    // See all of the photos from one other user
                                    console.log("\nFinding all of Jack Riccis photos...");
                                    oneUser(db, newId, function(){
                                        // Unfollow other user
                                        console.log("\nUnfollowing Jack Ricci");
                                        unfollow(db, newId, followingName, function(){
                                            // Close connection
                                            closeConn(client);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});



