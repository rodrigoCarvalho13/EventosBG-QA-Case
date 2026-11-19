describe('do all registration types', () => {
//EACH TEST SHOULD HAVE DIFFERENT INFORMATION EDITED MANUALLY FOR EACH TEST SESSION
it('should register a store', () => {
    //arrange
    cy.visit('http://localhost:5173/')
    cy.get('.grid-cols-5 > :nth-child(3) > .flex').click()
    cy.get('[href="/login?returnTo=%2Fpainel%2Flojas%2Fnova%3Ftipo%3Dloja"]').click();
    cy.get(':nth-child(1) > .relative').type('gatesip667@macsnipe.com') //disposable email
    cy.get(':nth-child(2) > .relative').eq(1).type('@tester123') //password
    cy.get('.space-y-4 > .inline-flex').click({timeout: 50000})

    //act
    cy.get('#lj-nome').type('Loja Teste Dois')
    cy.get('#lj-desc').type('Lorem Ipsum dolor sit amet, consectetur adipiscing elit.');
    cy.get('#lj-acervo').type('Catan, Ticket to Ride, Carcassonne, Pandemic, Splendor, 7 Wonders, Terraforming Mars, Gloomhaven, Wingspan, Arkham Horror, etc');
    cy.get('#\\:r3\\:-campo').type('jogos, tabuleiro, boardgames, família, coup,')
    cy.get('#lj-endereco').type('Rua Teste, 456')
    cy.get('#lj-bairro').type('Bairro Whatever dois')
    cy.get('#lj-telefone').type('(11) 99999-9999')
    cy.get('#lj-email').type('lojatestesdois@exemplo.com')
    cy.get('#lj-website').type('https://www.lojatestesdois.com')
    cy.get('#lj-insta').type('@lojatestesdois')
    cy.get('.sticky > .inline-flex').click({timeout: 10000})

    //assert
    cy.get('.justify-between > :nth-child(1) > .font-display').should('contain.text', 'Loja Teste Dois')
    cy.get('.justify-between > :nth-child(1) > .flex').should('contain.text', 'Bairro Whatever dois')
    })
   
    



it('should register a group', () => {
    //arrange
    cy.visit('http://localhost:5173/');
    cy.get('.grid-cols-5 > :nth-child(3) > .flex').click();
    cy.get('[href="/login?returnTo=%2Fpainel%2Flojas%2Fnova%3Ftipo%3Dorganizador"] > .mt-5').click();
    cy.get(':nth-child(1) > .relative').type('gatesip667@macsnipe.com') //disposable email
    cy.get(':nth-child(2) > .relative').eq(1).type('@tester123') //password
    cy.get('.space-y-4 > .inline-flex').click({timeout: 50000})

    //act
    cy.get('#lj-nome').type('Grupo Teste Um')
    cy.get('#lj-desc').type('Group - Lorem Ipsum dolor sit amet, consectetur adipiscing elit.');
    cy.get('#\\:r3\\:-campo').type('jogos, pesados, party, RPG, TCG,')
    cy.get('#lj-email').type('grupoum@exemplo.com')
    cy.get('#lj-insta').type('@grupoum')
    cy.get('.sticky > .inline-flex').click({timeout: 10000})

    //assert
    cy.get('.justify-between > :nth-child(1) > .font-display').should('contain.text', 'Grupo Teste Um')
    cy.get('.grid > .flex > .text-sm').should('contain.text', 'grupoum@exemplo.com')
    })
    
    
    
    
it('should register an editor', () => {
    //arrange
    cy.visit('http://localhost:5173/');
    cy.get('.grid-cols-5 > :nth-child(3) > .flex').click();
    cy.contains('Minha editora').scrollIntoView();
    cy.get('[href="/login?returnTo=%2Fpainel%2Flojas%2Fnova%3Ftipo%3Deditora"]').click();
    cy.get(':nth-child(1) > .relative').type('gatesip667@macsnipe.com') //disposable email
    cy.get(':nth-child(2) > .relative').eq(1).type('@tester123') //password
    cy.get('.space-y-4 > .inline-flex').click({timeout: 50000})    

    //act
    cy.get('#lj-nome').type('Editora Teste Um')
    cy.get('#lj-desc').type('Editora Lorem Ipsum dolor sit amet, consectetur adipiscing elit.');
    cy.get('#\\:r3\\:-campo').type('jogos, tabuleiro, store, venda, lançamentos,')
    cy.get('#lj-endereco').type('Rua Teste, 789')
    cy.get('#lj-bairro').type('Bairro Whatever tres')
    cy.get('#lj-telefone').type('(11) 8888-8888')
    cy.get('#lj-email').type('editoratesteum@exemplo.com')
    cy.get('#lj-website').type('https://www.edtesteum.com')
    cy.get('#lj-insta').type('@editoratesteum')
    cy.get('.sticky > .inline-flex').click({timeout: 10000})

    //assert
    cy.get('.justify-between > :nth-child(1) > .font-display').should('contain.text', 'Editora Teste Um')
    cy.get('.grid > .flex > .text-sm').should('contain.text', 'editoratesteum@exemplo.com')
})
    




it('should register an event', () => {
    //arrange
    cy.visit('http://localhost:5173/');
    cy.get('.grid-cols-5 > :nth-child(3) > .flex').click();
    cy.get('[href="/login?returnTo=%2Fpainel%2Feventos%2Fnovo"]').click();
    cy.get(':nth-child(1) > .relative').type('gatesip667@macsnipe.com') //disposable email
    cy.get(':nth-child(2) > .relative').eq(1).type('@tester123') //password
    cy.get('.space-y-4 > .inline-flex').click({timeout: 50000})

    //act
    cy.get('#ev-title').type('Evento Teste Um')
    cy.get('#ev-dia').click();
    cy.get('[role="option"]').contains('Domingo').click();
    cy.get('#ev-loja').click();
    cy.get('[role="option"]').contains('Loja Teste Um').click();
    cy.get('#ev-desc').type('EVENTO UM Lorem Ipsum dolor sit amet, consectetur adipiscing elit.');
    cy.get('#\\:ra\\:-campo').type('jogos, tabuleiro, boardgames, encontro, evento,')
    cy.get('#ev-insta').type('@eventoum')
    cy.get(':nth-child(5) > .space-y-3 > :nth-child(1) > .grid > .border-border').click();
    cy.get('.sticky > .flex > .hidden').click()

    //assert
    cy.get('.justify-between > :nth-child(1) > .font-display').should('contain.text', 'Evento Teste Um')
})




it('should register an influencer', () => {
    //arrange
    cy.visit('http://localhost:5173/')
    cy.get(".p-2\\.5").click()
    cy.get('.px-4 > [href="/influencers"]').click()
    cy.get('.pt-10 > .inline-flex').first().click()
    cy.get(':nth-child(1) > .relative').type('gatesip667@macsnipe.com') //disposable email
    cy.get(':nth-child(2) > .relative').eq(1).type('@tester123') //password
    cy.get('.space-y-4 > .inline-flex').click().wait(5000);

    //act
    cy.get('#cr-nome').clear().type('Influencer Teste Um')
    cy.get('#cr-bio').type('Bio descrição lorem ipsum dolor sit amet, consectetur adipiscing elit.')
    cy.get('.peer').click()
    cy.get('#cr-instagram').type('@oneinfluencer')
    cy.get('#cr-youtube').type('https://www.youtube.com/channel/oneinfluencer')
    cy.get('#cr-tiktok').type('@oneinfluencer')
    cy.get('.space-y-5 > .max-w-full').click();

    //noassert

})


it('should register a monitor', () => {
    //arrange
    cy.visit('http://localhost:5173/')
    cy.get(".p-2\\.5").click()
    cy.get('.px-4 > [href="/monitores"]').click().wait(3000)
    cy.get('.sm\\:flex-row > .inline-flex').first().click()
    cy.get(':nth-child(1) > .relative').type('gatesip667@macsnipe.com') //disposable email
    cy.get(':nth-child(2) > .relative').eq(1).type('@tester123') //password
    cy.get('.space-y-4 > .inline-flex').click().wait(5000);

    //act
    cy.get('#monitor-nome').clear().type('Monitor Teste Um')
    cy.get('#monitor-idade').clear().type('30')
    cy.get('#\\:r5\\:-campo').type('party games, coop, deckbuilding, eurogames, pesados, cozy games,')
    cy.get('#monitor-bio').type('Bio descrição de monitor 1 lorem ipsum dolor sit amet, consectetur adipiscing elit.')
    cy.get('#monitor-jogos').type('Catan, Ticket to Ride, Carcassonne, Pandemic, Splendor, 7 Wonders, Terraforming Mars, Gloomhaven, Wingspan, Arkham Horror')
    cy.get('#monitor-acervo').type('150')
    cy.get('#monitor-servicos').type('feira, evento, loja, demonstração, campeonato, etc,')
    cy.get('#monitor-eventos').type('Todos')
    cy.get('#preco-hora').type('R$ 100,00')
    cy.get('#monitor-zap').type('619 9292-9292')
    cy.get('#monitor-ig').type('@onemonitor')
    cy.get('#monitor-email').clear().type('onemonitor@teste.com')
    cy.contains('Salvar perfil').click()

    //noassert
})
})