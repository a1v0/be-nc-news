const request = require("supertest");
const app = require("../app.js");

const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");

const {
    articleData,
    commentData,
    topicData,
    userData
} = require("../db/data/test-data/index.js");

beforeEach(() => {
    return seed({ topicData, userData, articleData, commentData });
});
afterAll(() => {
    db.end();
});

describe("/api/topics", () => {
    test.todo(
        "GET - 200: respond with array of topic objects, each having only 'slug' and 'description' properties"
    );
});

describe("misc error handling", () => {
    test.todo("ERROR - 404: respond with 404 error when path not found");
});
