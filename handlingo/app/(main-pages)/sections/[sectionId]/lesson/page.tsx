"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Layout from '@/components/ui/layout'; 
import CameraFeed from "@/components/client/CameraFeed";
import VideoPlayer from "@/components/ui/lessonVid";
// make a list that counts through the questions once we've hit the last one 
// display "congrats you finished the lesson" and give points

const QuestionPage = () => {

  // not sure what this does
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // set up structure of question
  type Question = {
    title: string;
    header: string;
    description: string;
    correct_answer: string;
  };
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [pointsAwarded, setPointsAwarded]= useState(false);
  const [videoUrl, setVideoUrl] = useState("")
  // keeps track of what question the user is on by parsing the url
  const questionNumber = parseInt(searchParams.get("q") || "1", 10);

  useEffect(() => {
    if (!params.sectionId) return;
  
    const fetchData = async () => {
      try {
        // fetch question and video in parallel
        const [questionRes, videoRes] = await Promise.all([
          fetch(`/api/section/${params.sectionId}/${questionNumber}`),
          fetch(`/api/lessonVids/${params.sectionId}/${questionNumber}`)
        ]);
  
        const questionData = await questionRes.json();
        const videoData = await videoRes.json();
  
        if (!questionRes.ok) throw new Error(questionData.error);
        if (!videoRes.ok) throw new Error(videoData.error);
  
        setQuestion(questionData.question);
        setVideoUrl(videoData.lessonVid);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // only after both fetches complete
      }
    };
  
    fetchData();
  }, [params.sectionId, searchParams]);
  
// replace with an image
  // if (loading) return <p>Loading question...</p>;

  if (loading){
    return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
        <Image src="/assets/loading-pimp.png" alt="Redirecting..." width={200} height={200} />
      </div>
    );
  }


  if (!question) return <p>Question not found.</p>;


  const handlePrediction= async (predictedLetter:string) =>{
    if(!question || pointsAwarded)
    {
      return;
    }
    setSelectedAnswer(predictedLetter);

    if(predictedLetter === question.correct_answer)
      {
        setFeedback("Thats Correct!");
          if(questionNumber===5 && !pointsAwarded){
        try{
          const result = await fetch("/api/points",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 10 }) // the points we're giving in this section(10 points for completing a lesson)
          
        });
          if(!result.ok)
          {
            const error = await result.json();
            console.error("Failed to give points: ",error);
          }
          else
          {
            console.log("Points given at the end of the lesson");
            setPointsAwarded(true);
          }
        }
      
        catch(error)
        {
          console.error("Error updating points/score")
        }
        
          }
        }
      else
      {
        setFeedback("Thats wrong. Try again.")
      }
  };

  console.log(videoUrl)
  return (
    // display data
    <Layout>
    <div>
      <h1>{question.title}</h1>
      <p>{question.header}</p>
      <p>{question.description}</p>
      <p>{question.correct_answer}</p>
      <p>FeedBack:{feedback}</p>
      <CameraFeed
      targetLetter={question.correct_answer}
      onNext={()=>{
        setPointsAwarded(false);
        setSelectedAnswer(null);
        setFeedback("");
      }}
      onPrediction={handlePrediction}
      />
      <VideoPlayer videoUrl={videoUrl} />
    </div>
    </Layout>
  );
};

export default QuestionPage;
