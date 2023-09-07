# Feedback Form Project

A feedback form application built using React 18 for the frontend, Node.js with Express for the backend, and the Notion API for the database.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Starting the Application](#starting-the-application)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- A Notion account and an integration set up to access the Notion API.
- Basic knowledge of React, Node.js, and Express.

## Getting Started

### Installation

Clone this repository to your local machine:

```bash
git clone https://github.com/ircamitoc/feedback-form-demo.git
cd feedback-form-demo
```

Install the frontend dependencies

```bash
cd client-server
npm install axios react-toastify recaptcha
```

Install the backend dependencies

```bash
cd express_server
npm install express @notionhq/client cors body-parser
npm install express-rate-limit
npm install helmet
node server.js
```

### Configuration

1. Create a `.env` file in the `express_server` directory and set the following environment variables:

```
NOTION_API_KEY=YOUR_NOTION_API_KEY
NOTION_DATABASE_ID=YOUR_NOTION_DATABASE_ID
```

Replace `YOUR_NOTION_API_KEY` and `YOUR_NOTION_DATABASE_ID` with your actual Notion API key and database ID.

2. Configure the `client-server` by editing client-server/src/config.js:

```
const config = {
  RECAPTCHA_SITE_KEY: 'YOUR_RECAPTCHA_SITE_KEY',
};
```

Replace YOUR_RECAPTCHA_SITE_KEY with your actual reCAPTCHA site key.

### Starting the Application
