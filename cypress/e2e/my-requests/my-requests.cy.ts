// Cypress test for the Subscriptions feature
describe("My Requests Feature", () => {
  beforeEach(() => {
    cy.intercept("GET", /my-request.*/).as("myRequests");
    cy.login();

    cy.visit("/fulfillment-center/projects?tab=myRequests");
    cy.wait("@myRequests");
  });
  it("should render my requests table", () => {
    cy.get('[data-testid="my-requests-table"]', {
      timeout: 60000
    }).should("be.visible");
  });
  it("Viewing Request ", () => {
    cy.get('[data-testid="my-requests-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="view-request-button"]', { timeout: 60000 })
      .first()
      .click();
    cy.get('[data-testid="right-side-drawer"]', { timeout: 60000 }).should(
      "be.visible"
    );
  });

  it("view project", () => {
    cy.get('[data-testid="my-requests-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="setting-icon"]').eq(3).click();
    cy.contains("View Project").first().click();
    cy.url().should("include", "fulfillment-center/projects/details");
  });
  it("upgrade/downgrade", () => {
    cy.get('[data-testid="my-requests-table"]', { timeout: 60000 }).should(
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
    cy.get('[data-testid="my-requests-table"]', { timeout: 60000 }).should(
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
  it("Cancel Request", () => {
    cy.get('[data-testid="my-requests-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="setting-icon"]').eq(3).click();
    cy.intercept("DELETE", /tasks.*/).as("cancelRequest");
    cy.contains("Cancel Request").first().click();

    cy.contains("Proceed").first().click();

    cy.wait("@cancelRequest").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body).to.have.property("success", true);
    });
  });
});
