
describe('Navigation to Mint Page', () => {

  beforeEach(function () {
    cy.visit('http://localhost:3000/mint-new')
  })

  it('verify mint page', () => {
    cy.url().should('include', '/mint-new')
    cy.contains('Mint')
    cy.contains('YB NFT Minting')
    cy.contains('.wizard-nav-item', '1')
    cy.contains('.wizard-nav-item', '2')
    cy.contains('.wizard-nav-item', '3')
  })

  it('wizard form navigation', () => {

    // navigate using nav
    cy.contains('.wizard-nav-item', '3')
      .click()
    cy.contains('Upload Artwork')
    cy.contains('.wizard-nav-item', '2')
      .click()
    cy.contains('Performance Fee')
    cy.contains('.wizard-nav-item', '1')
      .click()
    cy.contains('Composition')
    cy.contains('Weight')

    // navigate using next button
    cy.contains('NEXT STEP')
      .click()
    cy.contains('Performance Fee')
    cy.contains('NEXT STEP')
      .click()
    cy.contains('Upload Artwork')
  })

  it('wizard form1 - position item', () => {
    cy.contains('Add Position')
      .click()
    cy.get('.weight-input')
      .should('have.value', '1')
      .type('{backspace}')
      .should('have.value', '0')
      .type('0')
      .should('have.value', '0')
      .type('100')
      .should('have.value', '10')
    cy.get('.position-lock')
      .click()
    cy.get('.weight-input')
      .should('not.exist')
    cy.get('.position-delete')
      .click()
    cy.get('.position-delete')
      .should('not.exist')
  })

  it('wizard form1 - position list', () => {
    cy.contains('Add Position')
      .click()
    cy.contains('Add Position')
      .click()
    cy.contains('Add Position')
      .click()
    cy.contains('Add Position')
      .click()
    cy.get('.position-delete')
      .should('have.length', 4)

    cy.get('.position-delete')
      .eq(1)
      .click()
    cy.get('.position-delete')
      .should('have.length', 3)

    cy.get('.weight-input')
      .eq(0)
      .clear()
      .type('{rightArrow}24')
    cy.get('.weight-input')
      .eq(1)
      .clear()
      .type('{rightArrow}24')
    cy.get('.weight-input')
      .eq(2)
      .clear()
      .type('{rightArrow}24')
    cy.get('.summary-allocated-title')
      .should('have.text', '72%')
    cy.get('.summary-unallocated-title')
      .should('have.text', '28%')

    cy.get('.weight-input')
      .eq(2)
      .clear()
      .type('{rightArrow}99')
    cy.get('.summary-allocated-title')
      .should('have.text', '100%')
    cy.get('.summary-unallocated-title')
      .should('not.exist')


    // cy.get('.weight-input').should($input => {
    //   let count = 0

    //   $input.map((i, el) => {
    //     count++
    //   })

    //   expect(count).to.eq(3)
    // })
  })


})