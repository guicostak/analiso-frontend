import { ProtectedRoute } from "@/src/components/layout";
import { SecurityPage } from "@/src/features/perfil/components";

export default function PerfilSegurancaPage() {
  return (
    <ProtectedRoute>
      <SecurityPage />
    </ProtectedRoute>
  );
}
