import ClientAuthGate from '@/components/auth/ClientAuthGate';

export default function StudyMaterialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientAuthGate>
      {children}
    </ClientAuthGate>
  );
}
