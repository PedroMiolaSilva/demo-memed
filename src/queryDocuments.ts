import { useQuery } from "azion/sql";
import { azionEmbeddings } from "./models";

export async function retrieve(body:any) {
  try {

    const query = body.query;
    const filter = body.filter;
    let name = body.dbName;

    if (!name){
      name = 'memeddatabase'
    }

    if(!query){
      throw new Error("No query provided!")
    }

    const embeddedContent = await azionEmbeddings(query)

    //Basic vector similarity query
    const querySim = `SELECT
                        json_extract(metadata, '$.nome') AS nome,
                        json_extract(metadata, '$.descricao') AS descricao,
                        json_extract(metadata, '$.dosagem') AS dosagem,
                        json_extract(metadata, '$.laboratorio') AS laboratorio,
                        json_extract(metadata, '$.especialidade') AS especialidade,
                        json_extract(metadata, '$.contraindicacoes') AS contraindicacoes,
                        json_extract(metadata, '$.efeitos_colaterais') AS efeitos_colaterais,
                        1 - vector_distance_cos(embedding, vector('[${embeddedContent}]')) AS similarity,
                        'similarity' AS source
                      FROM vectors
                      WHERE (1 - vector_distance_cos(embedding, vector('[${embeddedContent}]'))) > 0.2
                        ${filter ? `AND json_extract(metadata, '$.especialidade') = '${filter}'` : ''}
                      ORDER BY vector_distance_cos(embedding, vector('[${embeddedContent}]')) ASC
                      LIMIT 3;`

    const sanitizedQuery = query
      .replace(/['",.\/\\;:!?]/g, '')
      .trim()
      .replace(/\s+/g, ' OR ')

    //Basic Full text search query
    const queryFts = `SELECT 
                        json_extract(metadata, '$.nome') AS nome,
                        json_extract(metadata, '$.descricao') AS descricao,
                        json_extract(metadata, '$.dosagem') AS dosagem,
                        json_extract(metadata, '$.laboratorio') AS laboratorio,
                        json_extract(metadata, '$.especialidade') AS especialidade,
                        json_extract(metadata, '$.contraindicacoes') AS contraindicacoes,
                        json_extract(metadata, '$.efeitos_colaterais') AS efeitos_colaterais,
                        CASE
                          WHEN MAX(rank) OVER() = MIN(rank) OVER() THEN 1
                          ELSE (rank - MIN(rank) OVER()) * 1.0 / NULLIF(MAX(rank) OVER() - MIN(rank) OVER(), 0)
                        END as similarity,
                        'fts' as source
                      FROM vectors_fts
                      WHERE (vectors_fts MATCH '${sanitizedQuery}' OR vectors_fts MATCH '${sanitizedQuery}*')
                      ${filter ? `AND especialidade = '${filter}'` : ''}
                      ORDER BY rank DESC
                      LIMIT 3`

    const result = await useQuery(name, [querySim, queryFts])

    return mapDbResults(result)
  } catch (error) {
    console.log("Error retrieve:", error)
    return []
  }
}

/**
 * Helper to map the results and de duplicate them
 * @param result 
 * @returns 
 */
function mapDbResults(result: any) {
  if (!result?.data?.results) return [];

  // Deduplicate by composite key (nome+dosagem+laboratorio), keep the highest similarity
  const bestDocs = new Map<string, any>();

  for (const statementResult of result.data.results) {
    const { columns, rows } = statementResult;
    if (!columns || !rows) continue;
    for (const row of rows) {
      const obj: any = {};
      columns.forEach((col: string, idx: number) => {
        obj[col] = row[idx];
      });

      // Composite key for deduplication
      const key = JSON.stringify([
        obj.nome, obj.dosagem, obj.laboratorio
      ]);
      if (
        !bestDocs.has(key) ||
        (typeof obj.similarity === 'number' && obj.similarity > bestDocs.get(key).similarity)
      ) {
        bestDocs.set(key, obj);
      }
    }
  }

  // Sort by similarity descending
  const deliveredDocuments = Array.from(bestDocs.values()).sort(
    (a, b) => (b.similarity ?? 0) - (a.similarity ?? 0)
  );
  return deliveredDocuments;
}