# EdgeAI + EdgeSQL retrieval

This template allows you to retrieve documents using hybrid search, that combines both similarity and full-text search.

It creates an Edge Application and an Edge Function powered by EdgeAI and EdgeSQL database to store and retrieve your data.

# To use this template:

## Clone this repository:

```bash
git clone https://github.com/PedroMiolaSilva/demo-memed
```

## Install Azion CLI (Mac)

```bash
brew install azion
```
For other platforms (Windows/Linux) you can [view the instructions](https://www.azion.com/en/documentation/products/azion-cli/overview/) on how to install the Azion CLI.


Next, add a [personal token](https://console.azion.com/personal-tokens) to authenticate.
```bash
azion -t PERSONAL_TOKEN
```

Also, include your token into .env.

## Setup and deploy solution

Make sure you have Node 20 or higher and [yarn](https://yarnpkg.com/) installed.

Run the following on the project root folder.

```bash
azion link #here select typescript as preset
azion deploy --local
```

After a couple minutes, your template will be deployed on Azion's Edge (a domain will be provided at the end of the deployment). 

Then, you can test two available routes:
- /query: to retrieve documents based on a query
- /add_documents: to add new documents to your database

# API Endpoints

## Query Documents
Search for documents using vector similarity and full-text search.

```bash
curl -X POST 'https://your-edge-url/query' \
-H 'Content-Type: application/json' \
-d '{
  "query": "your search query",
  "filter": "optional_specialty_filter",
  "dbName": "optional_database_name" (defaults to memeddatabase)
}'
```

The files used on the demonstration are AI generated. They are in migrations/files/medication.json.

Note: The `dbName` parameter is optional in both endpoints. If not provided, it defaults to 'memeddatabase'.