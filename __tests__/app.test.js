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
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
    test.todo("");
});
