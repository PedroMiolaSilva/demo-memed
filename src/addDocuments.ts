import { useExecute } from "azion/sql";
import { azionEmbeddings } from "./models";

/**
 * Adds documents to a specific database using EdgeAI embedding models. 
 * Ensure that the column "embedding" has the same dimension as the selected model
 * @param body 
 */
export async function addDocuments(body: any){
    try{

    const data = body.data
    let name = body.dbName

    if (!name){
        name = 'memeddatabase'
    }

    if (!data){
        console.error("No data provided")
        throw new Error("No data provided.")
    }

    for (const row in data){
        const statement = await createInsertStatement(row)
        const {data, error} = await useExecute(name,[statement])
        
        if (error) {
            console.error(JSON.stringify(error))
            throw error
        }
    }

    } catch (error){
      console.error("Error adding documents: ", error)
      throw error
    }
}

/**
 * Creates an insert statement for a given row, embedding its content using azionEmbeddings.
 * @param row - The object representing a document to insert.
 * @returns Promise<string> - The SQL insert statement for the row.
 */
export async function createInsertStatement(row: any) {
    try {
        // Prepare metadata as JSON string
        const metadata = JSON.stringify(row);

        // Concatenate all field values as content
        const content = Object.values(row).join(" ");

        // Get embedding from azionEmbeddings
        const embedding = await azionEmbeddings(content);

        // Prepare embedding as a string for SQL (e.g., [0.1,0.2,...])
        const embeddingStr = Array.isArray(embedding)
            ? `[${embedding.join(",")}]`
            : "[]";

        // Build the SQL insert statement
        const sql = `
            INSERT INTO vectors (content, embedding, metadata)
            VALUES ('${content.replace(/'/g, "''")}', vector('${embeddingStr}'), '${metadata.replace(/'/g, "''")}')
        `;

        return sql;
    } catch (error) {
      console.error("Error creating insert statement: ", error);
      throw error
    }
}