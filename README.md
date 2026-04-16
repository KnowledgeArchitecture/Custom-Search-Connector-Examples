# Synthesis Search Connector Examples

The Synthesis Search Connector API is a powerful tool that allows you to integrate Synthesis search capabilities into your third-party applications. This repository contains examples of how to use the Synthesis Search Connector in various programming languages and frameworks.

## Getting Started

Set up a search connector in Synthesis to generate your Connector ID and API Key.

## Testing in the Synthesis Search Connector API Playground

The [Synthesis Search Connector API Playground](https://api.knowledge-architecture.com/) is a web-based tool that allows you to test your search connector implementation without needing to set up a local development environment. You can use the API Playground to send test search queries and see how the API responds.
- Put your Connector ID and API Key in the API Playground to authenticate your requests.
- Test out the endpoint to get all source items. It should return an empty array
- Create a test source item
- Retry the endpoint to get all source items. It should return an array with the item you just created.
- Get the item by its ID to see the details of the item you created.
- Delete the item by its ID to clean up your test data.
- Take note of the response headers which include information about the rate limit, requests remaining, and when the rate limit will reset.

## Prerequisites for development

- Node.js 24.14 or higher (we like using nvm to manage Node.js versions)
- A text editor or IDE of your choice (we recommend Visual Studio Code)
- Your Connector ID and API Key from Synthesis
- (Optional) Git for version control

## Setting up the Node.js Simple RSS Scraper Example

1. Get a copy of the code, either by doing a git clone the repository or by downloading the ZIP file.
2. Open the code in your text editor or IDE.
3. Install the required dependencies by running `npm install` in the terminal.
4. Copy .env-template to .env and set your config variables in the .env file.

## Running the Example

Start the script by running `npm run start` in the terminal.

You should see output indicating it is fetching the RSS feed and submitting source items to the Synthesis Search Connector API. Check the API Playground to see the items that were created.

You can also navigate to `data/content.json` in the repo to see the content that is being submitted to the API.

