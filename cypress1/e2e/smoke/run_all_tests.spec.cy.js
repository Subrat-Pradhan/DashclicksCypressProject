// cypress/e2e/smoke/run_all_tests.spec.cy.js

describe('Run All Smoke Test Cases', () => {
  // Dynamically import and run all test files in the smoke folder
  const testFiles = [
    'loginflow.cy.js',
    'openFulfillmentCenter.cy.js',
    // Add other test files in the smoke folder here
  ];

  testFiles.forEach((testFile) => {
    it(`Runs test file: ${testFile}`, () => {
      // Dynamically import and run each test file
      cy.log(`Running test file: ${testFile}`);
      cy.visit('http://localhost:3000'); // Optional: Reset to base URL before each test if needed
      
      // Import and run the specific test file
      cy.fixture(`smoke/${testFile}`).then((testModule) => {
        // You can add any pre-test setup or logging here
        cy.log(`Starting test file: ${testFile}`);
      });
    });
  });
});