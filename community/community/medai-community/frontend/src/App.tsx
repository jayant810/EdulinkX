import { Navigate, Route, Routes } from "react-router-dom";

import { CommunityHeader } from "./components/community/CommunityHeader";
import AdminCommunity from "./routes/AdminCommunity";
import AskQuestion from "./routes/AskQuestion";
import CommunityFeed from "./routes/CommunityFeed";
import CommunitySettings from "./routes/CommunitySettings";
import Leaderboard from "./routes/Leaderboard";
import QuestionDetail from "./routes/QuestionDetail";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CommunityHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/community" replace />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/community/ask" element={<AskQuestion />} />
          <Route path="/community/q/:slug" element={<QuestionDetail />} />
          <Route path="/community/leaderboard" element={<Leaderboard />} />
          <Route path="/settings/community" element={<CommunitySettings />} />
          <Route path="/admin/community" element={<AdminCommunity />} />
          <Route path="*" element={<Navigate to="/community" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
