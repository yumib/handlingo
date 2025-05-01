"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Layout from '@/components/ui/layout';
// this should let us use the camera component to predict what letter was signed and give points if it was right 
import CameraFeed from "@/components/client/CameraFeed";



const QuestionPage = () => {
  // not sure what this does 
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // set up structure of question
  type Question = {
    title: string;
    header: string;
    correct_answer: string;
  };
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [pointsAwarded, setPointsAwarded]= useState(false);
  // keeps track of what question the user is on by parsing the url
  const questionNumber = parseInt(searchParams.get("q") || "1", 10);

  useEffect(() => {
    if (!params.sectionId) return;

    //Fetch the question data from API
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/section/${params.sectionId}/${questionNumber}`);
        const data = await res.json();
        console.log(data)
        if (!res.ok) throw new Error(data.error);

        setQuestion(data.question); // Assuming the API returns { question: { ... } }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [params.sectionId, searchParams]);
  if (loading) return <p>Loading question...</p>;
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
        try{
          const result = await fetch("/api/points",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 10 }) // the points we're giving in this section(10 points per question)
          });
          if(!result.ok)
          {
            const error = await result.json();
            console.error("Failed to give points: ",error);
          }
          else
          {
            console.log("Points given");
            setPointsAwarded(true);
          }
        }
        catch(error)
        {
          console.error("Error updating points/score")
        }
        try {
          const result = await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sectionId: Number(params.sectionId),
              amount: 16.67,// the progress being added to the lesson progress when the user gets a question right
            }),
          });
    
          if (!result.ok) {
            const error = await result.json();
            console.error("Failed to update progress:", error);
          }
        } catch (error) {
          console.error("Error updating progress:", error);
        }
    
      }
      else
      {
        setFeedback("Thats wrong. Try again.")
      }
  };



  return (
    // display data
    <Layout>
    <div>
      <h1>{question.title}</h1>
      <p>{question.header}</p>
      <p>Correct Answer: {question.correct_answer}</p>
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
    </div>
    </Layout>
  );
};

export default QuestionPage;
