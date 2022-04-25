describe('Footer', () => {

  beforeEach(function () {
    cy.visit('http://localhost:3000/')
  })

  it('footer contains page links', () => {
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

})