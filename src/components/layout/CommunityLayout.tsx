import { DashboardLayout } from "./DashboardLayout";

interface CommunityLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const CommunityLayout = ({ children, title, subtitle }: CommunityLayoutProps) => {
  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
    >
      {children}
    </DashboardLayout>
  );
};
