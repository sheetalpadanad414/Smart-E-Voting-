const { calculateElectionStatus } = require('./utils/electionStatus');

console.log('\n' + '='.repeat(60));
console.log('TESTING ELECTION STATUS CALCULATION');
console.log('='.repeat(60) + '\n');

const now = new Date();
console.log('Current Date:', now.toISOString());
console.log('Current Date (Local):', now.toLocaleString());
console.log('');

// Test cases
const testCases = [
  {
    name: 'Election in the past',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    expected: 'completed'
  },
  {
    name: 'Election in the future',
    startDate: '2027-01-01',
    endDate: '2027-01-31',
    expected: 'upcoming'
  },
  {
    name: 'Election active today (started yesterday, ends tomorrow)',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expected: 'active'
  },
  {
    name: 'Election starts today',
    startDate: now.toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expected: 'active'
  },
  {
    name: 'Election ends today',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
    expected: 'active'
  }
];

console.log('Test Cases:\n');

testCases.forEach((testCase, index) => {
  const result = calculateElectionStatus(testCase.startDate, testCase.endDate);
  const passed = result === testCase.expected;
  
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Start: ${testCase.startDate}`);
  console.log(`   End: ${testCase.endDate}`);
  console.log(`   Expected: ${testCase.expected}`);
  console.log(`   Got: ${result}`);
  console.log(`   ${passed ? '✓ PASS' : '✗ FAIL'}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60) + '\n');
