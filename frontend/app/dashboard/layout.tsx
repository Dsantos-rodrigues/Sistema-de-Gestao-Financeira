import { TopHeader } from "./_components/TopHeader";
import { TabsNav } from "./_components/TabsNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <TopHeader />
      <TabsNav />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
