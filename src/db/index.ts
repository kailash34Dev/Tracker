import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

// Open the database
// The database file will be created in the app's document directory if it doesn't exist
const expoDb = SQLite.openDatabaseSync('tracker.db', { enableChangeListener: true });

// Create the Drizzle ORM instance
export const db = drizzle(expoDb, { schema });
