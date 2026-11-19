describe('TC-09 - Account registration and recovery', () => {
    const loginUrl = 'http://localhost:5173/login'
    const registerUrl = 'http://localhost:5173/register'
    const forgotPasswordUrl = 'http://localhost:5173/forgot-password'

    it('should display the supported sign-in and account recovery options', () => {
        // arrange
        cy.visit(loginUrl)

        // assert
        cy.contains('h1', 'Bem-vindo(a) de volta').should('be.visible')
        cy.contains('button', 'Continuar com o Google').should('be.visible')
        cy.get('input#email').should('be.visible').and('have.attr', 'type', 'email')
        cy.get('input#password').should('be.visible').and('have.attr', 'type', 'password')
        cy.contains('button', 'Entrar').should('be.visible')
        cy.contains('a', 'Esqueceu a senha?')
            .should('be.visible')
            .and('have.attr', 'href', '/forgot-password')
        cy.contains('a', 'Criar conta')
            .should('be.visible')
            .and('have.attr', 'href', '/register')
    })

    it('should navigate from sign-in to account registration and back', () => {
        // arrange
        cy.visit(loginUrl)

        // act
        cy.contains('a', 'Criar conta').click()

        // assert
        cy.location('pathname').should('eq', '/register')
        cy.contains('h1', 'Crie sua conta').should('be.visible')
        cy.contains('button', 'Continuar com o Google').should('be.visible')
        cy.get('input#email').should('be.visible')
        cy.get('input#password').should('be.visible')
        cy.get('input#confirm').should('be.visible')

        // act
        cy.contains('a', 'Entrar').click()

        // assert
        cy.location('pathname').should('eq', '/login')
        cy.contains('h1', 'Bem-vindo(a) de volta').should('be.visible')
    })

    it('should prevent account registration when passwords do not match', () => {
        // arrange
        cy.visit(registerUrl)
        cy.get('input#email').type('tc09-password-mismatch@example.com')
        cy.get('input#password').type('ValidPassword123!')
        cy.get('input#confirm').type('DifferentPassword123!')

        // act
        cy.contains('button', 'Criar conta').click()

        // assert
        cy.contains('As senhas não conferem').should('be.visible')
        cy.contains('h1', 'Crie sua conta').should('be.visible')
        cy.get('input#email').should('have.value', 'tc09-password-mismatch@example.com')
    })




    it('should sign in with an approved email and password test account', function () {
        // arrange
        cy.env(['REGISTER_EMAIL', 'REGISTER_PASSWORD']).then(({ REGISTER_EMAIL, REGISTER_PASSWORD }) => {
        
        if (!REGISTER_EMAIL || !REGISTER_PASSWORD) {
            this.skip()
            return
        }

        cy.visit(loginUrl)
        cy.get('input#email').type(REGISTER_EMAIL)
        cy.get('input#password').type(REGISTER_PASSWORD)

        // act
        cy.contains('button', 'Entrar').click()

        // assert
        cy.location('pathname', { timeout: 15000 }).should('not.eq', '/login')
    })


    it.only('should display a neutral confirmation after requesting a password reset', function () {
        // arrange
        cy.env(['RECOVERY_EMAIL']).then(({ RECOVERY_EMAIL }) => {
        if (!RECOVERY_EMAIL) {
            this.skip()
        }

        cy.visit(forgotPasswordUrl)
        cy.get('input#email').type(recoveryEmail)

        // act
        cy.contains('button', 'Enviar link').click()

        // assert
        cy.contains(
            'Se existir uma conta com esse e-mail, você vai receber em instantes um link para redefinir a senha.'
        ).should('be.visible')
    })
    })


    it('should show the invalid-link state when the password reset token is missing', () => {
        // arrange
        cy.visit('http://localhost:5173/reset-password')

        // assert
        cy.contains('h1', 'Link inválido').should('be.visible')
        cy.contains('Este link de redefinição de senha está incompleto ou expirou').should('be.visible')
        cy.contains('a', 'Pedir um novo link')
            .should('be.visible')
            .and('have.attr', 'href', '/forgot-password')
    })

    it('should reject invalid sign-in credentials with visible feedback', function () {
        // arrange
        const invalidEmail = Cypress.env('TC09_INVALID_LOGIN_EMAIL')
        const invalidPassword = Cypress.env('TC09_INVALID_LOGIN_PASSWORD')
        if (!invalidEmail || !invalidPassword) {
            this.skip()
        }

        cy.visit(loginUrl)
        cy.get('input#email').type(invalidEmail)
        cy.get('input#password').type(invalidPassword)

        // act
        cy.contains('button', 'Entrar').click()

        // assert
        cy.get('[class*="bg-destructive/10"]')
            .should('be.visible')
            .and('not.be.empty')
        cy.location('pathname').should('eq', '/login')
    })

    it('should discard an expired session before opening the protected dashboard', () => {
        // arrange
        cy.visit('http://localhost:5173/painel', {
            onBeforeLoad: (window) => {
                window.localStorage.setItem('base44_access_token', 'expired-test-token')
            },
        })

        // assert
        cy.location('pathname', { timeout: 10000 }).should('eq', '/login')
        cy.contains('h1', 'Bem-vindo(a) de volta').should('be.visible')
    })
})

})
