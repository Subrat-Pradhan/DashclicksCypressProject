describe("Counter Component", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the counter component correctly", () => {
    // Check for the first counter with its initial value
    cy.get('[data-testid="counter-value"]')
      .first()
      .should("contain.text", "Current Count: 0");

    // Verify buttons are present
    cy.get('[data-testid="increment-button"]').first().should("be.visible");
    cy.get('[data-testid="decrement-button"]').first().should("be.visible");
  });

  it("increments the counter when clicking the increment button", () => {
    // Get the initial count of the first counter
    cy.get('[data-testid="counter-value"]')
      .first()
      .should("contain.text", "Current Count: 0");

    // Click the first increment button
    cy.get('[data-testid="increment-button"]').first().click();

    // Verify the count increased by 1
    cy.get('[data-testid="counter-value"]')
      .first()
      .should("contain.text", "Current Count: 1");
  });

  it("decrements the counter when clicking the decrement button", () => {
    // Get the initial count of the first counter
    cy.get('[data-testid="counter-value"]')
      .first()
      .should("contain.text", "Current Count: 0");

    // Click the first decrement button
    cy.get('[data-testid="decrement-button"]').first().click();

    // Verify the count decreased by 1
    cy.get('[data-testid="counter-value"]')
      .first()
      .should("contain.text", "Current Count: -1");
  });

  it("handles multiple clicks correctly", () => {
    // Perform a sequence of operations on the first counter
    cy.get('[data-testid="increment-button"]').first().click();
    cy.get('[data-testid="increment-button"]').first().click();
    cy.get('[data-testid="decrement-button"]').first().click();
    cy.get('[data-testid="increment-button"]').first().click();

    // Verify the final count reflects all operations (2)
    cy.get('[data-testid="counter-value"]')
      .first()
      .should("contain.text", "Current Count: 2");
  });
});
