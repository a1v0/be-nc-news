# Northcoders News API

## Connecting to two local databases

To create an automatic link between our project and the relevant database (`nc_news` or `nc_news_test`), we need to create two environment variable files in our root directory: `.env.development` and `.env.test`. The connection file (`./db/connection.js`) will retrieve the contents from these environment files to set the database being used when the repo is run.

Look at the `.env-example` file for guidance on what the file contents should look like.
