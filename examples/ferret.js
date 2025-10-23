import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.FERRET_URL;
const dbName = "app";
const collectionName = "documents";

/**
 * Performs a database operation and guarantees connection cleanup.
 * @param {function(db: import('mongodb').Db): Promise<any>} operation - The function containing the DB logic.
 * @returns {Promise<any>} The result of the operation.
 */
async function runDbOperation(operation) {
    const client = new MongoClient(uri);

    try {
        console.log('1. Attempting to connect to the database...');
        await client.connect();
        const db = client.db(dbName);
        console.log(`2. Successfully connected to database: ${dbName}`);

        // --- Execute the user-defined operation ---
        const result = await operation(db);

        console.log('3. Operation complete.');
        return result;

    } catch (error) {
        console.error('Database operation failed:', error.message);
        throw error;

    } finally {
        if (client) {
            await client.close();
            console.log('4. Connection closed successfully (Cleanup complete).');
        }
    }
}


async function main() {
    console.log('--- Starting DocumentDB Script Execution ---');

    // Define the specific database actions inside the operation function
    const myOperation = async (db) => {
        const collection = db.collection(collectionName);

        // 1. Insert a document
        const insertResult = await collection.insertOne({
            timestamp: new Date(),
            data: 'This is a test document.',
            status: 'active'
        });
        console.log(`\nOperation: Inserted document with ID: ${insertResult.insertedId}`);

        // 2. Find and retrieve documents
        const docs = await collection.find({ status: 'active' }).toArray();
        console.log(`\nOperation: Found ${docs.length} active documents.`);

        // 3. Clean up the specific data created by this run (optional self-cleaning logic)
        const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
        console.log(`\nOperation: Deleted ${deleteResult.deletedCount} temporary document.`);

        return { success: true, count: docs.length };
    };

    try {
        const result = await runDbOperation(myOperation);
        console.log('\nFinal Result:', result);

    } catch (e) {
        console.error('Script finished with error.');

    } finally {
        console.log('--- Script Execution Finished ---');
    }
}

main();
