describe("DashclicksInternal Notebooks Feature", () => {
  beforeEach(() => {
    // Intercept API calls for notebooks
    cy.intercept("GET", "**/v1/projects/notebooks**").as("getNotebooks");

    // Login and navigate to projects
    cy.login();
    cy.visit("/dashclicks/projects");

    cy.get('[data-testid="dashclicks-internal-panel"]', {
      timeout: 20000
    }).should("be.visible");

    cy.get('[data-testid^="sub-account-item-"]').first().click();
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
      body: {
        success: true,
        message: "SUCCESS",
        data: [], // Empty array
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

    // Check for empty state
    cy.contains("No Notebooks", { timeout: 5000 }).should("be.visible");
  });

  it("should search for notebooks correctly", () => {
    const searchTerm = "Test Notebook";
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
        // Let other notebook requests through
        req.continue();
      }
    }).as("searchNotebooks");

    // Type in search field
    cy.get('input[placeholder="Search Notebooks"]').clear().type(searchTerm);

    // Wait for the request
    cy.wait("@searchNotebooks", { timeout: 10000 });

    // After the wait completes, examine the response data
    cy.then(() => {
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

        // If notebooks are found, verify UI shows at least one
        if (notebooks.length > 0) {
          cy.contains(notebooks[0].title).should("be.visible");
        }
      }
    });

    // Verify results in UI
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

    // Log DOM state for debugging if needed
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="file-list-item"]').length === 0) {
        cy.log("No file-list-item elements found");
      }
    });

    // Click on the notebook to preview it
    cy.get('[data-testid="file-list-item"]', { timeout: 30000 })
      .first()
      .click({ force: true });

    // Small delay to ensure rendering completes
    cy.wait(500);

    // Verify notebook content appears in preview
    cy.get('[data-testid="notebook-content"]', { timeout: 30000 })
      .should("be.visible")
      .within(() => {
        cy.contains("Notebook content goes here").should("be.visible");
      });

    // Close the preview
    cy.get('button[aria-label="close"]').click();
    cy.get('[data-testid="notebook-content"]').should("not.exist");
  });
});
