import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileDown, Send, CheckCircle2, Sparkles, Brain, HelpCircle, Clock } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const StudentCoursePlayer = () => {
  const { courseId } = useParams();
  const { token } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSecondRef = useRef<number>(-1);
  const isSeekingRef = useRef<boolean>(false);
  
  const [lectures, setLectures] = useState<any[]>([]);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [chat, setChat] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Interactive State
  const [currentInteraction, setCurrentInteraction] = useState<any>(null);
  const [completedInteractions, setCompletedInteractions] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState(0);

  const fetchLectures = () => {
    if (!token) return;
    fetch(`${API_BASE}/api/student/course/${courseId}/lectures`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const lectureList = data.lectures || [];
        setLectures(lectureList);
        if (lectureList.length > 0) {
          if (activeLecture) {
            const updated = lectureList.find((l: any) => l.lecture_id === activeLecture.lecture_id);
            if (updated) setActiveLecture(updated);
          } else {
            setActiveLecture(lectureList[0]);
          }
        }
      });
  };

  useEffect(() => {
    fetchLectures();
  }, [courseId, token]);

  useEffect(() => {
    setShowSummary(false);
    setCurrentInteraction(null);
    lastSecondRef.current = -1;
    if (activeLecture) {
      setCompletedInteractions(activeLecture.answered_interactions || []);
    }
  }, [activeLecture]);

  const markCompleted = () => {
    if (!activeLecture) return;
    fetch(`${API_BASE}/api/student/lecture/${activeLecture.lecture_id}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Lecture marked as completed!");
  };

  const generateAISummary = async () => {
    if (!activeLecture) return;
    setIsGeneratingSummary(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: activeLecture.title, description: activeLecture.sub_title })
      });
      
      if (!res.ok) throw new Error("Failed to generate");
      
      const data = await res.json();
      
      if (data.summary) {
        await fetch(`${API_BASE}/api/student/lecture/${activeLecture.lecture_id}/summary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ summary: data.summary })
        });
        
        toast.success("AI Summary generated!");
        fetchLectures(); 
        setShowSummary(true);
      }
    } catch (err) {
      toast.error("AI Summary currently unavailable. Try again later.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeLecture?.is_interactive || currentInteraction || isSeekingRef.current) return;
    
    const currentTime = Math.floor(videoRef.current.currentTime);
    if (currentTime === lastSecondRef.current) return;
    lastSecondRef.current = currentTime;

    const list = interactionsList();
    const interaction = list.find((i: any) => i.time === currentTime);
    
    // Auto-show ONLY if not previously answered
    if (interaction && !completedInteractions.includes(currentTime)) {
      videoRef.current.pause();
      setCurrentInteraction(interaction);
    }
  };

  const submitAnswer = async () => {
    const time = currentInteraction.time;
    if (selectedOption === String(currentInteraction.correct)) {
      toast.success("Correct answer!");
    } else {
      toast.error("Incorrect answer.");
    }
    
    if (!completedInteractions.includes(time)) {
      try {
        await fetch(`${API_BASE}/api/student/lecture/${activeLecture.lecture_id}/interaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ time })
        });
        setCompletedInteractions(prev => [...prev, time]);
      } catch (err) {
        console.error(err);
      }
    }
    
    setCurrentInteraction(null);
    setSelectedOption("");
    videoRef.current?.play();
  };

  const jumpToInteraction = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.pause();
      const list = interactionsList();
      const interaction = list.find((i: any) => i.time === time);
      if (interaction) {
        lastSecondRef.current = time;
        setCurrentInteraction(interaction);
      }
    }
  };

  const getVideoSrc = (lecture: any) => {
    if (!lecture) return "";
    return lecture.video_type === 'local' ? `${API_BASE}${lecture.video_url}` : lecture.video_url;
  };

  const interactionsList = () => {
    let interactions = activeLecture?.interactions;
    if (typeof interactions === 'string') {
      try { interactions = JSON.parse(interactions); } catch (e) { return []; }
    }
    return Array.isArray(interactions) ? interactions : [];
  };

  return (
    <>
      <Helmet>
        <title>Course Player - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title={activeLecture?.title || "Course Player"}
        subtitle={activeLecture?.sub_title || ""}
      >
        <div className="grid lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

          {/* LEFT: VIDEO PLAYER & SUMMARY */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden relative shadow-xl border-none bg-black">
              <CardContent className="p-0 relative">
                {activeLecture && (
                  <div className="relative group aspect-video">
                    <video
                      ref={videoRef}
                      controls
                      className="w-full h-full"
                      src={getVideoSrc(activeLecture)}
                      onEnded={markCompleted}
                      onTimeUpdate={handleTimeUpdate}
                      onSeeking={() => isSeekingRef.current = true}
                      onSeeked={() => isSeekingRef.current = false}
                      onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                    />

                    {/* TIMELINE DOTS OVERLAY */}
                    {videoDuration > 0 && (
                      <div className="absolute bottom-[45px] left-0 right-0 px-[12px] h-3 pointer-events-none flex items-center">
                        <div className="relative w-full h-full">
                          {interactionsList().map((inter: any, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                jumpToInteraction(inter.time);
                              }}
                              className={`absolute w-3.5 h-3.5 border-2 border-white rounded-full -translate-x-1/2 cursor-pointer pointer-events-auto hover:scale-150 transition-all shadow-lg z-40 ${completedInteractions.includes(inter.time) ? 'bg-success' : 'bg-accent'}`}
                              style={{ left: `${(inter.time / videoDuration) * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE OVERLAY */}
                    {currentInteraction && (
                      <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in duration-300">
                        <Card className="w-full max-w-md border-primary/20 shadow-2xl">
                          <CardHeader className="bg-primary/5 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 font-display">
                              <Brain className="h-5 w-5 text-primary" />
                              Knowledge Check
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-6">
                            <p className="font-bold text-lg leading-tight">{currentInteraction.question}</p>
                            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="gap-3">
                              {currentInteraction.options.map((opt: string, idx: number) => (
                                <div key={idx} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${selectedOption === String(idx) ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted'}`}>
                                  <RadioGroupItem value={String(idx)} id={`opt-${idx}`} />
                                  <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-medium">{opt}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" className="flex-1" onClick={() => { setCurrentInteraction(null); videoRef.current?.play(); }}>Close</Button>
                              <Button className="flex-[2] h-12" onClick={submitAnswer} disabled={selectedOption === ""}>
                                {completedInteractions.includes(currentInteraction.time) ? "Verify Again" : "Submit & Continue"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-4 flex justify-between items-center bg-card border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Badge className="px-3 py-1 bg-primary text-primary-foreground">Lecture</Badge>
                    {activeLecture?.is_interactive && (
                      <Badge variant="accent" className="flex items-center gap-1">
                        <HelpCircle className="h-3 w-3" /> {interactionsList().length} Points
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {/* ALWAYS SHOW BUTTON IF LECTURE EXISTS */}
                    {activeLecture && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        disabled={isGeneratingSummary}
                        onClick={() => {
                          if (!activeLecture?.ai_summary) {
                            generateAISummary();
                          } else {
                            setShowSummary(!showSummary);
                          }
                        }}
                        className={`bg-accent/10 text-accent hover:bg-accent/20 border-none transition-all ${showSummary ? 'ring-2 ring-accent/50 shadow-md' : ''}`}
                      >
                        {isGeneratingSummary ? (
                          <Clock className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-1" />
                        )}
                        {!activeLecture?.ai_summary ? "Generate AI Summary" : (showSummary ? "Hide Summary" : "View AI Summary")}
                      </Button>
                    )}
                    {activeLecture?.notes_url && (
                      <Button variant="outline" size="sm" onClick={() => window.open(activeLecture.notes_url)}>
                        <FileDown className="h-4 w-4 mr-1" /> Notes
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI SUMMARY BOX */}
            {showSummary && (
              <Card className="border-l-4 border-l-accent bg-accent/5 overflow-hidden animate-in slide-in-from-top duration-300 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-accent">
                    <Sparkles className="h-4 w-4" /> AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap italic">
                    {activeLecture?.ai_summary ? `"${activeLecture.ai_summary}"` : "Generating AI summary..."}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ask a Doubt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Is there something you didn't understand? Ask the AI or Teacher..."
                  value={chat}
                  onChange={(e)=>setChat(e.target.value)}
                  className="min-h-[100px] resize-none focus-visible:ring-primary"
                />
                <div className="flex justify-end">
                  <Button className="px-8 shadow-lg hover:shadow-xl transition-all">
                    <Send className="h-4 w-4 mr-2" />
                    Send Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: LECTURE SELECTOR */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-lg">Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[70vh] overflow-y-auto divide-y">
                  {lectures.map((l, idx) => (
                    <div
                      key={l.lecture_id}
                      onClick={() => setActiveLecture(l)}
                      className={`p-4 cursor-pointer transition-all flex items-center gap-4 group ${
                        activeLecture?.lecture_id === l.lecture_id
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${l.completed ? 'bg-success/20 text-success' : (activeLecture?.lecture_id === l.lecture_id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}`}>
                        {l.completed ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${activeLecture?.lecture_id === l.lecture_id ? 'text-primary' : 'text-foreground'}`}>{l.title}</p>
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{l.sub_title || 'No description'}</p>
                      </div>
                      {l.is_interactive && <Brain className="h-4 w-4 text-accent animate-pulse" title="Interactive Video" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentCoursePlayer;
