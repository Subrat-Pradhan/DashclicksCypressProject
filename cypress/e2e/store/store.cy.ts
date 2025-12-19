describe("Store Page", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/v1/store/products/?type=store").as("storeProducts");
    cy.login();

    cy.visit("/fulfillment-center/store");

    cy.wait("@storeProducts", { timeout: 50000 });
  });
  const randomString = Math.random().toString(36).substring(2, 8);
  const randomEmail = `test${Math.random().toString(36).substring(2, 8)}@example.com`;
  const randomPhone = `5${Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(9, "0")}`;
  it("purchasing a service", () => {
    cy.get('[data-testid="store-managed-services-section"]', {
      timeout: 40000
    }).should("be.visible");
    cy.get('[data-testid="managed-service-card-google-ads"]').click();
    cy.get('[data-testid="add-to-cart-isPlus"]').first().click();
    cy.get('[data-testid="billed-plan-0"]').first().click();
    cy.contains("button", "Continue").click();
    cy.get('[data-testid="main-account-input"]').first().click();
    cy.contains("This is my Account").first().click();
    cy.get('[data-testid="add-to-cart-btn"]', {
      timeout: 10000
    }).click();
    cy.get('[data-testid="topbar-cart"]', { timeout: 10000 }).click({
      force: true
    });

    cy.contains("Continue to Checkout", { timeout: 10000 }).first().click();
    cy.get('[data-testid="card-select"]').click();
    cy.contains(/4242/).click();
    cy.contains("Place Your Order", { timeout: 10000 }).first().click();
    cy.url({ timeout: 100000 }).should(
      "include",
      "/fulfillment-center/store/checkout/complete/final"
    );
  });
  it("lear more about the plan", () => {
    cy.get('[data-testid="store-managed-services-section"]', {
      timeout: 40000
    }).should("be.visible");
    cy.get('[data-testid="managed-service-card-google-ads"]').click();
    cy.get('[data-testid="learn-more-isPlus"]').first().click();
  });
  it("view comparison", () => {
    cy.get('[data-testid="store-managed-services-section"]', {
      timeout: 40000
    }).should("be.visible");
    cy.get('[data-testid="managed-service-card-google-ads"]').click();
    cy.contains("View Detailed Comparison").click();
  });

  it("payment failed", () => {
    cy.get('[data-testid="store-managed-services-section"]', {
      timeout: 40000
    }).should("be.visible");
    cy.get('[data-testid="managed-service-card-tiktok-ads"]').click();
    cy.get('[data-testid="add-to-cart-isPlus"]').first().click();
    cy.get('[data-testid="billed-plan-0"]').first().click();
    cy.contains("button", "Continue").click();
    cy.get('[data-testid="main-account-input"]').first().click();
    cy.contains("This is my Account").first().click();
    cy.get('[data-testid="add-to-cart-btn"]', {
      timeout: 10000
    }).click();
    cy.get('[data-testid="topbar-cart"]', { timeout: 10000 }).click({
      force: true
    });

    cy.contains("Continue to Checkout", { timeout: 10000 }).first().click();
    cy.get('[data-testid="card-select"]').click();
    cy.wait(2000);
    cy.contains(/0341/).click({
      force: true
    });
    cy.intercept("POST", "**/v1/store/cart/checkout").as("checkoutApi");
    cy.contains("Place Your Order", { timeout: 10000 })
      .first()
      .click({ force: true });
    cy.wait("@checkoutApi", { timeout: 100000 })
      .its("response.body.success")
      .should("eq", false);
  });
  it("purchasing a service with new business and new contact", () => {
    cy.get('[data-testid="store-managed-services-section"]', {
      timeout: 40000
    }).should("be.visible");
    cy.get('[data-testid="managed-service-card-seo"]').click();
    cy.get('[data-testid="add-to-cart-isPlus"]').first().click();
    cy.get('[data-testid="billed-plan-0"]').first().click();
    cy.contains("button", "Continue").click();
    cy.get('[data-testid="main-account-input"]').first().click();

    cy.get('[data-testid="create-button"]').click();
    cy.get('input[placeholder="Enter"]').first().type(randomString);

    cy.get('input[placeholder="Enter"]').eq(1).type(randomEmail);

    cy.get('[data-testid="business-tel-input"]').type(randomPhone);

    cy.contains("Save Business").click();
    cy.get('[data-testid="person-input"]').first().click();
    cy.get('[data-testid="create-button"]', { timeout: 2000 }).click({
      force: true
    });
    cy.get('input[placeholder="Enter"]').first().type(randomString);

    cy.get('input[placeholder="Enter"]').eq(1).type(randomEmail);

    cy.get('[data-testid="person-tel-input"]').type(randomPhone);
    cy.contains("Save Person").click();
    cy.get('[data-testid="add-to-cart-btn"]', {
      timeout: 10000
    }).click();
    cy.get('[data-testid="topbar-cart"]', { timeout: 10000 }).click({
      force: true
    });

    cy.contains("Continue to Checkout", { timeout: 10000 }).first().click();
    cy.get('[data-testid="card-select"]', { timeout: 2000 }).click();
    cy.contains(/4242/).click();
    cy.contains("Place Your Order", { timeout: 10000 }).first().click();
    cy.url({ timeout: 100000 }).should(
      "include",
      "/fulfillment-center/store/checkout/complete/final"
    );
  });
  it("Editing a business and a person", () => {
    cy.get('[data-testid="store-managed-services-section"]', {
      timeout: 40000
    }).should("be.visible");
    cy.get('[data-testid="managed-service-card-seo"]').click();
    cy.get('[data-testid="add-to-cart-isPlus"]').first().click();
    cy.get('[data-testid="billed-plan-0"]').first().click();
    cy.contains("button", "Continue").click();
    cy.get('[data-testid="main-account-input"]').first().click().type("luffy");

    cy.contains("luffy55").click();
    cy.get('[data-testid="edit-business-button"]').first().click();
    cy.get('input[placeholder="Enter"]').eq(1).clear();
    cy.get('input[placeholder="Enter"]').eq(1).type(randomEmail);

    cy.contains("Save Business").click();
    cy.get('[data-testid="edit-person-button"]').first().click();
    cy.get('input[placeholder="Enter"]').first().type("ljhuj");

    cy.contains("Save Person").click();
    cy.get('[data-testid="add-to-cart-btn"]', {
      timeout: 10000
    }).click();
    cy.get('[data-testid="topbar-cart"]').click({
      force: true
    });

    cy.contains("Continue to Checkout").first().click();
    cy.get('[data-testid="card-select"]', { timeout: 2000 }).click();
    cy.contains(/4242/).click();
    cy.contains("Place Your Order").first().click();
    cy.url({ timeout: 100000 }).should(
      "include",
      "/fulfillment-center/store/checkout/complete/final"
    );
  });
});
