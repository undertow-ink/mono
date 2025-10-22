import { add } from './index.js';

console.assert(add(2, 3) === 5, 'add(2,3) should be 5');
if (add(2, 3) !== 5) process.exit(1);

console.log('All tests passed.');
