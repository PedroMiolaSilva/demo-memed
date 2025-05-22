/**
 * 
 * The embedding model running on EdgeAI
 * @param query 
 * @returns 
 */
export async function azionEmbeddings(query: string) {
  try {
    const response = await Azion.AI.run('intfloat-e5-mistral-7b-instruct', 
      {
        "input": query,
        "encoding_format": 'float'
      }
    )

    const embedding = response.data[0].embedding

    return embedding
  } catch (error) {
    console.error(`Error azionEmbeddings: ${error.name}: ${error.message}`);
    return []
  }
}