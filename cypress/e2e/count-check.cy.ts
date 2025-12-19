// cypress/e2e/count-check.cy.ts
describe("Counter Check", () => {
  it("should check how many counters exist", () => {
    cy.visit("/");

    // Log how many counter elements exist
    cy.get('[data-testid="counter-value"]').then(($elements) => {
      cy.log(`Found ${$elements.length} counter elements`);

      // Log the text content of each element
      $elements.each((index, el) => {
        cy.log(`Counter ${index} text: ${el.textContent}`);
      });
    });
  });
});
