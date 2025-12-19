describe('Login Test Flow', () => {
  
  // Constants for reusable selectors and login credentials
  const loginUrl = 'https://dashclickspm.dashclicks.com/auth/login';
  const email = 'vk@dashclicks.com';
  const password = 'Dashclicks@2024#';

  // Reusable function for logging in
  const login = () => {
    cy.visit(loginUrl);
    cy.get("input[name='email']").type(email);
    cy.get("input[name*='password']").type(password);
    cy.get('.mainButton').click();
  };

  // Reusable function to trigger mouseover and click elements
  const hoverAndClick = (selector, timeout = 50000) => {
    cy.get(selector, { timeout }).should('be.visible').trigger('mouseover');
    cy.get(selector).click();
  };

  // Perform login and verify each action
  it('T3 valid login', () => {
    login();

    // Open Fulfillment Center
    hoverAndClick("img[alt='Fulfillment Center']");
    cy.get("body > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(5) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > div:nth-child(2) > span:nth-child(1)").click();
    
    // Reload and Open Funnels App
    cy.reload();
    hoverAndClick("img[alt='Funnels']");
    cy.get("div[class='MuiButtonBase-root MuiListItemButton-root MuiListItemButton-gutters Mui-selected MuiListItemButton-root MuiListItemButton-gutters Mui-selected css-1kt85jt'] span[class='MuiTouchRipple-root css-w0pj6f']").click();
    
    // Reload and Open Sites App
    cy.reload();
    hoverAndClick("img[alt='Sites']");
    cy.get("body > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(5) > ul:nth-child(4) > li:nth-child(2) > div:nth-child(1) > div:nth-child(2) > span:nth-child(1)").click();
  });

});
