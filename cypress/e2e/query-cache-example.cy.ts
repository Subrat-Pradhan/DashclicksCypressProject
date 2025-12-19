// Example test for demonstrating React Query cache access
describe("React Query Cache Example", () => {
  beforeEach(() => {
    // Login to the application first
    cy.login();

    // Wait for the application to load and queries to populate
    cy.url().should("include", "/dashboard");

    // Add a delay to ensure React Query has time to populate the cache
    cy.wait(1000);
  });

  it("should retrieve branding data from React Query cache", () => {
    // First check if queryClient is available and debug query keys
  
    // Now get the data from React Query cache
    cy.getQueryData(["login", "branding_data"]).then((queryData) => {
      // Log the data for inspection
      cy.log("Cache Data: ", queryData);


    });
  });
});
