// Cypress test for the Subscriptions feature
describe("Subscriptions Feature", () => {
  beforeEach(() => {
    cy.intercept("GET", /subscriptions.*/).as("subscriptions");
    cy.login();

    cy.visit("/fulfillment-center/projects?tab=subscriptions");
    cy.wait("@subscriptions");
  });
  it("should render subscriptions table", () => {
    cy.get('[data-testid="subscriptions-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
  });
  it("adding price for a subscription", () => {
    cy.get('[data-testid="subscriptions-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.contains("Add Price").first().click();
    cy.intercept("PUT", /subscriptions.*/).as("updateSubscription");
    cy.get('[data-testid="subscrption-price"]').click().type("9");
    cy.get('[data-testid="save-price-subscription"]').click();
    cy.wait("@updateSubscription").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body).to.have.property("success", true);
    });
  });
  it("editing price for a subscription", () => {
    cy.get('[data-testid="subscriptions-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.contains("th", "My Price").then(($header) => {
      // Find its index among all th elements
      const index = $header.index();

      // Use that index to find cells in that column containing dollar amounts
      cy.get(`td:nth-child(${index + 1})`)
        .contains(/\$\d+\/mo/)
        .first()
        .click();
    });

    cy.intercept("PUT", /subscriptions.*/).as("updateSubscription");
    cy.get('[data-testid="subscrption-price"]').click().type("76");
    cy.get('[data-testid="save-price-subscription"]').click();
    cy.wait("@updateSubscription").then((interception) => {
      // Validate the response body
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body).to.have.property("success", true);
    });
  });
  it("view project", () => {
    cy.get('[data-testid="subscriptions-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="setting-icon"]').eq(3).click();
    cy.contains("View Project").first().click();
    cy.url().should("include", "fulfillment-center/projects/details");
  });
  it("upgrade/downgrade", () => {
    cy.get('[data-testid="subscriptions-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="setting-icon"]').eq(2).click();
    cy.contains("Upgrade/Downgrade").first().click();
    cy.contains("Change Plan").first().click();
    cy.get('[data-testid="billed-plan-0"]').first().click();
    cy.contains("Proceed To Checkout", { timeout: 10000 }).first().click();
    cy.get('[data-testid="card-select"]').click();
    cy.contains(/4242/).click();
    cy.intercept("POST", /single-item-checkout.*/).as(
      "upgrade/downgradeSubscription"
    );
    cy.contains("Place Your Order", { timeout: 10000 }).first().click();
    cy.wait("@upgrade/downgradeSubscription").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body).to.have.property("success", true);
    });
  });
  it("Cancel Subscription", () => {
    cy.get('[data-testid="subscriptions-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="setting-icon"]').eq(3).click();
    cy.contains("Cancel Subscription").first().click();
    cy.get('[data-testid="cancel-reason-select"]').first().click();
    cy.contains("Client cancelled").first().click();
    cy.get('[data-testid="cancel-reason-field"]')
      .first()
      .click()
      .type("just cancelling for some obvious reason");
    cy.contains("Continue").first().click();
    cy.get('[data-testid="confirm-checkbox"]').first().click();
    cy.contains("Continue").first().click();
    cy.contains("Close").first().click();
  });
});
