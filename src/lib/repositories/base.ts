// Base repository interface pattern
// This provides a common interface that all repositories should follow

export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>
  findAll(filters?: Record<string, unknown>): Promise<T[]>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
}
