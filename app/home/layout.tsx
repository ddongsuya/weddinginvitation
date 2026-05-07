import { NavShell } from "../components-home/NavShell";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground">
      <NavShell>{children}</NavShell>
    </div>
  );
}
