import { ProtectedRoute } from "@/src/components/layout";
import { ProfilePage } from "@/src/features/perfil/components";

export default function PerfilSegurancaPage() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
