describe('basic-navigation', () => {
    it('should navigate through the initial page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.scrollTo('bottom', {duration:4000})
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
            
    })

    it('should navigate through calendar page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/eventos"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

    it('should navigate through materias page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/materias"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through stores page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/lojas"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through map page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/mapa"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through editors page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/lojas?tipo=editora"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through groups page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('#mobile-menu > .px-4 > .bg-accent').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through monitors page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/monitores"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through influencers page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/influencers"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through podcasts page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/podcasts"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through search page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/procuro"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through testers page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/testadores"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through launches page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/lancamentos"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through work page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/vagas"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through app page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/app"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })

        it('should navigate through about page', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get(".p-2\\.5").click()
            cy.get('.px-4 > [href="/sobre"]').click()
            cy.scrollTo('bottom', {duration:4000})           
        //assert
            cy.get('.mt-12 > .max-w-6xl').should('be.visible')
    })


        it('should navigate through the dashboard', () => {
        //arrange
            cy.visit('http://localhost:5173/')
        //act
            cy.get('.grid-cols-5 > :nth-child(1) > .flex').click()
            cy.get('.grid-cols-5 > :nth-child(2) > .flex').click()
            cy.get('.grid-cols-5 > :nth-child(3) > .flex').click()
            cy.get('.grid-cols-5 > :nth-child(4) > .flex').click()
            cy.get('.grid-cols-5 > :nth-child(5) > .flex').click()
        
        //assert
            cy.contains('Bem-vindo(a) de volta').should('be.visible')
    })
    
    
})