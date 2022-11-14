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
    test("GET - 200: respond with array of topic objects, each having only 'slug' and 'description' properties", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body: { topics } }) => {
                expect(Array.isArray(topics)).toBe(true);
                expect(typeof topics[0]).toBe("object");
                expect(topics.length).toBeGreaterThan(0);
                topics.forEach((topic) => {
                    expect(topic).toEqual({
                        slug: expect.any(String),
                        description: expect.any(String)
                    });
                });
            });
    });
    test.todo("GET - 404: returns with error when no topics are found");
});

describe("/api/articles", () => {
    test.todo(
        "GET - 200: return array of articles with following properties: author which is the username, title, article_id, topic, created_at, votes, comment_count"
    );
    test.todo("GET - 200: results should be sorted in descending date order");
    test.todo("GET - 404: returns with error when no articles are found");
});

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
