describe('Header', () => {

  beforeEach(function () {
    cy.visit('http://localhost:3000/')
  })

  it('header contains logo links', () => {
    cy.get('.header .logo')
      .invoke('attr', 'href')
      .should('eq', '/')
    cy.get('.header .logo img')
      .invoke('attr', 'src')
      .should('eq', '/images/logo.png')
  })

  it('header contains page links', () => {
    cy.get('.header')
      .contains('Vault')
      .invoke('attr', 'href')
      .should('eq', '/vault')

    cy.get('.header')
      .contains('Leaderboard')
      .invoke('attr', 'href')
      .should('eq', '/nft-leaderboard')

    cy.get('.header')
      .contains('Mint')
      .invoke('attr', 'href')
      .should('eq', '/mint')
  })

  it('header contains connect wallet', () => {

    cy.get('.header')
      .contains('Connect Wallet')

  })

})