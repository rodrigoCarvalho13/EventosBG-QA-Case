describe('check-enroll in an event', () => {
    it('should open an future available event', () => {
    //arrange
        cy.visit('http://localhost:5173/');
        cy.get('.grid-cols-5 > :nth-child(2) > .flex').click();
        cy.contains('Todos os próximos').click();
        cy.get('[data-testid="priceTag"]').eq(2).invoke('text').then((priceTag) => {
            cy.contains('Só pesadões').click();
            cy.contains(priceTag).should('be.visible');
        })
            
    })

    it('should correctly enroll in a future available event', () => {
    //mudança de dados necessária neste teste
    //arrange
        cy.visit('http://localhost:5173/');
        cy.get('.grid-cols-5 > :nth-child(2) > .flex').click();
        cy.contains('Todos os próximos').click();
        cy.get('[data-testid="priceTag"]').eq(2).invoke('text').then((priceTag) => {
            cy.contains('Só pesadões').click();
            cy.contains(priceTag).should('be.visible');
    
    //act
            cy.get('[data-testid="inputNome"]')
                .clear()
                .type('Fulano de Tal');
            
            cy.get('[data-testid="inputEmail"]')
                .clear()
                .type('fulanos@example.com');

            cy.get('[data-testid="inputPhone"]')
                .clear()
                .type('61 99999-9998');

            cy.get('[data-testid="SubmitButton"]').click({timeout:5000});

    //assert
            cy.contains('Inscrição confirmada!');
        })    
    })

    it.only('should incorrectly enroll in a future available event', () => {
    //mudança de dados necessária neste teste
    //arrange
        cy.visit('http://localhost:5173/');
        cy.get('.grid-cols-5 > :nth-child(2) > .flex').click();
        cy.contains('Todos os próximos').click();
        cy.get('[data-testid="priceTag"]').eq(2).invoke('text').then((priceTag) => {
            cy.contains('Só pesadões').click();
            cy.contains(priceTag).should('be.visible');
    
    //act
            cy.get('[data-testid="inputNome"]')
                .clear()
                .type('Cicrano de Tal');
            
            cy.get('[data-testid="inputEmail"]')
                .clear()
                .type('fulanos@.com');

            cy.get('[data-testid="inputPhone"]')
                .clear()
                .type('61 99999-9998');

            cy.get('[data-testid="SubmitButton"]').click({timeout:5000});

    //assert
            //cy.contains('Please enter an email adress.').should('be.visible');
        })    
    })
 })