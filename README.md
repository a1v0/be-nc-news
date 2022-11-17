# Northcoders News API

## Summary

||||
|-|-|-|
| **Hosted URL** |:| https://long-yak-baseball-cap.cyclic.app/api |
| **Minimum Node version** |:| 19.0.0 |
| **Minimum PostgreSQL version** |:| 12.12 |

This API allows users to retrieve, add, modify and delete data from the Northcoders News database. This database includes tables of users, topics, articles and comments.

## Setting up the repo

### Cloning the repo

To clone the repo, first [open it on GitHub](github.com/a1v0/be-nc-news/). Press the green button on screen that says "<> Code" and copy the link.

In your terminal, navigate to the directory into which you would like to clone the repo, and run `git clone <REPO-URL>`.

### Installing dependencies

Run `npm install` in the terminal to install all dependencies.

### Preparing environment variables

The file at `./db/connection.js` sets the environment variables for the repo based on a pair of `.env` files that you will need to prepare:

1. Create two files in the root directory: `.env.test` and `.env.development`
1. Set the content of `.env.development` to `PGDATABASE=nc_news`
1. Set the content of `.env.test` to `PGDATABASE=nc_news_test`
1. Add `.env.*` to your `.gitignore` file to ensure any other environment variables you may wish to add do not get pushed to GitHub.

## Initialising the database

Before you can seed, you need to create the database. To do this, simply run `npm run setup-dbs` in your console.

### Seeding in a dev environment

Simply run `npm run seed` and the database will be seeded.

### Seeding in a test environment

Jest will seed the database for you automatically whenever you run your test suite, so long as you include this code at the top of your test file:

```js
const db = require(`${__dirname}/../db/connection.js`); // the Pool object
const seed = require(`${__dirname}/../db/seeds/seed.js`); // invoking this seeds the database

const {
    articleData,
    commentData,
    topicData,
    userData
} = require(`${__dirname}/../db/data/test-data/index.js`); // all the data files

beforeEach(() => {
    return seed({ topicData, userData, articleData, commentData }); // re-seed the database before each test
});
afterAll(() => {
    return db.end(); // close the database connection after running the test suite
});
```

## Testing with Jest and Supertest

To use Jest for testing this Express API, you need to install `supertest` as a dev dependency, and require it into the test suite.

Read the [`supertest` docs](https://www.npmjs.com/package/supertest) for advice on how to create API tests.
