/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import Testing Library commands
import "@testing-library/cypress/add-commands";
import "cypress-file-upload";
import { TEST_EMAIL, TEST_PASSWORD } from "../e2e/constants";

declare global {
  interface Window {
    queryClient: any;
  }
  namespace Cypress {
    interface Chainable {
      hasMuiClass(className: string): Chainable<JQuery<HTMLElement>>;
      getByTestId(dataTestAttribute: string): Chainable<JQuery<HTMLElement>>;
      login(email?: string, password?: string): Chainable<void>;
      getQueryData(queryKey: string | unknown[]): Chainable<any>;
    }
  }
}

// Custom command to check MUI class
Cypress.Commands.add(
  "hasMuiClass",
  { prevSubject: true },
  (subject, className: string) => {
    return cy.wrap(subject).should("have.class", className);
  }
);

/* use cy.getByTestId('test-id-of-the-element-you-want-to-target') */
Cypress.Commands.add("getByTestId", (selector) => {
  return cy.get(`[data-test-id=${selector}]`);
});

/**
 * Custom command to retrieve data from React Query cache by query key
 * @example cy.getQueryData('brandingApi') - Gets cache data for string key alias
 * @example cy.getQueryData(['users', 123]) - Gets cache data for array query key
 */
Cypress.Commands.add("getQueryData", (queryKey: string | unknown[]) => {
  return cy.window().then((window) => {
    // Check if queryClient exists and log its status
    cy.log(`QueryClient available: ${Boolean(window.queryClient)}`);

    if (!window.queryClient) {
      cy.log("ERROR: queryClient is not available in window object");
      throw new Error("queryClient is not available on window object");
    }

    // Use the standard getQueryData method to directly access the cache
    const queryData = window.queryClient.getQueryData(queryKey);

    // Return the wrapped queryData so it's available in the .then() chain
    return cy.wrap(queryData);
  });
});
/**
 * Custom command to login to the application
 * @example cy.login() - Logs in with default credentials
 * @example cy.login('user@example.com', 'password') - Logs in with custom credentials
 */
Cypress.Commands.add(
  "login",
  (email = TEST_EMAIL, password = TEST_PASSWORD) => {
    // Set up ALL intercepts before visiting the page
    cy.intercept("GET", "**/accounts/**/branding").as("brandingApi");

    // Use a more specific pattern that exactly matches the API call
    cy.intercept("GET", `**/auth/users/${email.toLowerCase()}/accounts*`).as(
      "getAccounts"
    );

    // Take user to localhost:3000
    cy.visit("localhost:3000");

    // The address bar should update to /auth/login
    cy.url().should("include", "/auth/login");

    // Check if login title is visible
    cy.getByTestId("login-title").should("be.visible");

    // Check if email input field is present
    cy.getByTestId("email-input").should("be.visible");

    // Type email with a deliberate pace to ensure proper typing
    cy.getByTestId("email-input").clear().type(email, { delay: 100 });

    // Force a blur event that should trigger the API call
    cy.getByTestId("email-input").blur({ force: true });

    // Ensure the focus is away from the email input
    cy.get("body").click(10, 10);

    // Wait for getAccounts with retry logic
    cy.wait("@getAccounts", { timeout: 40000 }).then((interception) => {
      cy.log(`Request URL: ${interception.request.url}`);
      cy.log(`Response status: ${interception.response?.statusCode}`);
    });

    // Once getAccounts() is successful, password input field will be visible
    cy.getByTestId("password-input").should("be.visible", { timeout: 10000 });

    // Insert password in password input field
    cy.getByTestId("password-input").type(password, { delay: 50 });

    // Hit login button
    cy.getByTestId("login-button").click();

    // Wait for it to redirect to dashboard
    cy.url({ timeout: 25000 }).should("include", "/dashboard");
  }
);
