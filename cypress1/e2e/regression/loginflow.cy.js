const { aiAgent } = require('../../support/ai_agent');

describe('Test',  () => {
  it('T1 invalid email', () => {
    cy.visit('https://dashclickspm.dashclicks.com/auth/login')
    cy.get("input[name*='email']").type('test@gmail.com')
    cy.get("input[name*='password']").type('Dashclicks@2024#')
    cy.get('.mainButton').click()
  })

  it('T2 invalid password', () => {
    cy.visit('https://dashclickspm.dashclicks.com/auth/login')
    cy.get("input[name*='email']").type('test@dashclicks.com')
    cy.get("input[name*='password']").type('test123')
    cy.get('.mainButton').click()
  })

  it('T3 valid credentials', () => {
    cy.visit('https://dashclickspm.dashclicks.com/auth/login')
    cy.get("input[name*='email']").type('test@dashclicks.com')
    cy.get("input[name*='password']").type('Dashclicks@2024#')
    cy.get('.mainButton').click()
  })
})

describe('AI-powered testing', () => {
  it('should explore the application', () => {
    aiAgent.explore('https://dashclickspm.dashclicks.com/auth/login');
  });
});