import React from "react";

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-md w-full p-8 bg-card rounded-2xl card-shadow border border-border text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-accent/25 text-accent-ink">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="font-display font-700 text-3xl mb-4">Acesso restrito</h1>
        <p className="text-muted-foreground mb-8">
          Sua conta não tem acesso a este site. Fale com o administrador para pedir acesso.
        </p>
        <div className="p-4 bg-muted rounded-xl text-sm text-left text-foreground">
          <p className="font-600">Se acha que é um engano, você pode:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Conferir se entrou com a conta certa</li>
            <li>Pedir acesso ao administrador</li>
            <li>Sair e entrar de novo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
