const app = require("./app.js");
const { PORT = 6666 } = process.env;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
