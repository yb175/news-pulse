// This repository manages data operations for articles.
// In a real product implementation, replace these stubs with database queries (e.g. using Prisma Client).

export class ArticleRepository {
  async getAll(): Promise<any[]> {
    // TODO: Implement database query to fetch all articles ordered by publishedAt desc
    console.log("ArticleRepository.getAll() stub called");
    return [];
  }

  async getById(id: string): Promise<any | null> {
    // TODO: Implement database query to fetch article by unique id
    console.log(`ArticleRepository.getById() stub called for ID: ${id}`);
    return null;
  }
}
