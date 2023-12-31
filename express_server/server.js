import { NOTION_INTEGRATION_TOKEN } from "./notionKey";
import { NOTION_DATABASE_ID } from "./notionDB";
import rateLimit from "express-rate-limit";
import express from "express";
import { Client } from "@notionhq/client";
import cors from "cors";
import { json } from "body-parser";
const jsonParser = json();
import helmet from "helmet"; // Import the helmet middleware

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
  windowMs: 55 * 1000, // 1 minute
  max: 1, // Allow up to 1 request per 1 minute from the same IP
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
          email: emailAddress, // emailAddress should be a valid email address string
        },

        Feedback: {
          rich_text: [
            {
              text: {
                content: extraInfo,
              },
            },
          ],
        },

        Timestamp: {
          date: {
            start: Timestamp, // Timestamp should be a valid date string in ISO 8601 format, e.g., "2023-09-08"
          },
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
