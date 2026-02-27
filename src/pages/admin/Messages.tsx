import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MessageInterface } from "@/components/shared/MessageInterface";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";

const AdminMessages = () => {
  const userInfo = useUserInfo();
  const { adminLinks } = useSidebarLinks();

  return (
    <>
      <Helmet>
        <title>Messages - EdulinkX Admin</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={adminLinks}
        userInfo={userInfo}
        title="Messages"
        subtitle="Manage communication across the institution"
      >
        <MessageInterface />
      </DashboardLayout>
    </>
  );
};

export default AdminMessages;
