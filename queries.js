const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const db = client.db("plp_bookstore");
const books = db.collection('books');

async function main() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB server');
//Task 2: Basic CRUD Operations
//Find all books in a specific genre
await books.find({genre:"Fiction"}).toArray();
console.log("Fiction books have been found.");

//Find all books published after a certain year
await books.find({published_year:{$gt:1950}}).toArray();
console.log("Books published after 1950 have been found.");

//Find books by a specific author
await books.find({author:"J.R.R. Tolkien"}).toArray();
console.log("Books by J.R.R. Tolkien have been found.");

//Update the price of a specific book
await books.updateOne({title:"The Hobbit"},{$set:{price:15.99}});
console.log("The price of 'The Hobbit' has been updated.");

//Delete a book by its title
await books.deleteOne({title:"The Hobbit"});
console.log("The Hobbit has been deleted from the collection.");


//Task 3: Advanced Queries
// Write a query to find books that are both in stock and published after 2010
const inStockBooks = await books.find({in_stock:"true", published_year: {$gt:2010}}).toArray();
console.log("Books that are in stock and published after 2010 have been found.");

// Use projection to return only the title, author, and price fields in your queries
const projectedBooks = await books.find({}, {title:1, author:1, price:1, _id:0}).toArray();
console.log("Projection query executed to return only title, author, and price fields.");

//Implement sorting to display books by price (both ascending and descending)
const sortedBooksAsc = await books.find().sort({price:1}).toArray();
console.log("Books sorted by price in ascending order.");

const sortedBooksDesc = await books.find().sort({price:-1}).toArray();
console.log("Books sorted by price in descending order.");

//Use the `limit` and `skip` methods to implement pagination (5 books per page)
const firstPageBooks = await books.find().skip(0).limit(5).toArray();
console.log("First page of books (5 per page) retrieved.");

const secondPageBooks = await books.find().skip(5).limit(5).toArray();
console.log("Second page of books (5 per page) retrieved.");


//Task 4: Aggregation Pipeline
//Create an aggregation pipeline to calculate the average price of books by genre
await books.aggregate([
  {
    $group: {
      _id: "$genre",
      averagePrice: { $avg: "$price" }
    }
  }
]).toArray();

console.log("Average price of books by genre has been calculated.");

//Create an aggregation pipeline to find the author with the most books in the collection
await books.aggregate([
  {
    $group: {
      _id: "$author",
      bookCount: { $sum: 1 }
    }
  },
  { $sort: { bookCount: -1 } },
  { $limit: 1 }
]).toArray();
console.log("Author with the most books has been found.");

//Implement a pipeline that groups books by publication decade and counts them
await books.aggregate([
      {
        $project: {
          decade: {
            $concat: [
              { $toString: { $subtract: ["$published_year", { $mod: ["$published_year", 10] }] } },
              "s"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$decade",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log("Books have been grouped by publication decade and counted.");

//Task 5 :Indexing
// Create an index on the `title` field for faster searches
    await books.createIndex({ title: 1 });
    console.log("Index created on the 'title' field.");

// Create a compound index on `author` and `published_year`
    await books.createIndex({ author: 1, published_year: -1 });
    console.log("Compound index created on 'author' and 'published_year' fields.");

//Use the `explain()` method to demonstrate the performance improvement with your indexes
    const explainResult = await books.find({ title: "The Hobbit" }).explain("executionStats");
    console.log("Explain output for query on 'title' field:", explainResult);



  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}
main().catch(console.error);