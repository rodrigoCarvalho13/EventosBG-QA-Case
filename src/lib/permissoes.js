// Quem pode editar um cadastro (loja/espaço/grupo ou evento): quem criou ou o admin.
// O banco (RLS) já garante isso; aqui é para a tela não abrir o formulário à toa.
export function podeEditar(user, registro) {
  if (!user || !registro) return false;
  return user.role === "admin" || registro.created_by_id === user.id;
}
