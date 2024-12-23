describe('Test',  () => {
  it('T1 invalid email', () => {
    cy.visit('https://dashclickspm.dashclicks.com/auth/login')
    cy.get("input[name='email']").type('vk@dashclicks0.com')
    cy.get('.LPIFSIFBFError').contains('No accounts found with the given email!')
  })
})
describe('Test',  () => {
  it('T2 invalid login', () => {
    cy.visit('https://dashclickspm.dashclicks.com/auth/login')
    cy.get("input[name='email']").type('vk@dashclicks.com')
    cy.get("input[name*='password']").type('Dashclicks@20240#')
    cy.get(".LPIFSIFBPRightIcon").click()
    cy.get('.mainButton').click()
  })
})
describe('Login Test Flow', () => {
  it('T3 valid login', () => {
    cy.visit('https://dashclickspm.dashclicks.com/auth/login')
    cy.get("input[name='email']").type('vk@dashclicks.com')
    cy.get("input[name*='password']").type('Dashclicks@2024#')
    cy.get('.mainButton').click()
  })
})