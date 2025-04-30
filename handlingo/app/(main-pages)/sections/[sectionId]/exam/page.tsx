"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
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
  //to track if user has gotten answer correct at some point
  const [isCorrect, setIsCorrect] = useState(true); // default = true for now. change later

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

        // Reset UI state for new question
        setIsCorrect(false); 
        setSelectedAnswer(null);
        setFeedback("");
        setPointsAwarded(false);

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

  // NEXT QUESTION (button)
  const handleNextQuestion = () => {
    const nextQuestionNumber = questionNumber + 1;

    // later should use 'total_question' field / 3 to calculate when to switch
    // for now its fine. 6 is start of quiz. 11 is start of exam. 15 is end of section
    let newPhase = "exam";
    if (nextQuestionNumber >= 15) {
      // go from quiz to end of section
      // PENDING - figure out what happens at the end
    } 

    // next question
    router.push(`/sections/${params.sectionId}/${newPhase}?q=${nextQuestionNumber}`);
  };

  // prediction
  const handlePrediction= async (predictedLetter:string) =>{
    if(!question || pointsAwarded)
    {
      return;
    }
    setSelectedAnswer(predictedLetter);

    if(predictedLetter === question.correct_answer)
      {
        setFeedback("Thats correct!");
        setIsCorrect(true)
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
              <span className="text-sm text-gray-600 font-nunito">
                {Math.round(10)}%
              </span>
              <div className="w-full h-4 border border-black bg-white rounded-full">
                <div
                  className="h-full bg-lightBlue rounded-full"
                  style={{ width: `${10}%` }}
                />
              </div> 
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
              }}
              onPrediction={handlePrediction}
              />
            </div>
            
            <div className="flex pt-5"> </div>
            <p>Correct Answer: {question.correct_answer}</p>
            <p>FeedBack:{feedback}</p>
          </div>

          {/* NEXT button */}
          <button 
          disabled={!isCorrect}
          className="absolute bottom-[5%] right-[5%] text-xl font-bold justify-end font-fira text-black px-6 py-2 rounded-xl bg-darkBlue"//onClick={handlePrediction}>
          onClick={handleNextQuestion}>
          NEXT
          </button>

        </div>
    </div>
  </div>
  );
};

export default QuestionPage;
