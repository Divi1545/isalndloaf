/**
 * IslandLoaf Storage Provider
 * This module handles switching between in-memory storage and PostgreSQL
 */

import { IStorage } from './storage';
import { MemStorage } from './storage';
import { DatabaseStorage, dbStorage } from './database-storage';

// Environment variable to control storage type: "memory" or "postgres"
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'memory';

// Determine which storage implementation to use
let storageImpl: IStorage;

if (STORAGE_TYPE === 'postgres') {
  console.log('🔄 Using PostgreSQL database storage');
  storageImpl = dbStorage;
} else {
  console.log('🔄 Using in-memory storage');
  storageImpl = new MemStorage();
}

export const storage = storageImpl;

/**
 * Switch to PostgreSQL storage implementation
 * This can be called to dynamically switch the storage at runtime
 */
export function switchToPostgresStorage() {
  storageImpl = dbStorage;
  console.log('✅ Switched to PostgreSQL storage');
  return storageImpl;
}

/**
 * Switch to in-memory storage implementation
 * This can be called to dynamically switch back to in-memory storage
 */
export function switchToMemoryStorage() {
  storageImpl = new MemStorage();
  console.log('✅ Switched to in-memory storage');
  return storageImpl;
}