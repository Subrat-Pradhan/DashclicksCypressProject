describe("Project Files Feature", () => {
  beforeEach(() => {
    // Intercept API calls for files
    cy.intercept("GET", "**/v1/projects/files**").as("getFiles");

    // Use the existing login command from your project
    cy.login();

    // Navigate to projects
    cy.visit("/fulfillment-center/projects");

    cy.get('[data-testid="fulfillment-center-panel"]', {
      timeout: 20000
    }).should("be.visible");

    cy.get('[data-testid^="sub-account-item-"]').first().click();

    // Go to Files tab
    cy.contains("Files").click();

    // Wait for files to load
    cy.wait("@getFiles", { timeout: 20000 });
  });

  it("should display empty state when no files exist", () => {
    // Intercept with empty response
    cy.intercept("GET", "**/v1/projects/files**", {
      statusCode: 200,
      body: { pages: [{ files: [] }] }
    }).as("emptyFiles");

    cy.reload();
    cy.wait("@emptyFiles");

    // Check for empty state
    cy.contains("No Files", { timeout: 5000 }).should("be.visible");
    cy.contains("Add Files").should("be.visible");
  });

  it("should upload a file successfully", () => {
    // Open upload modal
    cy.get("[data-testid^=upload-files-button").should("be.visible");
    cy.get("[data-testid^=upload-files-button").click();
    cy.contains("Upload File", { timeout: 1000 }).should("be.visible");

    // Mock successful upload
    cy.intercept("POST", "**/v1/projects/files/upload", {
      statusCode: 200,
      body: {
        id: "file-123",
        fileName: "sample.pdf",
        fileSize: 12345,
        fileType: "application/pdf",
        key: "https://example.com/test-document.pdf",
        created_at: new Date().toISOString()
      }
    }).as("fileUpload");

    // Upload a file
    cy.get('input[type="file"]').attachFile("sample.pdf");

    cy.get('[data-testid^="upload-file-save-button"]')
      .should("be.visible")
      .first()
      .click();

    cy.intercept("GET", "**/v1/projects/files**", {
      statusCode: 200,
      body: {
        pages: [
          {
            files: [
              {
                id: "file-123",
                fileName: "sample.pdf",
                fileType: "application/pdf",
                fileSize: 12345,
                key: "https://example.com/test-document.pdf",
                created_at: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
          }
        ]
      }
    }).as("refreshFiles");

    cy.wait("@refreshFiles");

    // Verify file appears
    cy.contains("sample.pdf", { timeout: 5000 }).should("be.visible");
  });

  it("should search for files correctly", () => {
    const searchTerm = "sample";
    let apiResponse;

    // Use a spy approach - intercept but don't mock
    cy.intercept(
      "GET",
      "**/v1/projects/files?**search=" + searchTerm + "**",
      (req) => {
        req.continue((res) => {
          // Store the response for later examination
          apiResponse = res.body.data;
        });
      }
    ).as("searchFiles");

    // Type in search field
    cy.get('input[placeholder="Search Files"]').clear().type(searchTerm);

    // Wait for the request
    cy.wait("@searchFiles", { timeout: 5000 });

    // Now examine the response
    cy.then(() => {
      // Get the file names from the response
      const fileNames = apiResponse.map((file) => file.fileName || file.name);

      // // Check if any of those files contain our search term
      const matchingFiles = fileNames.filter((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // // Now verify the UI shows at least one of the matching files
      if (matchingFiles.length > 0) {
        cy.contains(matchingFiles[0]).should("be.visible");
      }
    });

    // Verify results
    cy.contains("sample.pdf", { timeout: 15000 }).should("be.visible");
  });

  it("should preview a file when clicked", () => {
    // Mock file data with more specific URL pattern
    cy.intercept("GET", "**/v1/projects/files?**", {
      statusCode: 200,
      body: {
        pages: [
          {
            files: [
              {
                id: "sample-file-id",
                name: "sample.pdf",
                type: "application/pdf",
                size: 12345,
                url: "https://example.com/preview-document.pdf",
                created_at: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
          }
        ]
      }
    }).as("getFilesForPreview");

    // Try with a longer timeout
    cy.get('[data-testid="file-list-item"]', { timeout: 30000 })
      .first()
      .click();

    // Verify preview opens
    cy.get('[data-testid="preview-detail-card"]', { timeout: 10000 }).should(
      "be.visible"
    );

    // Close the preview
    cy.get('button[aria-label="close"]').click();
    cy.get('[data-testid="preview-detail-card"]').should("not.exist");
  });

  it("should delete a file successfully", () => {
    // First intercept to capture all existing files
    let initialFiles: any;
    cy.intercept("GET", "**/v1/projects/files?**", (req) => {
      req.continue((res) => {
        initialFiles = res;
      });
    }).as("getInitialFiles");

    // Mock delete success
    cy.intercept("DELETE", "**/v1/projects/files/*", {
      statusCode: 200,
      body: { success: true }
    }).as("deleteFile");

    // Use cy.then() to ensure we have fileName defined before proceeding
    cy.then(() => {
      // Find the file item containing the file name
      cy.contains("sample.pdf").should("be.visible");

      // Click the delete icon for this file
      cy.contains("sample.pdf")
        .closest('[data-testid="file-list-item"]')
        .within(() => {
          cy.get('[data-testid="delete-icon"]')
            .should("be.visible")
            .click({ force: true });
        });

      // Confirm deletion in modal
      cy.contains("Are you sure you want to delete this file?").should(
        "be.visible"
      );
      cy.get('[data-testid="confirmation-modal-confirm-button"]')
        .should("be.visible")
        .click();

      cy.contains("File's metadata deleted successfully").should("be.visible");
    });
  });

  it("should download a file correctly", () => {
    // Setup mock data
    cy.intercept("GET", "https://assets.mydashmetrics.com/**/*.pdf").as(
      "pdfDownload"
    );
    cy.intercept("GET", "**/v1/projects/files**", {
      statusCode: 200,
      body: {
        pages: [
          {
            files: [
              {
                id: "download-file-id",
                name: "download-me.pdf",
                type: "application/pdf",
                size: 12345,
                url: "https://example.com/download-me.pdf",
                created_at: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
          }
        ]
      }
    }).as("getFilesForDownload");

    cy.then(() => {
      // Find the file item containing the file name
      cy.contains("sample.pdf").should("be.visible");

      cy.window().then((win) => {
        cy.stub(win, "open").as("windowOpen");
      });

      // Click the delete icon for this file
      cy.contains("sample.pdf")
        .closest('[data-testid="file-list-item"]')
        .within(() => {
          cy.get('[data-testid="download-icon"]')
            .should("be.visible")
            .click({ force: true });
        });
    });
    cy.wait("@pdfDownload", { timeout: 15000 }).then((interception) => {
      expect(interception.request.url).to.include("sample.pdf");
    });
  });
});
