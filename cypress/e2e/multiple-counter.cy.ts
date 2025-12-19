describe("Multiple Counters", () => {
  beforeEach(() => {
    cy.visit("/");

    // Wait for page to load
    cy.contains("Counter Component").should("be.visible");
  });

  it("displays counter elements", () => {
    // First check how many counter elements we have
    cy.get('[data-testid="counter-value"]').then(($elements) => {
      cy.log(`Found ${$elements.length} counter elements`);

      if ($elements.length === 0) {
        throw new Error("No counter elements found");
      }

      // If we have at least one element, test the first one
      cy.wrap($elements[0]).should("be.visible");

      // Only test the second one if it exists
      if ($elements.length > 1) {
        cy.wrap($elements[1]).should("be.visible");
      }
    });
  });

  it("increments the first counter when its button is clicked", () => {
    // First check the counter value
    cy.get('[data-testid="counter-value"]')
      .first()
      .invoke("text")
      .then((text) => {
        cy.log(`Initial counter value: ${text}`);

        // Click the increment button
        cy.get('[data-testid="increment-button"]').first().click();

        // Check that the value changed
        cy.get('[data-testid="counter-value"]')
          .first()
          .should("not.have.text", text);
      });
  });
});
