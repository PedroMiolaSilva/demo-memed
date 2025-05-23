import { useExecute, getDatabase, createDatabase } from "azion/sql"
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Creates the database and applies the necessay queries on it
 * @param name 
 * @returns 
 */
export async function configureDatabase(name:string){

    const { data: getDbData} = await getDatabase(name)

    if (getDbData){
        console.log("Database already configured!")
        return
    }

    const statements = setupDbStatements()

    const { error: creationError } = await createDatabase(name)

    if (creationError){
        console.error("Error while creating the database: ", creationError)
        throw creationError
    }

    //Waiting for the database to be created
    await new Promise(resolve => setTimeout(resolve, 30000));

    const {error: executeError} = await useExecute(name, statements)

    if (executeError){
        console.error("Error while executing queries on the database: ", executeError)
        throw executeError
    }

    await executeInsertQueries(name)
    return
}

/**
 * This function generates the necessary queries to setup the database.
 * It creates 2 tables, one with vectors and indexes for it, one for full text search and triggers.
 * @returns 
 */
function setupDbStatements(){

    return [
        `CREATE TABLE IF NOT EXISTS vectors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            embedding F32_BLOB(4096),
            metadata JSON
        )`,
        `CREATE INDEX IF NOT EXISTS vectors_idx ON vectors (
            libsql_vector_idx(embedding, 'metric=cosine', 'compress_neighbors=float8', 'max_neighbors=20')
        )`,
        `CREATE VIRTUAL TABLE IF NOT EXISTS vectors_fts USING fts5(
            content,
            id UNINDEXED,
            metadata,
            tokenize = 'porter'
        )`,
        `CREATE TRIGGER IF NOT EXISTS insert_into_vectors_fts 
            AFTER INSERT ON vectors
            BEGIN
                INSERT INTO vectors_fts(id, content, metadata)
                VALUES(new.id, new.content, new.metadata);
            END`,
        `CREATE TRIGGER IF NOT EXISTS update_vectors_fts 
            AFTER UPDATE ON vectors
            BEGIN
                UPDATE vectors_fts 
                SET content = new.content,
                    metadata = new.metadata
                WHERE id = old.id;
            END`,
        `CREATE TRIGGER IF NOT EXISTS delete_vectors_fts
            AFTER DELETE ON vectors
            BEGIN
                DELETE FROM vectors_fts WHERE id = old.id;
            END`
    ];
}

/**
 * Executes the insert queries from the insert.sql file into the specified database
 * @param name The name of the database to insert the data into
 */
export async function executeInsertQueries(name: string) {
    try {
        // Read the insert.sql file
        const insertPath = join(__dirname, 'insert.sql');
        const insertQueries = readFileSync(insertPath, 'utf-8').split(';').filter(query => query.trim());
        console.log(insertQueries.length)
        // Execute each query
        for (const query of insertQueries) {
            const { error } = await useExecute(name, [query]);
            if (error) {
                console.error(`Error executing query: ${error}`);
                throw error;
            }
        }

      console.log(`Successfully executed ${insertQueries.length} insert queries`);
    } catch (error) {
      console.error('Error executing insert queries:', error);
      throw error;
    }
}

