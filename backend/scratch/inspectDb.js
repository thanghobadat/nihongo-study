const mockDb = require('../src/db/mockDb');
console.log('MockDb Keys:', Object.keys(mockDb));
console.log('Vocabulary length:', mockDb.vocabulary?.length);
if (mockDb.vocabulary && mockDb.vocabulary.length > 0) {
  console.log('Sample Vocabulary Item:', JSON.stringify(mockDb.vocabulary[0], null, 2));
  console.log('Sample Vocabulary Item 10:', JSON.stringify(mockDb.vocabulary[9], null, 2));
}
