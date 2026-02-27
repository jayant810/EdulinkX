import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MessageInterface } from "@/components/shared/MessageInterface";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";

const StudentMessages = () => {
  const { userInfo } = useUserInfo();
  const { studentLinks } = useSidebarLinks();

  return (
    <>
      <Helmet>
        <title>Messages - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={studentLinks}
        userInfo={userInfo}
        title="Messages"
        subtitle="Communicate with faculty and students"
      >
        <MessageInterface />
      </DashboardLayout>
    </>
  );
};

export default StudentMessages;