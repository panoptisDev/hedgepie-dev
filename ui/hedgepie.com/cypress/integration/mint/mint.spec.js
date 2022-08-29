
describe('Mint Page', () => {

  beforeEach(function () {
    cy.visit('http://localhost:3000/mint-new')
  })

  it('mint page has proper url', () => {
    cy.url().should('include', '/mint-new')
  })

  it('mint page has "Mint"', () => {
    cy.contains('Mint')
  })

  it('mint page has wizard navigation', () => {
    cy.contains('.wizard-nav-item', '1')
    cy.contains('.wizard-nav-item', '2')
    cy.contains('.wizard-nav-item', '3')
  })

  it('wizard form navigation by nav', () => {
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
  })

  it('wizard form navigation by next button', () => {
    cy.contains('NEXT STEP')
      .click()
    cy.contains('Performance Fee')
    cy.contains('NEXT STEP')
      .click()
    cy.contains('Upload Artwork')
  })

  it('wizard form1 - position item (composition menu)', () => {
    cy.contains('Add Position')
      .click()

    cy.get('.select__control')
      .click()
    cy.contains('Pancakeswap (Cake)')
      .click()
    cy.get('.select__value-container')
      .find('img')
      .should('have.attr', 'src')
      .should('include', 'token-cake')

    cy.get('.select__control')
      .click()
    cy.contains('Venus (XVS)')
      .click()
    cy.get('.select__value-container')
      .find('img')
      .should('have.attr', 'src')
      .should('include', 'token-xvs')
  })

  it('wizard form1 - position weight editable, >=0, <100', () => {
    cy.contains('Add Position')
      .click()
    cy.get('.weight-input')
      .should('have.value', '1')
      .clear()
      .should('have.value', '0')
      .type('0')
      .should('have.value', '0')
      .type('100')
      .should('have.value', '10')
      .clear()
      .type('{rightArrow}')
      .type('-10')
      .should('have.value', '0')
  })

  it('wizard form1 - position lock/unlock', () => {
    cy.contains('Add Position')
      .click()
    cy.get('.position-lock')
      .click()
    cy.get('.weight-input')
      .should('not.exist')
    cy.get('.position-lock')
      .click()
    cy.get('.weight-input')
      .should('be.exist')
  })

  it('wizard form1 - position remove', () => {
    cy.contains('Add Position')
      .click()
    cy.get('.position-delete')
      .click()
    cy.get('.position-delete')
      .should('not.exist')
  })

  it('wizard form1 - position list add, remove', () => {
    cy.contains('Add Position')
      .click()
      .click()
      .click()
      .click()

    cy.get('.position-delete')
      .should('have.length', 4)

    cy.get('.position-delete')
      .eq(1)
      .click()
    cy.get('.position-delete')
      .should('have.length', 3)
  })

  it('wizard form1 - position list - allocated sum', () => {
    cy.contains('Add Position')
      .click()
      .click()
      .click()

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

  })

  it('wizard form2 - performance fee editable', () => {
    cy.contains('.wizard-nav-item', '2')
      .click()
    cy.get('.performance-input')
      .clear()
      .should('have.value', '0')
      .type('0')
      .should('have.value', '0')
      .type('100')
      .should('have.value', '10')
  })

  it('wizard form3 - default summary', () => {
    cy.contains('.wizard-nav-item', '3')
      .click()
    cy.get('.summary-artwork-status')
      .should('have.text', 'Not set')
    cy.get('img.artwork-empty')
      .should('exist')
    cy.get('img.artwork-set')
      .should('not.exist')
  })

  it('wizard form3 - upload artwork, summary update', () => {
    cy.contains('.wizard-nav-item', '3')
      .click()

    cy.get('.artwork-file-input')
      .selectFile('public/images/nft.png')
    cy.get('.summary-artwork-status')
      .should('have.text', 'Set')
    cy.get('img.artwork-empty')
      .should('not.exist')
    cy.get('img.artwork-set')
      .should('exist')
  })

  it('wizard form3 - nft name editable', () => {
    cy.contains('.wizard-nav-item', '3')
      .click()

    cy.contains('NFT Name')
    cy.get('.nft-name-input')
      .type('my nft')
      .should('have.value', 'my nft')
      .clear()
      .should('have.value', '')
  })

})