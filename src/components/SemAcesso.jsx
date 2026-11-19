import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SemAcesso({ naoEncontrado = false, titulo, texto }) {
  const tituloPadrao = naoEncontrado ? "Cadastro não encontrado" : "Você não pode editar este cadastro";
  const textoPadrao = naoEncontrado
    ? "Ele pode ter sido removido ou o link está errado."
    : "Só quem criou o cadastro (ou a administração do site) pode editá-lo.";
  return (
    <div className="rounded-2xl bg-card border border-border card-shadow p-8 text-center">
      <Lock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
      <h2 className="font-display font-700 text-xl mb-1">
        {titulo || tituloPadrao}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {texto || textoPadrao}
      </p>
      <Button asChild>
        <Link to="/painel">Ir para o meu painel</Link>
      </Button>
    </div>
  );
}
