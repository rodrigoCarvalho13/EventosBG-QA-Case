describe('calendar-exploration', () => {
    it('should open the calendar and check the day', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/eventos"]').click()

            //Gera a data atual no formato padrão brasileiro (ex: "22/10/2026")
            const dataAtualReal = new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',  // Ex: "quinta-feira"
            day: 'numeric',   // Ex: "22"
            month: 'long'     // Ex: "outubro"
            });

            cy.get('[data-testid="data-final"]')
            .invoke('text')
            .then((textoElemento) => {
                expect(textoElemento.trim().toLowerCase()).to.equal(dataAtualReal);
            });
        })


    it('should check the active day in the grid', () => {
        //arrange
            cy.visit('http://localhost:5173/')
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/eventos"]').click({timeout: 4000})
        const dataDeHoje = new Date().getDate().toString();
        //act
            cy.get('[data-testid="calendarioGrid"]')
            .find('.bg-accent')
        //assert
            .should('contain.text', dataDeHoje)
            .and('be.visible');
    })


    it.only('should see past events', () => {
        //arrange
            cy.visit('http://localhost:5173/')
            cy.get('.grid-cols-5 > :nth-child(2) > .flex').click({timeout: 4000})
        //act
            cy.contains('Passados').click()
        //assert
            cy.get('[data-testid="eventoTitulo"]').should('be.visible')
    })
    
    it('should manipulate filters (to regular event)', () => {
        //arrange
            cy.visit('http://localhost:5173/')
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/eventos"]').click({timeout: 4000})
        //act
            cy.contains('Este mês').click()
            cy.get('[aria-controls="radix-:r7:"]').click()
            cy.get('[data-testid="todasemana"]').click()
            
            cy.get('[aria-controls="radix-:r8:"]').click()
            cy.contains('[role="option"]', 'Asa Sul').click()
            cy.get('.md\\:grid-cols-2').scrollIntoView({timeout: 4000})
        //assert
            cy.get(`[data-testid="eventoTitulo"]`).should('be.visible');
            
    })

    it('should manipulate filters (to special event)', () => {
        //arrange
            cy.visit('http://localhost:5173/')
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/eventos"]').click({timeout: 4000})
        //act
            cy.contains('Todos os próximos').click()
            cy.get('[aria-controls="radix-:r7:"]').click()
            cy.get('[data-testid="eventosespeciais"]').click()

            cy.get('[aria-controls="radix-:r8:"]').click()
            cy.contains('[role="option"]', 'Asa Norte').click()
            cy.get('.md\\:grid-cols-2').scrollIntoView({timeout: 4000})
        //assert
            cy.get(`[data-testid="eventoTitulo"]`).should('be.visible');
        })

    it('should manipulate filters (to non-existent event)', () => {
        //arrange
            cy.visit('http://localhost:5173/')
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/eventos"]').click({timeout: 4000})
        //act
            cy.contains('Todos os próximos').click()
            cy.get('[aria-controls="radix-:r7:"]').click()
            cy.get('[data-testid="eventosespeciais"]').click()

            cy.get('[aria-controls="radix-:r8:"]').click()
            cy.contains('[role="option"]', 'Aguas Claras').click()

            cy.get('.sm\\:w-44').click()
            cy.contains('[role="option"]', 'Pesado').click();
        //assert
            cy.get(`[data-testid="eventoTitulo"]`).should('not.exist')
        })

})