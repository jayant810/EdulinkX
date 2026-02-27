import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MessageInterface } from "@/components/shared/MessageInterface";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";

const TeacherMessages = () => {
  const userInfo = useUserInfo();
  const { teacherLinks } = useSidebarLinks();

  return (
    <>
      <Helmet>
        <title>Messages - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={teacherLinks}
        userInfo={userInfo}
        title="Messages"
        subtitle="Communicate with students and staff"
      >
        <MessageInterface />
      </DashboardLayout>
    </>
  );
};

export default TeacherMessages;