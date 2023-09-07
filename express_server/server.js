const { NOTION_INTEGRATION_TOKEN } = require("./notionKey");
const { NOTION_DATABASE_ID } = require("./notionDB");
const rateLimit = require("express-rate-limit");
const express = require("express");
const { Client } = require("@notionhq/client");
const cors = require("cors");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const helmet = require("helmet"); // Import the helmet middleware

const app = express();

// Enable CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
  })
);

app.use(helmet()); // Enable helmet middleware to set security headers

const PORT = 4000;
const HOST = "localhost";

const notion = new Client({
  auth: NOTION_INTEGRATION_TOKEN,
});

// Create a rate limiter to limit the number of requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Allow up to 1 request per 1 minute from the same IP
});

app.use(limiter);

app.post("/submitFormToNotion", jsonParser, async (req, res) => {
  const name = req.body.name;
  const emailAddress = req.body.emailAddress;
  const extraInfo = req.body.extraInfo;
  const Timestamp = req.body.Timestamp;

  try {
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },

        "Email Address": {
          rich_text: [
            {
              text: {
                content: emailAddress,
              },
            },
          ],
        },

        "Extra Information": {
          rich_text: [
            {
              text: {
                content: extraInfo,
              },
            },
          ],
        },

        Timestamp: {
          rich_text: [
            {
              text: {
                content: Timestamp,
              },
            },
          ],
        },
      },
    });

    console.log(response);
    console.log("SUCCESS");

    // Send a success response to the client
    res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error:", error);
    // Send an error response to the client
    res.status(500).json({ message: "Form submission failed" });
  }
});

app.listen(PORT, HOST, () => {
  console.log("Server is running at " + HOST + ":" + PORT);
});
