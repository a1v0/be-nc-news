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
});

describe("/api/articles", () => {
    test("GET - 200: return array of articles with following properties: author, title, article_id, topic, created_at, votes, comment_count", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles.length).toBe(12);
                articles.forEach((article) => {
                    expect(article).toEqual({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: expect.any(String),
                        created_at: expect.any(Number),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number)
                    });
                });
            });
    });
    test("GET - 200: results should be sorted in descending date order", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles).toBeSortedBy("created_at", {
                    descending: true
                });
            });
    });
    test("GET - 200: results contain correct comment_count value", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles[0].comment_count).toBe(2);
                expect(articles[1].comment_count).toBe(1);
                expect(articles[2].comment_count).toBe(0);
            });
    });
});

describe("/api/articles/:article_id", () => {
    test("GET - 200: returns a single article object with the following properties: author, title, article_id, body, topic, created_at, votes", () => {
        return request(app)
            .get("/api/articles/2")
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toEqual({
                    title: "Sony Vaio; or, The Laptop",
                    topic: "mitch",
                    author: "icellusedkars",
                    body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
                    created_at: "2020-10-16T05:03:00.000Z",
                    votes: 0,
                    article_id: 2
                });
            });
    });
    test("GET - 404: returns error when no article is found", () => {
        return request(app)
            .get("/api/articles/9999999")
            .expect(404)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("article not found");
            });
    });
    test("GET - 400: returns error when article id is invalid", () => {
        return request(app)
            .get("/api/articles/obi-wan-kenobi")
            .expect(400)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("invalid article id");
            });
    });
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

describe("/api/articles/:article_id/comments", () => {
    test("GET - 200: responds with array of comments for any given article_id, with these properties: comment_id, votes, created_at, author, body", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments.length).toBe(11);
                comments.forEach((comment) => {
                    expect(comment).toEqual({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(Number),
                        author: expect.any(String),
                        body: expect.any(String),
                        article_id: 1
                    });
                });
            });
    });
    test("GET - 200: response array ordered by created_at, with most recent comment first", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments).toBeSortedBy("created_at", {
                    descending: true
                });
            });
    });
    test("GET - 200: returns empty array when no comments found on valid article_id", () => {
        return request(app)
            .get("/api/articles/4/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments).toEqual([]);
            });
    });
    test("GET - 400: returns error when invalid article_id given", () => {
        return request(app)
            .get("/api/articles/hello_from_the_other_side/comments")
            .expect(400)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("invalid article id");
            });
    });
    test.skip("GET - 404: returns error when no article found with given id", () => {
        return request(app)
            .get(".api/articles/9999999999/comments")
            .expect(404)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("article not found");
            });
    });
});
