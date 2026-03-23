import { ProtectedRoute } from "@/src/components/layout";
import { ProfilePage } from "@/src/features/perfil/components";

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
