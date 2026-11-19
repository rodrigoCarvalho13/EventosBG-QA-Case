describe('cards-info-check', () => {
  it('open a card and validate information', () => {
    // arrange
    cy.visit('http://localhost:5173/')

    // act
    cy.get('[data-testid="eventoCard2"] > .press').scrollIntoView()

      
      cy.get('[data-testid="tituloCardTest"]}')
        .invoke('text')
        .then((texto) => {
          cy.wrap(texto.trim()).as('tituloCard')
        })


      cy.get('[data-testid="horaCardTest"]}')
        .invoke('text')
        .then((texto) => {
          cy.wrap(texto.trim()).as('horaCard')
        })

      cy.get('[data-testid="localCardTest"]}')
        .invoke('text')
        .then((texto) => {
          cy.wrap(texto.trim()).as('localCard')
        })

      
        cy.get('[data-testid="eventoCard2"] > .press').click()



    // assert - Validar múltiplos elementos recuperados
    cy.get('@tituloCard').then((tituloCard) => {
      cy.get('@horaCard').then((horaCard) => {
        cy.get('@localCard').then((localCard) => {
          
          // Verifica se a página de detalhes contém as informações do card
          cy.get('#main-content').should('contain.text', tituloCard)
          cy.get('#main-content').should('contain.text', horaCard)
          cy.get('#main-content').should('contain.text', localCard)

        })

        })
      })
    })
  })
