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
    describe("GET requests with querystrings", () => {
        test("GET - 200: valid topic query returns results only from that topic", () => {
            return request(app)
                .get("/api/articles?topic=mitch")
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles.length).toBe(11);
                    articles.forEach((article) => {
                        expect(article.topic).toBe("mitch");
                    });
                });
        });
        test("GET - 200: valid topic query for empty topic returns empty array", () => {
            return request(app)
                .get("/api/articles?topic=paper")
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles.length).toBe(0);
                    articles.forEach((article) => {
                        expect(article.topic).toBe("paper");
                    });
                });
        });
        test("GET - 200: valid sort_by query sorts by given column (and defaults to date)", () => {
            return request(app)
                .get("/api/articles?sort_by=title")
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy("title", {
                        descending: true
                    });

                    return request(app)
                        .get("/api/articles?sort_by=created_at")
                        .expect(200);
                })
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy("created_at", {
                        descending: true
                    });
                    return request(app)
                        .get("/api/articles?sort_by=votes")
                        .expect(200);
                })
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy("votes", {
                        descending: true
                    });
                });
        });
        test("GET - 200: valid order query sets sorting order (defaults to descending)", () => {
            return request(app)
                .get("/api/articles?order=asc")
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy("created_at", {
                        descending: false
                    });
                });
        });
        test("GET - 200: valid combination of all three queries works as desired, and uppercase is ignored", () => {
            return request(app)
                .get("/api/articles?sort_by=AUTHOR&order=ASC&topic=MITCH")
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles.length).toBe(11);
                    expect(articles).toBeSortedBy("author", {
                        descending: false
                    });
                });
        });
        test("GET - 400: invalid order query returns error", () => {
            return request(app)
                .get("/api/articles?order=gobbledigook")
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("invalid querystring");
                });
        });
        test("GET - 400: invalid sort_by query returns error", () => {
            return request(app)
                .get("/api/articles?sort_by=gobbledigook")
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("invalid querystring");
                });
        });
        test("GET - 404: invalid topic query returns error", () => {
            return request(app)
                .get(
                    "/api/articles?topic=Beethoven'sSeventhSymphonyIsTheBestOne"
                )
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("topic not found");
                });
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

    describe("PATCH requests", () => {
        test("PATCH - 200: returns updated article when passed an object with a inc_votes property", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body: { article } }) => {
                    expect(article).toEqual({
                        article_id: 1,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: expect.any(String),
                        votes: 120
                    });
                });
        });
        test("PATCH - 200: returns as normal, ignoring superfluous properties", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({
                    inc_votes: 20,
                    topic: "hello",
                    actorWhoPlaysDrEvilAustinPowersAndFatBastardInTheRenownedAndExcellentAustinPowersTrilogy:
                        "Mike Myers"
                })
                .expect(200)
                .then(({ body: { article } }) => {
                    expect(article).toEqual({
                        article_id: 1,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: expect.any(String),
                        votes: 120
                    });
                });
        });
        test("PATCH - 200: sets votes property to 0 if passed object makes it negative", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ inc_votes: -200 })
                .expect(200)
                .then(({ body: { article } }) => {
                    expect(article.votes).toBe(0);
                });
        });
        test("PATCH - 200: rounds inc_votes down to nearest integer if given a float", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ inc_votes: 1.99997 })
                .expect(200)
                .then(({ body: { article } }) => {
                    expect(article.votes).toBe(101);
                });
        });
        test("PATCH - 400: returns error when passed obj doesn't have an inc_votes property", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ irrelevant_property: 3 })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("PATCH request body is incomplete");
                });
        });
        test("PATCH - 400: returns error when inc_votes === NaN", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ inc_votes: "you talkin'-a me?" })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("data type of increment is incorrect");
                });
        });
        test("PATCH - 400: returns error when article_id is invalid", () => {
            return request(app)
                .patch(
                    "/api/articles/these-are-not-the-droids-you-are-looking-for"
                )
                .send({ inc_votes: 25 })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("invalid article id");
                });
        });
        test("PATCH - 404: returns error when article_id not found", () => {
            return request(app)
                .patch("/api/articles/999999")
                .send({ inc_votes: 25 })
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("article not found");
                });
        });
    });
});

describe("/api/articles/:article_id/comments", () => {
    describe("GET requests", () => {
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
        test("GET - 404: returns error when no article found with given id", () => {
            return request(app)
                .get("/api/articles/99999/comments")
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("article not found");
                });
        });
    });
    describe("POST requests", () => {
        test("POST - 201: responds with posted comment (including comment_id and article_id) when comment comprises username and body only", () => {
            return request(app)
                .post("/api/articles/1/comments")
                .send({
                    username: "butter_bridge",
                    body: "i am c-3po, human-cyborg relations"
                })
                .expect(201)
                .then(({ body: { comment } }) => {
                    expect(comment).toEqual({
                        comment_id: expect.any(Number),
                        body: "i am c-3po, human-cyborg relations",
                        article_id: 1,
                        author: "butter_bridge",
                        votes: 0,
                        created_at: expect.any(String)
                    });
                });
        });
        test("POST - 201: responds with posted comment, ignoring any superfluous properties in the passed object", () => {
            return request(app)
                .post("/api/articles/6/comments")
                .send({
                    username: "icellusedkars",
                    body: "i am fluent in over six million forms of communication",
                    favouriteSmell: "napalm in the morning",
                    reasonsWhyIHateSand:
                        "It's coarse and rough and irritating and it gets everywhere."
                })
                .expect(201)
                .then(({ body: { comment } }) => {
                    expect(comment).toEqual({
                        comment_id: expect.any(Number),
                        body: "i am fluent in over six million forms of communication",
                        article_id: 6,
                        author: "icellusedkars",
                        votes: 0,
                        created_at: expect.any(String)
                    });
                });
        });
        test("POST - 400: error when passed object is missing one of the necessary keys", () => {
            return request(app)
                .post("/api/articles/6/comments")
                .send({
                    hatSize: 12,
                    favouriteWayToLoseFingers:
                        "inexpertly feeding aggressive mules"
                })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("POST request body is incomplete");
                });
        });
        test("POST - 400: error when given invalid article_id", () => {
            return request(app)
                .post("/api/articles/blame-it-on-the-boogie/comments")
                .send({
                    username: "icellusedkars",
                    body: "i am altering the deal. pray i do not alter it any further"
                })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("invalid article id");
                });
        });
        test("POST - 400: error when username does not exist", () => {
            return request(app)
                .post("/api/articles/6/comments")
                .send({
                    username: "hellotheregeneralkenobi",
                    body: "not to worry: we're still flying half a ship"
                })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("invalid username");
                });
        });
        test("POST - 404: error when article does not exist", () => {
            return request(app)
                .post("/api/articles/999999999/comments")
                .send({
                    username: "icellusedkars",
                    body: "i am altering the deal. pray i do not alter it any further"
                })
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("article not found");
                });
        });
    });
});

describe("/api/users", () => {
    test("GET - 200: return array of objects with user_id, username, name and avatar_url properties", () => {
        return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body: { users } }) => {
                expect(users.length).toBe(4);
                users.forEach((user) => {
                    expect(user).toEqual({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String)
                    });
                });
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
