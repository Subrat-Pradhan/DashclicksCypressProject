// Cypress test for the Subscriptions feature
describe("Pulse Feature", () => {
  beforeEach(() => {
    cy.intercept("GET", /pulses.*/).as("pulses");
    cy.login();

    cy.visit("/dashclicks/projects?tab=pulses");
    cy.wait("@pulses");
  });
  it("should render pulses table", () => {
    cy.get('[data-testid="pulses-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
  });

  it("view project", () => {
    cy.get('[data-testid="pulses-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="pulse-setting-icon"]').eq(3).click();
    cy.contains("View Project").first().click();
    cy.url().should("include", "dashclicks/projects/details");
  });
  it("upgrade/downgrade", () => {
    cy.get('[data-testid="pulses-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="pulse-setting-icon"]').eq(2).click();
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
    cy.get('[data-testid="pulses-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="pulse-setting-icon"]').eq(3).click();
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
  it("View Onboarding", () => {
    cy.get('[data-testid="pulses-table"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.get('[data-testid="pulse-setting-icon"]').eq(3).click();
    cy.contains("View Onboarding").first().click();
    cy.get('[data-testid="onboarding-approval-drawer"]', {
      timeout: 60000
    }).should("be.visible");
  });
});
