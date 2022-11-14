const request = require("supertest");
const app = require(`${__dirname}/../app.js`);

const db = require(`${__dirname}/../db/connection.js`);
const seed = require(`${__dirname}/../db/seeds/seed.js`);

const {
    articleData,
    commentData,
    topicData,
    userData
} = require(`${__dirname}/../db/data/test-data/index.js`);

beforeEach(() => {
    return seed({ topicData, userData, articleData, commentData });
});
afterAll(() => {
    return db.end();
});

describe("/api/topics", () => {
    test.todo(
        "GET - 200: respond with array of topic objects, each having only 'slug' and 'description' properties"
    );

    describe("misc error handling", () => {
        test("ANY REQUEST - 404: respond with 404 error when path not found", () => {
            return request(app)
                .get("/api/not-a-valid-path")
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("not found");
                });
        });
    });
});
