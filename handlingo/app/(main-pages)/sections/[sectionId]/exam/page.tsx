"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import LoadingImage from "@/components/ui/loading";
// this should let us use the camera component to predict what letter was signed and give points if it was right 
import CameraFeed from "@/components/client/CameraFeed";
import TrafficLight from "@/components/ui/trafficLight";
//confetti!
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import Image from 'next/image';



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
  const [status, setStatus] = useState<"red" | "yellow" | "green">("red");
  // keeps track of what question the user is on by parsing the url
  const questionNumber = parseInt(searchParams.get("q") || "1", 10);
  //to track if user has gotten answer correct at some point
  const [isCorrect, setIsCorrect] = useState(true); // default = true for now. change later
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false); //end of lesson
  const [width, height] = useWindowSize();


  useEffect(() => {
    if (!params.sectionId) return;

    //Fetch the question data from API
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/section/${params.sectionId}/${questionNumber}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setQuestion(data.question); // Assuming the API returns { question: { ... } }
        setTotalQuestions(data.total_questions);//sets the total amount of questions in the section

        // Reset UI state for new question
        setLoading(false);
        setIsCorrect(false); 
        setSelectedAnswer(null);
        setFeedback("");
        setPointsAwarded(false);
        setStatus("red")

      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [params.sectionId, searchParams]);

  if (loading) return <LoadingImage />;
  if (!question) return <p>Question not found.</p>;

  // NEXT QUESTION (button)
  const handleNextQuestion = () => {
    const nextQuestionNumber = questionNumber + 1;

    // later should use 'total_question' field / 3 to calculate when to switch
    // for now its fine. 6 is start of quiz. 11 is start of exam. 15 is end of section
    let newPhase = "exam";
    // if end of lesson, show congrats!
    if (nextQuestionNumber >= 16) {
      setShowCongrats(true);
      return;
    } 

    // next question
    router.push(`/sections/${params.sectionId}/${newPhase}?q=${nextQuestionNumber}`);
  };

  // congrats!
  if (showCongrats) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <div className="pl-10 py-3">
          <Image
            src = "/assets/pimp-party.png"
            alt = "Nerd"
            width = {350}
            height = {350}
          />
        </div>

        {/* Confetti! */}
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />

        {/* Hooray Screen! */}
        <h1 className="text-4xl font-bold text-green-600 mb-6">🎉 Congratulations! 🎉</h1>
        <p className="text-xl mb-8">You’ve completed the section {params.sectionId}!</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-darkBlue text-white rounded-lg text-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // prediction
  const handlePrediction= async (predictedLetter:string) =>{
    if(!question || pointsAwarded)
    {
      return;
    }
    setSelectedAnswer(predictedLetter);

    //progress section
    if(totalQuestions)
      {
      try {
        const result = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: Number(params.sectionId),
            progress_pct: (questionNumber / totalQuestions) * 100,// the progress being added to the lesson progress when the user gets a question right
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

    //points section
    if(predictedLetter === question.correct_answer)
      {
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
      }
      else
      {
        setFeedback("That is incorrect.")
      }
  };



  return (
    //Page Container
    <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
      {/* Box to hold everything */}
      <div className= "flex flex-col h-[90vh] min-w-48 w-[175vh] border-2 border-black"> 
      
        {/* title + progress bar */}
        <div className= "flex w-full h-[10vh] py-5 justify-between"> 
          {/* title */}
          <div className="text-3xl font-bold pl-7 font-fira text-black">
            {question.title}
          </div>
          
          {/* lesson progress bar -- PENDING -- THIS IS USING FAKE NUMBER RN */}
          <div className="flex pt-2 gap-1.5 w-6/12 pr-9">
          {totalQuestions && (
            <>
              <span className="text-sm text-gray-600 font-nunito">
                {Math.round((questionNumber / totalQuestions) * 100)}%
              </span>
              <div className="w-full h-4 border border-black bg-white rounded-full">
                <div
                  className="h-full bg-lightBlue rounded-full"
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                />
              </div>
            </>
          )}
          </div>
        </div>


        {/* Lesson Content */}
        <div className="flex flex-col w-full h-full px-5">
          
          {/* Top Instructions */}
          <p className="text-xl font-medium font-fira text-black my-[5vh]">
            {question.header}
          </p>

          {/* Content Container */}
          <div className="flex flex-col items-center w-full h-full">
            {/* Camera Feed */}
            <div className="rounded-2xl overflow-hidden w-[600px] scale-x-[-1]">
              <CameraFeed
              targetLetter={question.correct_answer}
              onNext={()=>{
                setPointsAwarded(false);
                setSelectedAnswer(null);
                setFeedback("");
                setStatus("red");
              }}
              onPrediction={handlePrediction}
              status = {status}
              setStatus={setStatus}
              />
            </div>
            
            {/* Traffic Light */}
            <div className="pt-7">
            <TrafficLight
                status={status}
                onGreenHoldComplete={() => {
                  // once user holds a correct sign long enough
                  if (!isCorrect) {
                    setIsCorrect(true); // enable NEXT button
                  }
                }}
              />
            </div>

          </div>

          {/* NEXT button */}
          <button 
          disabled={!isCorrect}
          className={`absolute bottom-[5%] right-[5%] text-xl font-bold justify-end font-fira px-6 py-2 rounded-xl ${isCorrect ? "bg-darkBlue text-white" : "bg-slate-200 text-black/50 cursor-not-allowed"}`}
          onClick={handleNextQuestion}>
          NEXT
        </button>

        </div>
    </div>
  </div>
  );
};

export default QuestionPage;
