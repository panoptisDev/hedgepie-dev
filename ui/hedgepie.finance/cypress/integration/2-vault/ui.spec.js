import Color from 'color'

describe('Navigation to Vault Page', () => {
  it('should navigate to the Vault page', () => {
    cy.visit('http://localhost:3000/vault')
    cy.url().should('include', '/vault')
  })
})

describe('Title of Vault Page', () => {
  it('title of the page should be Farms', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#title-mast').should('have.text', 'Farms')
  })
})

describe('Stake/Withdraw Tabs', () => {
  it('stake tab should be active and withdraw tab should be inactive based on background-color', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#stake-tab').should('have.css', 'background-color', Color('#16103A').string())
    cy.get('#withdraw-tab').should('have.css', 'background-color', Color('#000').alpha(0).string())
  })

  it('clicking on stake and withdraw tab and checking the color change', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#stake-tab').click()
    cy.get('#stake-tab').should('have.css', 'background-color', Color('#16103A').string())
    cy.get('#withdraw-tab').click()
    cy.get('#withdraw-tab').should('have.css', 'background-color', Color('#16103A').string())
  })

  it('check if harvest and compount button are present in Stake mode', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#stake-tab').click()
    cy.get('#harvest-button').should('be.visible')
    cy.get('#compound-button').should('be.visible')
  })

  it('check if harvest and compount button are not present in Withdraw mode', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#withdraw-tab').click()
    cy.get('#harvest-button').should('not.exist')
    cy.get('#compound-button').should('not.exist')
  })
})

describe('Initial Values', () => {
  it('label must be STAKED and value must be 0.00', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#staked-info #lineinfo-label').should('have.text', 'STAKED')
    cy.get('#staked-info #lineinfo-value').should('have.text', '0.00')
  })

  it('label must be Profit and value must be 0.00', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#profit-info #lineinfo-label').should('have.text', 'Profit')
    cy.get('#profit-info #lineinfo-value').should('have.text', '0.00')
  })

  it('label must be APY and value must be 0.00%', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#apy-info #lineinfo-label').should('have.text', 'APY')
    cy.get('#apy-info #lineinfo-value').should('have.text', '0.00%')
  })

  it('text on the action button should be Connect Wallet', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#action-button').should('have.text', 'Connect Wallet')
  })

  it('intial value in the amount input should be 0.00', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#amount-input').should('have.value', '0.00')
  })

  it('Harvest and Compound buttons should exist and have the respective texts', () => {
    cy.visit('http://localhost:3000/vault')
    cy.get('#harvest-button').should('be.visible')
    cy.get('#harvest-button').should('have.text', 'Harvest')
    cy.get('#compound-button').should('be.visible')
    cy.get('#compound-button').should('have.text', 'Compound')
  })
})
