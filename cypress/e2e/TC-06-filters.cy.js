describe('check filters in shops-groups', () => {
    it('should open shops page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/lojas"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })
    
    it('should filter a specific shop and open it', () => {
        //arrange
            cy.visit('http://localhost:5173/')
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/lojas"]').click()
            cy.url().should('eq', 'http://localhost:5173/lojas')

        //act
            cy.get('.sm\\:w-52').click();
            cy.contains('[role="option"]', 'Taguatinga Norte').click();
            cy.get('[data-testid="tituloLugar"]').first().invoke('text').then((lojaNome) => {
                cy.get('[data-testid="tituloLugar"]').first().click();

        //assert
            cy.get('.p-6 > .justify-between').first().should('contain.text', lojaNome);
            })
            
    })

    it('should open groups page', () => {
            //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/lojas?tipo=organizador"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')    
    })
    
    
    it.only('should filter a specific group and open it', () => {
        //arrange
            cy.visit('http://localhost:5173/')
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/lojas?tipo=organizador"]').click()
        //act
            cy.get('[data-testid="tituloLugar"]').first().invoke('text').then((grupoNome) => {
                cy.get('[data-testid="tituloLugar"]').first().click();

        //assert
         cy.get('.p-6 > .justify-between').first().should('contain.text', grupoNome);
            })
    })
})