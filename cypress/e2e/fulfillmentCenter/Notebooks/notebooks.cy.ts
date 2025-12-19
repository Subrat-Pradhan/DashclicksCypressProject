describe("Project Notebooks Feature", () => {
  beforeEach(() => {
    // Intercept API calls for notebooks
    cy.intercept("GET", "**/v1/projects/notebooks**").as("getNotebooks");

    // Use the existing login command from your project
    cy.login();

    // Navigate to projects
    cy.visit("/fulfillment-center/projects");

    cy.get('[data-testid="fulfillment-center-panel"]', {
      timeout: 20000
    }).should("be.visible");

    cy.get('[data-testid^="sub-account-item-"]').first().click();

    // Go to Notebooks tab
    cy.contains("Notebooks").click();

    // Wait for notebooks to load
    cy.wait("@getNotebooks", { timeout: 20000 });
  });

  it("should display empty state when no notebooks exist", () => {
    // Intercept with empty response
    cy.intercept("GET", "**/v1/projects/notebooks**", {
      statusCode: 200,
      body: { pages: [{ notebooks: [] }] }
    }).as("emptyNotebooks");

    cy.reload();
    cy.wait("@emptyNotebooks");

    // Check for empty state
    cy.contains("No Notebooks", { timeout: 5000 }).should("be.visible");
    cy.contains("Add Notebook").should("be.visible");
  });

  it("should create a notebook successfully", () => {
    // Intercept with empty response first to ensure we see the Add Notebook button
    cy.intercept("GET", "**/v1/projects/notebooks**", {
      statusCode: 200,
      body: {
        success: true,
        message: "SUCCESS",
        data: [], // Empty array for no notebooks
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
          per_page: 25,
          next_page: null,
          prev_page: null
        }
      }
    }).as("emptyNotebooks");

    cy.reload();
    cy.wait("@emptyNotebooks");

    // Click Add Notebook button on empty state
    cy.contains("Add Notebook").click();
    cy.contains("Create Notebook", { timeout: 1000 }).should("be.visible");

    // Mock successful notebook creation
    cy.intercept("POST", "**/v1/projects/notebooks", {
      statusCode: 200,
      body: {
        success: true,
        message: "SUCCESS",
        data: {
          _id: "notebook-123",
          title: "Test Notebook",
          content: "<p>Notebook content goes here</p>\n",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }).as("createNotebook");

    // Fill out the notebook form
    cy.get('input[name="title"]').type("Test Notebook");
    cy.get(".WysiwygEditor").should("be.visible").click();
    cy.wait(500); // Give the editor time to focus
    cy.focused().type("Notebook content goes here", { force: true });

    // Before clicking the create button, set up the next GET intercept
    // This is the crucial step from the files test
    cy.intercept("GET", "**/v1/projects/notebooks**", {
      statusCode: 200,
      body: {
        success: true,
        message: "SUCCESS",
        data: [
          {
            _id: "notebook-123",
            title: "Test Notebook",
            content: "<p>Notebook content goes here</p>\n",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              email: "john@dashclicks.com",
              name: "John Doe",
              id: "615e776b4dbb761b5e1ca93b"
            }
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          pages: 1,
          per_page: 25,
          next_page: null,
          prev_page: null
        }
      }
    }).as("refreshNotebooks");

    // Save the notebook
    cy.get('[data-testid="create-notebook-button"]').click();

    // Wait for the create request to complete
    cy.wait("@createNotebook");

    // Wait for the refresh request to complete
    cy.wait("@refreshNotebooks");

    // Verify notebook appears in the list
    cy.contains("Test Notebook", { timeout: 10000 }).should("be.visible");
  });

  it("should search for notebooks correctly", () => {
    const searchTerm = "Test Notebook";

    // Create a variable to store the response data outside the promise chain
    let searchResponseData = null;

    // Use a spy approach - intercept but don't mock
    cy.intercept("GET", "**/v1/projects/notebooks?**", (req) => {
      // Only spy on requests that include our search term
      if (req.url.includes(`search=${searchTerm.replace(" ", "+")}`)) {
        req.continue((res) => {
          // Store the data instead of using cy.log inside the promise
          searchResponseData = res.body;
        });
      } else {
        // Let other notebook requests through without logging
        req.continue();
      }
    }).as("searchNotebooks");

    // Type in search field
    cy.get(
      'input[placeholder="Search Files"], input[placeholder="Search Notebooks"]'
    )
      .clear()
      .type(searchTerm);

    // Wait for the request
    cy.wait("@searchNotebooks", { timeout: 10000 });

    // AFTER the wait is complete, THEN we can log the stored response data
    cy.then(() => {
      // Now we can safely use cy.log
      cy.log(
        "Search Response Status:",
        searchResponseData ? 200 : "No response"
      );
      cy.log("Search Response Body:", JSON.stringify(searchResponseData));

      if (searchResponseData && searchResponseData.data) {
        const notebooks = searchResponseData.data;
        cy.log(
          `Found ${notebooks.length} notebooks matching search term "${searchTerm}"`
        );

        notebooks.forEach((notebook) => {
          cy.log(`Notebook: ${notebook.title}`);
        });

        // If we want to verify based on API data
        if (notebooks.length > 0) {
          // Check that at least one notebook with matching title is visible
          cy.contains(notebooks[0].title).should("be.visible");
        }
      }
    });

    // Verify results are visible in the UI
    cy.contains("Test Notebook", { timeout: 15000 }).should("be.visible");
  });

  it("should preview a notebook when clicked", () => {
    // Mock notebook data
    cy.intercept("GET", "**/v1/projects/notebooks**", {
      statusCode: 200,
      body: {
        success: true,
        message: "SUCCESS",
        data: [
          {
            _id: "notebook-123",
            title: "Test Notebook",
            content: "<p>Notebook content goes here</p>\n",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              email: "john@dashclicks.com",
              name: "John Doe",
              id: "615e776b4dbb761b5e1ca93b"
            }
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          pages: 1,
          per_page: 25,
          next_page: null,
          prev_page: null
        }
      }
    }).as("getNotebooksForPreview");

    cy.reload();
    cy.wait("@getNotebooksForPreview");

    // Click on the notebook to preview it
    cy.get('[data-testid="file-list-item"]', { timeout: 30000 })
      .first()
      .click();

    // // Verify preview opens
    cy.get('[data-testid="notebook-content"]', { timeout: 30000 }).should(
      "be.visible"
    );

    // // Verify notebook content appears in preview
    cy.get('[data-testid="notebook-content"]').within(() => {
      cy.contains("Notebook content goes here").should("be.visible");
    });

    // // Close the preview
    cy.get('button[aria-label="close"]').click();
    cy.get('[data-testid="notebook-content"]').should("not.exist");
  });

  it("should edit a notebook successfully", () => {
    // Mock notebook data
    cy.intercept("GET", "**/v1/projects/notebooks**", {
      statusCode: 200,
      body: {
        success: true,
        message: "SUCCESS",
        data: [
          {
            _id: "notebook-123",
            title: "Test Notebook",
            content: "<p>Notebook content goes here</p>\n",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              email: "john@dashclicks.com",
              name: "John Doe",
              id: "615e776b4dbb761b5e1ca93b"
            }
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          pages: 1,
          per_page: 25,
          next_page: null,
          prev_page: null
        }
      }
    }).as("getNotebooksForEdit");

    cy.get('[data-testid="file-list-item"]', { timeout: 30000 })
      .first()
      .within(() => {
        cy.get('[data-testid="edit-icon"]')
          .should("be.visible")
          .click({ force: true });
      });
    cy.get('input[name="title"]').should("have.value", "Test Notebook");
    cy.get('input[name="title"]').clear().type("Updated Test Notebook");
    cy.get(".WysiwygEditor").should("be.visible").click();
    cy.wait(500); // Give the editor time to focus
    cy.focused()
      .clear()
      .type("Updated Notebook content goes here", { force: true });

    cy.intercept("GET", "**/v1/projects/notebooks**", {
      statusCode: 200,
      body: {
        success: true,
        message: "SUCCESS",
        data: [
          {
            _id: "notebook-123",
            title: "Updated Test Notebook",
            content: "<p>Updated Notebook content goes here</p>\n",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              email: "john@dashclicks.com",
              name: "John Doe",
              id: "615e776b4dbb761b5e1ca93b"
            }
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          pages: 1,
          per_page: 25,
          next_page: null,
          prev_page: null
        }
      }
    }).as("refreshNotebooks");
    cy.get('[data-testid="create-notebook-button"]', { timeout: 10000 }).should(
      "have.text",
      "Update"
    );

    cy.get('[data-testid="create-notebook-button"]').click();

    cy.wait("@refreshNotebooks");

    cy.contains("Updated Test Notebook", { timeout: 10000 }).should(
      "be.visible"
    );
  });

  it("should delete a notebook successfully", () => {
    // Mock notebook data
    cy.intercept("GET", "**/v1/projects/notebooks**", {
      statusCode: 200,
      body: {
        success: true,
        message: "SUCCESS",
        data: [
          {
            _id: "notebook-123",
            title: "Delete Me Notebook",
            content: "<p>Notebook content goes here</p>\n",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              email: "john@dashclicks.com",
              name: "John Doe",
              id: "615e776b4dbb761b5e1ca93b"
            }
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          pages: 1,
          per_page: 25,
          next_page: null,
          prev_page: null
        }
      }
    }).as("getNotebooksForDelete");

    cy.reload();

    cy.wait("@getNotebooksForDelete");

    // Mock delete success
    cy.intercept("DELETE", "**/v1/projects/notebooks/*", {
      statusCode: 200,
      body: { success: true }
    }).as("deleteNotebook");

    // Click the delete icon for this notebook
    cy.contains("Delete Me Notebook")
      .closest('[data-testid="file-list-item"]')
      .within(() => {
        cy.get('[data-testid="delete-icon"]')
          .should("be.visible")
          .click({ force: true });
      });

    // Confirm deletion in modal
    cy.contains("Are you sure you want to delete this notebook?").should(
      "be.visible"
    );
    cy.get('[data-testid="confirmation-modal-confirm-button"]')
      .should("be.visible")
      .click();

    // Wait for delete request
    cy.wait("@deleteNotebook");

    // Mock empty response after deletion
    cy.intercept("GET", "**/v1/projects/notebooks**", {
      statusCode: 200,
      body: {
        success: true,
        message: "SUCCESS",
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
          per_page: 25,
          next_page: null,
          prev_page: null
        }
      }
    }).as("getAfterDelete");
    cy.reload();
    cy.wait("@getAfterDelete");
    // Verify notebook is gone
    cy.contains("Delete Me Notebook").should("not.exist");
    cy.contains("No Notebooks", { timeout: 5000 }).should("be.visible");
  });
});
