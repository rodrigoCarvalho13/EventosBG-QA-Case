describe('info-comparison', () => {
    it('open an event from the initial page ', () => {
    //arrange
        cy.visit('http://localhost:5173/');
        cy.get('.grid-cols-1').first().scrollIntoView();

    //act&assert
        cy.get('[data-testid="eventoTitulo"]').first().invoke('text').then((tituloOriginal) => {
        // Normaliza o texto para o padrão de URL (minúsculas, sem acentos e com hífens nos espaços)
        const slugEsperado = tituloOriginal
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[()]/g, '')            // remove parênteses
            .replace(/\s+/g, '-');           // Substitui espaços por hífens

        cy.get('[data-testid="eventoTitulo"]').first().click()

        cy.url().should('include', slugEsperado);
                })
    })

    it('compare events info from the initial page', () => {
    //arrange
        cy.visit('http://localhost:5173/');
        cy.get('.grid-cols-1').first().scrollIntoView();
    //act&assert    
        cy.get('[data-testid="eventoTitulo"]').first().invoke('text').then((tituloOriginal) => {
        const slugEsperado = tituloOriginal.trim()
            cy.get('[data-testid="localCardTest"]').first().invoke('text').then((localOriginal) => {const localLimpo = localOriginal.trim();
                cy.get('[data-testid="horaCardTest"]').first().invoke('text').then((horaOriginal) => {const horarioLimpo = horaOriginal.trim();
                    cy.get('[data-testid="eventoTitulo"]').first().click({timeout: 5000})

                    cy.contains(tituloOriginal).should('be.visible');
                    cy.contains(localLimpo).should('be.visible');
                    cy.contains(horarioLimpo).should('be.visible');
                })
            })
        })
    })    
    
    
    it('compare events info from the calendar page', () => {
    //arrange
        cy.visit('http://localhost:5173/');
        cy.get('.grid-cols-5 > :nth-child(2) > .flex').click({timeout: 5000});
        cy.get('[data-testid^="calendarioCell-"]').eq(3).click();
        cy.get('[data-testid="data-final"]').first().scrollIntoView({duration: 2000});
    //act
        cy.get('.flex-1 > .font-display').first().invoke('text').then((slugEsperado) => {const tituloOriginal = slugEsperado.trim();
            cy.get('.mt-1 > :nth-child(1)').first().invoke('text').then((localEsperado) => {const localOriginal = localEsperado.trim();
                cy.get('.mt-1 > .truncate').first().invoke('text').then((horaEsperada) => {const horarioOriginal = horaEsperada.trim();
                    cy.get('.mt-6').first().click();
    //assert
                    cy.contains(tituloOriginal).should('be.visible');
                    cy.contains(localOriginal).should('be.visible');
                    cy.contains(horarioOriginal).should('be.visible');
                })
            })
        })
    })
    
    
    it('open an invalid event', () => {
    //arrange
        cy.visit('http://localhost:5173/');
        cy.get('.grid-cols-5 > :nth-child(2) > .flex').click({timeout: 5000});
        cy.get('[data-testid^="calendarioCell-"]').eq(1).click();
        cy.get('[data-testid="data-final"]').first().scrollIntoView({duration: 2000});
    //act
        cy.contains('Nenhuma programação neste dia.').should('be.visible');
    })
})