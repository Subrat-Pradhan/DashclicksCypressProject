// Cypress test for the Subscriptions feature
describe("Subscriptions Feature", () => {
  beforeEach(() => {
    cy.intercept("GET", /subscriptions.*/).as("subscriptions");
    cy.login();

    cy.visit("/dashclicks/projects?tab=subscriptions");
    cy.wait("@subscriptions");
  });
  it("should render subscriptions table", () => {
    cy.get('[data-testid="dashclicks-subscriptions-table"]', {
      timeout: 60000
    }).should("be.visible");
  });

  it("view project", () => {
    cy.get('[data-testid="dashclicks-subscriptions-table"]', {
      timeout: 60000
    }).should("be.visible");
    cy.get('[data-testid="dashclicks-setting-icon"]').eq(3).click();
    cy.contains("View Project").first().click();
    cy.url().should("include", "dashclicks/projects/details");
  });

  it("Cancel Subscription", () => {
    cy.get('[data-testid="dashclicks-subscriptions-table"]', {
      timeout: 60000
    }).should("be.visible");
    cy.get('[data-testid="dashclicks-setting-icon"]').eq(3).click();
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
  it("Submit Upsell Opportunity", () => {
    cy.get('[data-testid="dashclicks-subscriptions-table"]', {
      timeout: 60000
    }).should("be.visible");
    cy.get('[data-testid="dashclicks-setting-icon"]').eq(3).click();
    cy.contains("Submit Upsell Opportunity").first().click();
    cy.intercept("POST", /pulses.*/).as("createPulse");
    cy.get('[data-testid="submit-upsell-modal"]', {
      timeout: 60000
    }).should("be.visible");
    cy.get('[data-testid="add-remarks"]').click().type("This is a test remark");
    cy.get('[data-testid="submit-button"]').click();
    cy.wait("@createPulse").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body).to.have.property("success", true);
    });
  });
  it("Support Risk Escalation", () => {
    cy.get('[data-testid="dashclicks-subscriptions-table"]', {
      timeout: 60000
    }).should("be.visible");
    cy.get('[data-testid="dashclicks-setting-icon"]').eq(3).click();
    cy.contains("Submit Support Risk Escalation").first().click();
    cy.get('[data-testid="support-risk-modal"]', {
      timeout: 60000
    }).should("be.visible");
    cy.intercept("POST", /pulses.*/).as("createPulse");
    cy.get('[data-testid="add-remarks"]').click().type("This is a test remark");
    cy.get('[data-testid="submit-button"]').click();
    cy.wait("@createPulse").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body).to.have.property("success", true);
    });
  });
});
