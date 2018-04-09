var redis = require('redis');

var ONE_WEEK_IN_SECONDS = 7 * 86400;
var ONE_WEEK_IN_MILLISECONDS = 1000 * ONE_WEEK_IN_SECONDS;
var VOTE_SCORE = 432;

function article_vote(client, user, article) {
    var cutoff = Date.now() - ONE_WEEK_IN_MILLISECONDS;
    //var article_time = 1000 * client.zscore("time:", article);
   // client.zscore('time', article, redis.print);
//    if (! article_time < cutoff) {
        var article_id = article.split(':')[1];
       console.log("In article vote...");
	 client.sadd('voted:' + article_id, user, redis.print)
            client.zincrby('score:', VOTE_SCORE, article, redis.print);
            client.hincrby(article, 'votes', 1, redis.print);
console.log("Leaving article vote...");
        
//    }
}

function article_switch_vote(client, user, from_article, to_article) {
    // HOMEWORK 2 Part I
    // Get article ids
    var from_article_id = from_article.split(':')[1];
    var to_article_id = to_article.split(':')[1];

    // LOGGING: Each important piece of info
    console.log("Originally: ");
    console.log("From_article_id: " + from_article_id);
    console.log("User is in from article set: " + client.sismember('voted:' + from_article_id, user, redis.print));
    console.log("User is in to_article set: " + client.sismember('voted:' + to_article_id, user, redis.print));
    console.log("from_article votes: " + client.hget(from_article, 'votes'));
    console.log("to_articel votes: " + client.hget(to_article, 'votes'));

    // First remove vote from other article set
    if(client.srem('voted:' + from_article_id, user) != 1){
	console.log("User never voted for first article");
    }

    // Decrement score
    client.zincrby('score:', -VOTE_SCORE, from_article);
    client.hincrby(from_article, 'votes', -1);
    // LOGGING: Each important piece of info
    console.log("After remove: ");
    console.log("User is in from article set: " + client.sismember('voted:' + from_article_id, user));
    console.log("User is in to_article set: " + client.sismember('voted:' + to_article_id, user));
    console.log("from_article votes: " + client.hget(from_article, 'votes'));
    console.log("to_articel votes: " + client.hget(to_article, 'votes'));


    // Then same code as switching vote to another article
    if (client.sadd('voted:' + to_article_id, user)) {
        client.zincrby('score:', VOTE_SCORE,to_article);
        client.hincrby(to_article, 'votes', 1);
    }

    // LOGGING: Each important piece of info
    console.log("After add: ");
    console.log("User is in from article set: " + client.sismember('voted:' + from_article_id, user));
    console.log("User is in to_article set: " + client.sismember('voted:' + to_article_id, user));
    console.log("from_article votes: " + client.hget(from_article, 'votes'));
    console.log("to_articel votes: " + client.hget(to_article, 'votes'));


}

var client = redis.createClient();
client.on('connect', function(){
	console.log('connected...');
article_vote(client, "user:3", "article:1");

// user:3 up votes article:3
article_vote(client, "user:3", "article:3")
//console.log(client.hget("article:3", "title"));
// user:2 switches their vote from article:8 to article:1
//article_switch_vote(client, "user:2", "article:8", "article:1")

// Which article's score is between 10 and 20?
// PRINT THE ARTICLE'S LINK TO STDOUT:
// HOMEWORK 2 Part II
client.zrangebyscore('score:', 10, 20, function(err, reply){
	client.hget(reply, 'link', redis.print);
});

client.quit();
});
/*
// user:3 up votes article:1
article_vote(client, "user:3", "article:1")
// user:3 up votes article:3
article_vote(client, "user:3", "article:3")
console.log(client.hget("article:3", "title"));
// user:2 switches their vote from article:8 to article:1
article_switch_vote(client, "user:2", "article:8", "article:1")

// Which article's score is between 10 and 20?
// PRINT THE ARTICLE'S LINK TO STDOUT:
// HOMEWORK 2 Part II
var article = client.zrangebyscore('score:', 10, 20);
console.log(client.hget(article, 'link'));
*/
//clirticle_vote(client, "user:3", "article:1")
// user:3 up votes article:3
/*
article_vote(client, "user:3", "article:3")
console.log(client.hget("article:3", "title"));
// user:2 switches their vote from article:8 to article:1
article_switch_vote(client, "user:2", "article:8", "article:1")

// Which article's score is between 10 and 20?
// PRINT THE ARTICLE'S LINK TO STDOUT:
// HOMEWORK 2 Part II
var article = client.zrangebyscore('score:', 10, 20);
console.log(client.hget(article, 'link'));ent.quit();*/
