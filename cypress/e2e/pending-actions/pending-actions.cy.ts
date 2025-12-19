import { makePendingActionsQueryKey } from "@api/query-keys/projects";

// Cypress test for the Pending Actions feature
describe("Pending Actions Feature", () => {
  beforeEach(() => {
    // Login first - this is required for accessing protected routes
    cy.login();

    // After successful login, visit the projects page
    cy.visit("/fulfillment-center/projects");
    cy.intercept("GET", /pending-action.*/).as("pendingActions");
  });

  it("should render pending actions table", () => {
    /* test all,pending and completed buttons are working  */
    cy.getByTestId("pending-actions-table-tool-bar").should("be.visible");
    cy.getByTestId("button-group").should("be.visible");

    // cy.getByTestId("button-group-child-0").click();
    // Wait for the next pendingActions request after clicking the button
    // cy.wait("@pendingActions").then((interception) => {
    //   expect(interception.request.url).toContain("status=");
    // });

    // cy.getByTestId("button-group-child-1").first().click();
    // cy.wait("@pendingActions").then((interception) => {
    //   expect(interception.request.url).contain("status=pending");
    // });
    // cy.getByTestId("button-group-child-2").first().click();
    // cy.wait("@pendingActions").then((interception) => {
    //   expect(interception.request.url).contain("status=completed");
    // });

    /**
     * * TEST SECOND OPTION WORKING
        * now click on  second option ,it should  hit
        * endpoint : http://localhost:5000/v1/auth/sso
        * method : POST
        * payload : {"account":"676e8280c1c500e7102d1d22","impersonate":true}
        * response schema : {
                              "success": true,
                              "data": {
                                        "url": "https://localhost:3000/auth/sso?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiNjgwOWY4YmE3OWJiYTdiYzRjYzQyYTE3IiwiYWNjb3VudCI6IjY3NmU4MjgwYzFjNTAwZTcxMDJkMWQyMiIsImlhdCI6MTc0NTQ4Mzk2MywiZXhwIjoxNzQ1NDg0ODYzfQ.AZAtlXk9oHr7eVB8D47QbxjWAYlpppuZ4VqH6rJ31MA"
                                      }
                            }
     *  once the call is successful take user to the url which will be returned by above request response in new tab
     */

    cy.getQueryData(makePendingActionsQueryKey()).then((response) => {
      cy.log("Pending Actions Response: ", response);

      // Click the gear icon to open the menu
      cy.getByTestId("pending-actions-gear").click();
      cy.getByTestId("pending-actions-menu").should("be.visible");

      // Click the second option
      cy.getByTestId("second-option").click();

      // Prepare payload using the first account id from the response
      const accountId =
        response?.data?.[0]?.account_id || response?.data?.[0]?._id;
      if (accountId) {
        cy.request({
          method: "POST",
          url: "http://localhost:5000/v1/auth/sso",
          body: { account: accountId, impersonate: true },
          failOnStatusCode: false
        }).then((ssoRes) => {
          expect(ssoRes.status).equal(200);
          const ssoUrl = ssoRes.body.data.url;
          expect(ssoUrl).contain("auth/sso?token=");
          // Open the returned URL in a new tab (simulate)
          cy.window().then((win) => {
            win.open(ssoUrl, "_blank");
          });
        });
      }
    });

    /**
     * * TEST PENDING ACTIONS TABLE
     * Verify the presence of a table with data-test-id="pending-actions-table-container"
     * Verify the presence of a table toolbar with data-test-id="pending-actions-table-tool-bar"
     * Verify the presence of a table with data-test-id="dc-table"
     * Verify the presence of a table header with data-test-id="dc-table-head"
     * Verify the presence of a table body with data-test-id="dc-table-body"
     * Verify the presence of a table footer with data-test-id="dc-table-footer"
     * Verify the presence of 7 columns in the table
     * Verify the presence of a settings gear icon with data-test-id="pending-actions-gear" and click on it to open a menu with data-test-id="pending-actions-menu"
     * Verify on click of it the menu opens with data-test-id="pending-actions-menu"
     * Verify the presence of 4 options in the menu with data-test-id="first-option", data-test-id="second-option", data-test-id="third-option", and data-test-id="fourth-option"
     */

    // Verify table container is visible
    cy.getByTestId("pending-actions-table-container").should("be.visible");

    // Verify table toolbar exists
    cy.getByTestId("pending-actions-table-tool-bar").should("be.visible");

    // Verify table and its components are visible
    cy.getByTestId("dc-table").should("be.visible");
    cy.getByTestId("dc-table-head").should("be.visible");
    cy.getByTestId("dc-table-body").should("be.visible");
    cy.getByTestId("dc-table-pagination").should("be.visible");

    // Verify table has 7 columns
    cy.getByTestId("dc-table-head").find("th").should("have.length", 7);

    // Verify all 4 menu options are visible
    /* TODO: write test to make sure all 4 options are not visible where it is not required, e.g - when a subscription is already cancelled it should not have fourth-option, etc... */
    // cy.getByTestId("first-option").should("be.visible");
    // cy.getByTestId("second-option").should("be.visible");
    // cy.getByTestId("third-option").should("be.visible");
    // cy.getByTestId("fourth-option").should("be.visible");

    /**
     * * TEST FIRST OPTION WORKING
     * click on 1st option from the list that is view project  data-test-id="first-option"  should take user to /details?main_account_id=&sub_account_id=61a6588df20a46e969efbed0&sub_account_name=SANDBOX&order_id=67f600c84f49390de70c6fc3&prevTab=pendingActions
     *  Click on first option and verify navigation
     *  now take first item from the table and tally it's data  in the URL
     *  values to test are"sub_account_id=61a6588df20a46e969efbed0","sub_account_name=SANDBOX","order_id=67f600c84f49390de70c6fc3","prevTab=pendingActions"
     *  after a delay of 5 seconds go back to pending actions page by clicking on back button from the UI
     */
    cy.getByTestId("pending-actions-gear").click();
    cy.getByTestId("pending-actions-menu").should("be.visible");
    cy.getByTestId("first-option").click();
    cy.url().should("include", "/details");
    cy.getByTestId("back-button").click();
    cy.wait(15000);

    /**
     * * TEST THIRD OPTION WORKING
     * Click on third option and verify navigation
     * it should take user to http://localhost:3000/fulfillment-center/projects/services/comparison/612020df8cdcf8bf2bbcd874?subscription_id=67ecf0c1f749d3f432d57c2f&order_id=67ecf0c1d1d37848e434bc8a
     * after three seconds go back to pending actions page by clicking on back button from the UI whose id is back-button
     */
    cy.getByTestId("pending-actions-gear").click();
    cy.getByTestId("third-option").click();
    cy.url().should("include", "/services/comparison");
    cy.wait(3000);
    cy.getByTestId("back-button").click();
    cy.wait(15000);

    /**
     * * TEST FOURTH OPTION WORKING
     * Click on fourth option and verify navigation
     * it should take user to http://localhost:3000/fulfillment-center/projects?step=cancellation-reason
     * after three seconds go back to pending actions page by clicking on close button of the dialog whose  id is close-button-stepper-dialog which is a button
     */
    cy.getByTestId("pending-actions-gear").click();
    cy.getByTestId("pending-actions-menu").should("be.visible");
    cy.getByTestId("fourth-option").click();
    cy.getByTestId("close-button-stepper-dialog").click();

    /**
     * * * TEST VIEW TASK BUTTON WORKING
     * * Click on view task button and verify navigation
     * projects?task_id=6808a5b8542a096c9fa8217e&order_id=677bab14790999500c672c74&subscription_id=677bab144c3ad3d00f7ba554
     * make sure to check the url for the task_id, order_id and subscription_id are getting set in URL correctly for the selected row
     * then close the side drawer after 5 seconds delay
     */
    cy.getByTestId("view-task-button").click();
    cy.url().should("include", "task_id=");
    cy.url().should("include", "order_id=");
    cy.url().should("include", "subscription_id=");

    // close the right side drawer
    cy.getByTestId("close-drawer-button").click();

    /**
     * * TEST PRODUCT INFO BUTTON WORKING
     *  Click on product info button and verify navigation
     * it should take user to http://localhost:3000/fulfillment-center/details
     * and after waiting for 5 seconds take user back to pending actions page
     */
    cy.getByTestId("product-info-button").first().click();
    cy.url().should("include", "/details");
    cy.wait(5000);
    cy.getByTestId("back-button").click();
  });
});
