# EdgeAI + EdgeSQL retrieval

This template allows you to retrieve documents using hybrid search, that combines both similarity and full-text search.

It creates an Edge Application, powered by EdgeAI and an EdgeSQL database to store your data.

To use this template:

1 - Clone this repository:

```bash
git clone https://github.com/PedroMiolaSilva/demo-memed.git
```

2 - Install Azion CLI

```bash
brew install azion
```

Other instalation options in the [documentation](https://www.azion.com/en/documentation/products/azion-cli/overview/)

3 - On the project's folder, run the following:
```bash
yarn install
azion init
azion deploy --local
```

4 - After a couple minutes, your template will be deployed on Azion's Edge. Then, you can test two available routes:
- /query: to retrieve documents based on a query
- /add_documents: to add new documents to your database

## API Endpoints

### Query Documents
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

### Add Documents
Add new documents to the vector database.

```bash
curl -X POST 'https://your-edge-url/add_documents' \
-H 'Content-Type: application/json' \
-d '{
  "dbName": "optional_database_name", (defaults to memeddatabase)
  "data": [
    {
      "coluna1": "Document Name",
      "coluna2": "Document Description",
      "coluna3": "Dosage Information"
      ....
    }
  ]
}'
```

Note: The `dbName` parameter is optional in both endpoints. If not provided, it defaults to 'memeddatabase'.