describe('explore influencers and videos', () => {
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




    it('should open a video', () => {
        //arrange
        cy.visit('http://localhost:5173/')
        cy.get(".p-2\\.5").click()
        cy.get('.px-4 > [href="/influencers"]').click()

        //act
        cy.get(':nth-child(1) > div.relative > .group > .absolute.grid').first().scrollIntoView().click()

        //assert
        cy.get('.aspect-\\[9\\/16\\] > .w-full').should('be.visible')

    })
    
    
    it('should open a influencer profile', () => {
        //arrange
        cy.visit('http://localhost:5173/')
        cy.get(".p-2\\.5").click()
        cy.get('.px-4 > [href="/influencers"]').click()

        //act
        cy.get('.shrink-0 > .group').first().invoke("text").then((influencerName) => {
            cy.get('.shrink-0 > .group').first().click()

        //assert
            cy.get('.bg-board > .relative').should('contain.text', influencerName)
        })
    })
})