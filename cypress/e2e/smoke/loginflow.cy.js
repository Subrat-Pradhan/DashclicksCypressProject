// cypress/e2e/auth.spec.js

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('https://dashclickspm.dashclicks.com/auth/login');
  });

  // Reusable test data
  const validUser = {
    email: 'vk@dashclicks.com',
    password: 'Dashclicks@2024#'
  };

  const invalidUser = {
    email: 'vk@dashclicks0.com',
    password: 'Dashclicks@20241#'
  };

  // Custom command for login
  Cypress.Commands.add('login', (email, password) => {
    cy.get("input[name='email']").type(email)
    cy.get("input[name*='password']").type(password)
    cy.get('.mainButton').click()
  });

  it('should successfully login with valid credentials', () => {
    cy.login(validUser.email, validUser.password);

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Verify dashboard is loaded
    cy.get('[data-cy=dashboard-header]')
      .should('be.visible')
      .and('contain', 'Dashboard');
  });

  it('should show error message with invalid credentials', () => {
    cy.login(invalidUser.email, invalidUser.password);

    // Verify error message
    cy.get('[data-cy=error-message]')
      .should('be.visible')
      .and('contain', 'Invalid email or password');

    // Verify we're still on login page
    cy.url().should('include', '/login');
  });

  it('should validate required fields', () => {
    // Try login with empty fields
    cy.get('[data-cy=login-button]').click();

    // Check for field validation messages
    cy.get('[data-cy=email-error]')
      .should('be.visible')
      .and('contain', 'Email is required');
    
    cy.get('[data-cy=password-error]')
      .should('be.visible')
      .and('contain', 'Password is required');
  });

  it('should successfully logout from dashboard', () => {
    // Login first
    cy.login(validUser.email, validUser.password);
    cy.url().should('include', '/dashboard');

    // Perform logout
    cy.get('[data-cy=logout-button]').click();

    // Verify redirect to login page
    cy.url().should('include', '/login');

    // Verify we can't access dashboard after logout
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});

describe('Login Test Flow', () => {
  it('T3 valid login', () => {
    cy.visit('https://dashclickspm.dashclicks.com/auth/login')
    cy.get("input[name='email']").type('vk@dashclicks.com')
    cy.get("input[name*='password']").type('Dashclicks@2024#')
    cy.get('.mainButton').click()
  })
})