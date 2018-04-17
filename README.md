# nosql-databases

## Homework 3

Homework 3 was completed using node.js. 
The solution code appears on the justjack555/nosql-databases "homework-3"
branch.  
  
In order to import movies data, the following steps were taken while in
the mongodb/ subdirectory:

1. `$ mkdir dump`
2. Download the movies.bson data file into dump/movies.bson
3. `$ mongorestore --db movies dump/`

This created the "movies" database and loaded all bson formatted movie
data into the "movies" collection in the "movies" database.  

To run the homework 2 solution code, simply do the following starting from the nosql-databases root directory:

    $ cd mongodb
    $ node homework_3.js
    
## Expected output
```
Connected successfully to server
Beginning Part A execution...
Successfully updated rated field for 61 documents...
Beginning Part B execution...
Insertion of 1 Pandas movie document successful...
Beginning Part C execution...
{ _id: 'Short', count: 1520 }
Beginning Part D execution...
{ _id: { country: 'USA', rating: 'Pending rating' }, count: 44 }
Beginning Part E execution...
Computing lookup results...
The following movie has votes in the test collection: 
{ _id: 573a13daf29313caabdacb01,
  title: 'Very Private Lesson',
  year: 1998,
  runtime: 40,
  released: 1998-04-21T00:00:00.000Z,
  cast: 
   [ 'Kotono Mitsuishi',
     'Y�ji Ueda',
     'Y�ko Miyamura',
     'Shigeru Chiba' ],
  plot: 'Tairaku is a teacher at a local high school. He has a crush on Ms. Satsuki, a fellow teacher whom he hopes to someday marry. Then he meets Aya Shirakaba, upon whom he makes such a favorable...',
  fullplot: 'Tairaku is a teacher at a local high school. He has a crush on Ms. Satsuki, a fellow teacher whom he hopes to someday marry. Then he meets Aya Shirakaba, upon whom he makes such a favorable impression that she transfers into his class. Unfortunately, Aya\'s father is a very wealthy and powerful yakuza boss, who charges Tairaku with keeping his daughter safe and pure-or else. Add to that the hordes of men and woman at school who\'d love to get their hands on Aya\'s body, and that Aya has secretly moved in with Tairaku, and constantly makes passes at him, and Tairaku is now in world of trouble.',
  lastupdated: '2015-06-09 00:06:27.637000000',
  type: 'movie',
  languages: [ 'Japanese' ],
  directors: [ 'Hideaki �ba' ],
  imdb: { rating: 5.4, votes: 10, id: 2304700 },
  countries: [ 'Japan' ],
  rated: 'Pending rating',
  genres: [ 'Animation', 'Short', 'Comedy' ],
  tomatoes: 
   { website: 'http://mandelafilm.com/',
     viewer: { rating: 3.7, numReviews: 22166, meter: 68 },
     dvd: 2014-03-18T00:00:00.000Z,
     rotten: 51,
     boxOffice: '$1.4M',
     consensus: 'It might be too respectful to truly soar, but there\'s no denying Idris Elba\'s impressive work in Mandela: Long Walk to Freedom -- or the inspirational power of the life it depicts.',
     critic: { rating: 6.2, numReviews: 122, meter: 58 },
     production: 'The Weinstein Co.',
     lastUpdated: 2015-08-24T18:14:20.000Z,
     fresh: 71 },
  num_mflix_comments: 3,
  comments: 
   [ { name: 'Karina Martin',
       email: 'karina_martin@fakegmail.com',
       movie_id: 573a13daf29313caabdacb01,
       text: 'Voluptas rem amet eum odio consequuntur blanditiis temporibus. Beatae perferendis incidunt explicabo quaerat repudiandae soluta omnis. Sit quia a necessitatibus.',
       date: 2002-02-14T21:02:14.000Z,
       _id: '573a13daf29313caabdacb01-Karina Martin-1013738534.0' },
     { name: 'Davos Seaworth',
       email: 'liam_cunningham@gameofthron.es',
       movie_id: 573a13daf29313caabdacb01,
       text: 'Iure ratione amet veritatis sequi necessitatibus voluptas. Aperiam illo temporibus sapiente explicabo. Enim porro nulla numquam laudantium ut quo.',
       date: 1982-05-09T15:59:15.000Z,
       _id: '573a13daf29313caabdacb01-Davos Seaworth-389822355.0' },
     { name: 'Jaime Lannister',
       email: 'nikolaj_coster-waldau@gameofthron.es',
       movie_id: 573a13daf29313caabdacb01,
       text: 'Ut necessitatibus deserunt voluptatibus odio sequi. Quis voluptas amet magnam beatae repellendus et officiis consequuntur. Cupiditate odio at praesentium nihil sit.',
       date: 1979-09-28T13:46:25.000Z,
       _id: '573a13daf29313caabdacb01-Jaime Lannister-307388785.0' } ],
  votes: 
   [ { _id: 5ad6790e787161295d07663b,
       title: 'Very Private Lesson',
       vote: 'good' } ] }
The following movie has votes in the test collection: 
{ _id: 5ad6790e787161295d076637,
  title: 'Pandas',
  year: 2018,
  countries: [ 'USA' ],
  genres: [ 'Documentary', 'Short' ],
  directors: [ ' David Douglas', 'Drew Fellman' ],
  imdb: { id: 7860270, rating: 7.6, votes: 39 },
  votes: 
   [ { _id: 5ad6790e787161295d076638, title: 'Pandas', vote: 'bad' },
     { _id: 5ad6790e787161295d076639, title: 'Pandas', vote: 'good' },
     { _id: 5ad6790e787161295d07663a, title: 'Pandas', vote: 'bad' } ] }
Closing connection with server...
```