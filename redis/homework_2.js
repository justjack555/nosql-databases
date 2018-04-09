var redis = require('redis');

var ONE_WEEK_IN_SECONDS = 7 * 86400;
var ONE_WEEK_IN_MILLISECONDS = 1000 * ONE_WEEK_IN_SECONDS;
var VOTE_SCORE = 432;

function article_vote(client, user, article) {
     var article_id = article.split(':')[1];
	 client.sadd('voted:' + article_id, user)
     client.zincrby('score:', VOTE_SCORE, article);
     client.hincrby(article, 'votes', 1);
}

function article_switch_vote(client, user, from_article, to_article) {
    // HOMEWORK 2 Part I
    // Get article ids
    var from_article_id = from_article.split(':')[1];
    var to_article_id = to_article.split(':')[1];

    // First remove vote from other article set
    client.srem('voted:' + from_article_id, user);

    // Decrement score
    client.zincrby('score:', -VOTE_SCORE, from_article);
    client.hincrby(from_article, 'votes', -1);

    // Then same code as adding vote to another article
    client.sadd('voted:' + to_article_id, user);
    client.zincrby('score:', VOTE_SCORE, to_article);
    client.hincrby(to_article, 'votes', 1);
}

//Create client
var client = redis.createClient();

// Wait for connection to be made
client.on('connect', function(){
	article_vote(client, "user:3", "article:1");

	// user:3 up votes article:3
	article_vote(client, "user:3", "article:3")

	// user:2 switches their vote from article:8 to article:1
	article_switch_vote(client, "user:2", "article:8", "article:1")

	// Which article's score is between 10 and 20?
	// PRINT THE ARTICLE'S LINK TO STDOUT:
	// HOMEWORK 2 Part II
	client.zrangebyscore('score:', 10, 20, function(err, reply){
		//We only should have a single result
		if(reply.length != 1){
			console.log("Unexpected number of results in specified score range. Check data load");
		}
	
		// Use single result in set to obtain value in link field
		client.hget(reply[0], 'link', function(err, link){
			console.log(link);
	
			// Kill client before program termination
			client.quit();
		});	
	});
});
