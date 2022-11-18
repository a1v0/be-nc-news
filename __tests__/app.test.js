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

describe("/api", () => {
    test("GET - 200: returns JSON data retrieved from endpoints.json", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body: { endpoints } }) => {
                // This isn't a perfect expect statement, but all I can know for sure is that, when the test runs, there will be at least 9 endpoints
                const endpointKeys = Object.keys(endpoints);
                expect(endpointKeys.length).toBeGreaterThan(8);
                endpointKeys.forEach((endpointKey) => {
                    expect(endpoints[endpointKey]).toHaveProperty(
                        "description"
                    );
                });
            });
    });
});

describe("/api/topics", () => {
    describe("GET requests", () => {
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
    describe("POST requests", () => {
        test("POST - 201: returns newly added topic", () => {
            return request(app)
                .post("/api/topics")
                .send({
                    slug: "topic name here",
                    description: "description here"
                })
                .expect(201)
                .then(({ body: { topic } }) => {
                    expect(topic).toMatchObject({
                        slug: "topic name here",
                        description: "description here"
                    });
                });
        });
        test("POST - 201: ignores superfluous properties", () => {
            return request(app)
                .post("/api/topics")
                .send({
                    slug: "topic name here",
                    description: "description here",
                    monsters: "Inc.",
                    donald: "Duck"
                })
                .expect(201)
                .then(({ body: { topic } }) => {
                    expect(topic).toMatchObject({
                        slug: "topic name here",
                        description: "description here"
                    });
                });
        });
        test("POST - 400: error when slug or description is missing", () => {
            return request(app)
                .post("/api/topics")
                .send({ slug: "hello" })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("POST request body is incomplete");
                })
                .then(() => {
                    return request(app)
                        .post("/api/topics")
                        .send({ slug: "hello" })
                        .expect(400);
                })
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("POST request body is incomplete");
                });
        });
    });
});

describe("/api/articles", () => {
    describe("GET requests", () => {
        test("GET - 200: return array of articles with following properties: author, title, article_id, topic, created_at, votes, comment_count", () => {
            return request(app)
                .get("/api/articles")
                .expect(200)
                .then(({ body: { articles } }) => {
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
        describe("GET requests with pagination", () => {
            test("GET - 200: response has total_count property listing correct total amount of articles available", () => {
                return request(app)
                    .get("/api/articles")
                    .expect(200)
                    .then(({ body: { total_count } }) => {
                        expect(total_count).toBe(12);
                    })
                    .then(() => {
                        return request(app)
                            .get("/api/articles?limit=3")
                            .expect(200);
                    })
                    .then(({ body: { total_count } }) => {
                        expect(total_count).toBe(12);
                    })
                    .then(() => {
                        return request(app)
                            .get("/api/articles?limit=3&topic=mitch")
                            .expect(200);
                    })
                    .then(({ body: { total_count } }) => {
                        expect(total_count).toBe(11);
                    });
            });
            test("GET - 200: returns correct amount of responses when limit is set (default is 10)", () => {
                return request(app)
                    .get("/api/articles")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles.length).toBe(10);
                    })
                    .then(() => {
                        return request(app)
                            .get("/api/articles?limit=3")
                            .expect(200);
                    })
                    .then(({ body: { articles } }) => {
                        expect(articles.length).toBe(3);
                    });
            });
            test("GET - 200: shows correct 'page' when p given a value", () => {
                return request(app)
                    .get(
                        "/api/articles?topic=mitch&limit=3&p=2&sort_by=article_id&order=asc"
                    )
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles.length).toBe(3);
                        expect(articles[0].title).toBe("Student SUES Mitch!");
                    });
            });
            test("GET - 200: shows only articles that exist when limit > amount of articles", () => {
                return request(app)
                    .get("/api/articles?p=2")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles.length).toBe(2);
                    });
            });
            test("GET - 400: error when limit is NaN", () => {
                return request(app)
                    .get("/api/articles?limit=hello")
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("invalid querystring");
                    });
            });
            test("GET - 400: error when p is NaN", () => {
                return request(app)
                    .get("/api/articles?p=hello")
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("invalid querystring");
                    });
            });
        });
        describe("GET requests with querystrings", () => {
            test("GET - 200: valid topic query returns results only from that topic", () => {
                return request(app)
                    .get("/api/articles?topic=mitch")
                    .expect(200)
                    .then(({ body: { articles } }) => {
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
                        expect(articles).toBeSortedBy("author", {
                            descending: false
                        });
                        articles.forEach((article) => {
                            expect(article.topic).toBe("mitch");
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
    describe("POST requests", () => {
        test("POST - 201: returns created object with author, title, body, topic, article_id, votes, created_at and comment_count properties", () => {
            return request(app)
                .post("/api/articles")
                .send({
                    author: "butter_bridge",
                    title: "Doctors HATE her",
                    body: "A lady from Wolverhampton has found a way to CHEAT DEATH. Find out how after watching an endless series of pointless advertisements.",
                    topic: "mitch"
                })
                .expect(201)
                .then(({ body: { article } }) => {
                    expect(article).toMatchObject({
                        author: "butter_bridge",
                        title: "Doctors HATE her",
                        body: "A lady from Wolverhampton has found a way to CHEAT DEATH. Find out how after watching an endless series of pointless advertisements.",
                        topic: "mitch",
                        article_id: expect.any(Number),
                        votes: 0,
                        created_at: expect.any(String),
                        comment_count: 0
                    });
                });
        });
        test("POST - 201: ignores superfluous properties", () => {
            return request(app)
                .post("/api/articles")
                .send({
                    author: "butter_bridge",
                    title: "Doctors HATE her",
                    body: "A lady from Wolverhampton has found a way to CHEAT DEATH. Find out how after watching an endless series of pointless advertisements.",
                    topic: "mitch",
                    alasPoorYorrick: "I knew him well"
                })
                .expect(201)
                .then(({ body: { article } }) => {
                    expect(article).not.toHaveProperty("alasPoorYorrick");
                });
        });
        test("POST - 400: error when body is missing one of the necessary properties", () => {
            return request(app)
                .post("/api/articles")
                .send({
                    alasPoorYorrick: "I knew him well"
                })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("POST request body is incomplete");
                });
        });
        test("POST - 400: error when username does not exist", () => {
            // When a username does not exist, it throws an invalid input error, because username is a primary key. As such, it has to be a 400, not 404
            return request(app)
                .post("/api/articles")
                .send({
                    author: "somethingStupid",
                    title: "Doctors HATE her",
                    body: "A lady from Wolverhampton has found a way to CHEAT DEATH. Find out how after watching an endless series of pointless advertisements.",
                    topic: "mitch",
                    alasPoorYorrick: "I knew him well"
                })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("invalid username");
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
                    article_id: 2,
                    comment_count: 0
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
        describe("GET requests with pagination", () => {
            test("GET - 200: response has total_count property listing correct total amount of comments available", () => {
                return request(app)
                    .get("/api/articles/1/comments")
                    .expect(200)
                    .then(({ body: { total_count } }) => {
                        expect(total_count).toBe(11);
                    })
                    .then(() => {
                        return request(app)
                            .get("/api/articles/1/comments?limit=10&p=2")
                            .expect(200);
                    })
                    .then(({ body: { total_count } }) => {
                        expect(total_count).toBe(11);
                    });
            });
            test("GET - 200: returns correct amount of responses when limit is set (default is 10)", () => {
                return request(app)
                    .get("/api/articles/1/comments")
                    .expect(200)
                    .then(({ body: { comments } }) => {
                        expect(comments.length).toBe(10);
                    })
                    .then(() => {
                        return request(app)
                            .get("/api/articles/1/comments?limit=3")
                            .expect(200);
                    })
                    .then(({ body: { comments } }) => {
                        expect(comments.length).toBe(3);
                    });
            });
            test("GET - 200: shows correct 'page' when p given a value", () => {
                return request(app)
                    .get("/api/articles/1/comments?p=2&limit=2")
                    .expect(200)
                    .then(({ body: { comments } }) => {
                        expect(comments.length).toBe(2);
                        expect(comments[1].body).toBe("Fruit pastilles");
                    });
            });
            test("GET - 200: shows only comments that exist when limit > amount of articles", () => {
                return request(app)
                    .get("/api/articles/1/comments?limit=10000")
                    .expect(200)
                    .then(({ body: { comments } }) => {
                        expect(comments.length).toBe(11);
                    });
            });
            test("GET - 400: error when limit is NaN", () => {
                return request(app)
                    .get("/api/articles/1/comments?limit=dfghjk")
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("invalid querystring");
                    });
            });
            test("GET - 400: error when p is NaN", () => {
                return request(app)
                    .get("/api/articles/1/comments?p=dfghjk")
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("invalid querystring");
                    });
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

describe("/api/users/:username", () => {
    test("GET - 200: return user with username, name and avatar_url properties", () => {
        return request(app)
            .get("/api/users/icellusedkars")
            .expect(200)
            .then(({ body: { user } }) => {
                expect(user).toMatchObject({
                    username: "icellusedkars",
                    name: "sam",
                    avatar_url:
                        "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4"
                });
            });
    });
    test("GET - 404: return error when username does not exist", () => {
        return request(app)
            .get("/api/users/rru3947r9348rfiuoe")
            .expect(404)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("username not found");
            });
    });
});

describe("/api/comments/:comment_id", () => {
    describe("PATCH requests", () => {
        test("PATCH - 200: returns updated comment when passed an object with a inc_votes property", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({ inc_votes: 1 })
                .expect(200)
                .then(({ body: { comment } }) => {
                    expect(comment).toMatchObject({
                        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                        votes: 17,
                        author: "butter_bridge",
                        article_id: 9,
                        created_at: expect.any(String)
                    });
                })
                .then(() => {
                    return request(app)
                        .patch("/api/comments/2")
                        .send({ inc_votes: -1 })
                        .expect(200);
                })
                .then(({ body: { comment } }) => {
                    expect(comment).toMatchObject({
                        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
                        votes: 13,
                        author: "butter_bridge",
                        article_id: 1,
                        created_at: expect.any(String)
                    });
                });
        });
        test("PATCH - 200: returns as normal, ignoring superfluous properties", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({
                    inc_votes: 1,
                    imDreamingOfA: "white Christmas",
                    hank: "Scorpio"
                })
                .expect(200)
                .then(({ body: { comment } }) => {
                    expect(comment).toMatchObject({
                        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                        votes: 17,
                        author: "butter_bridge",
                        article_id: 9,
                        created_at: expect.any(String)
                    });
                });
        });
        test("PATCH - 200: sets votes property to 0 if passed object makes it negative", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({ inc_votes: -1000 })
                .expect(200)
                .then(({ body: { comment } }) => {
                    expect(comment).toMatchObject({
                        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                        votes: 0,
                        author: "butter_bridge",
                        article_id: 9,
                        created_at: expect.any(String)
                    });
                });
        });
        test("PATCH - 200: rounds inc_votes down to nearest integer if given a float", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({ inc_votes: 1.9 })
                .expect(200)
                .then(({ body: { comment } }) => {
                    expect(comment).toMatchObject({
                        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                        votes: 17,
                        author: "butter_bridge",
                        article_id: 9,
                        created_at: expect.any(String)
                    });
                });
        });
        test("PATCH - 400: returns error when passed obj doesn't have an inc_votes property", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({ hello: "goodbye" })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("PATCH request body is incomplete");
                });
        });
        test("PATCH - 400: returns error when inc_votes === NaN", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({ inc_votes: "goodbye" })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("data type of increment is incorrect");
                });
        });
        test("PATCH - 400: returns error when comment_id is invalid", () => {
            return request(app)
                .patch("/api/comments/highwayToTheDangerZone")
                .send({ inc_votes: 234 })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("invalid comment id");
                });
        });
        test("PATCH - 404: returns error when comment_id not found", () => {
            return request(app)
                .patch("/api/comments/999999999")
                .send({ inc_votes: 234 })
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("comment not found");
                });
        });
    });
    describe("DELETE requests", () => {
        test("DELETE - 204: responds with no content when comment is successfully deleted", () => {
            return request(app).delete("/api/comments/1").expect(204);
        });
        test("DELETE - 400: responds with error when comment_id is invalid", () => {
            return request(app)
                .delete("/api/comments/im-a-little-teapot")
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("invalid comment id");
                });
        });
        test("DELETE - 404: responds with error when comment doesn't exist", () => {
            return request(app)
                .delete("/api/comments/9999999")
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("comment not found");
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
