import { ProtectedRoute } from "@/src/components/layout";
import { PreferencesPage } from "@/src/features/perfil/components";

export default function PerfilPreferenciasPage() {
  return (
    <ProtectedRoute>
      <PreferencesPage />
    </ProtectedRoute>
  );
}
