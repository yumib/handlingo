"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
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
  //to track if user has gotten answer correct at some point
  const [isCorrect, setIsCorrect] = useState(true); // default = true for now. change later


  // grab question content
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

        // reset variables for new question
        setIsCorrect(true); // or false later
        setSelectedAnswer(null);
        setFeedback("");
        setPointsAwarded(false);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // only after both fetches complete
      }
    };
  
    fetchData();
  }, [params.sectionId, searchParams]);
  

  if (loading) return <p>Loading question...</p>;
  if (!question) return <p>Question not found.</p>;


  // NEXT QUESTION (linked to button)
  const handleNextQuestion = () => {
    const nextQuestionNumber = questionNumber + 1;

    // later should use 'total_question' field / 3 to calculate when to switch
    // for now its fine. 6 is start of quiz. 11 is start of exam. 15 is end of section
    let newPhase = "lesson";
    if (nextQuestionNumber >= 6 && nextQuestionNumber <= 10) {
      newPhase = "quiz"; // go from lesson to quiz
    } else if (nextQuestionNumber >= 11) {
      newPhase = "exam";
    }

    // next question
    router.push(`/sections/${params.sectionId}/${newPhase}?q=${nextQuestionNumber}`);
  };
    

  // model prediction
  const handlePrediction= async (predictedLetter:string) =>{
    if(!question || pointsAwarded)
    {
      return;
    }
    setSelectedAnswer(predictedLetter);

    if(predictedLetter === question.correct_answer)
      {
        setIsCorrect(true); //update flag
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
        //setIsCorrect(false); //not doing for now. Keeping all true
        setFeedback("Thats wrong. Try again.")
      }
  };

  console.log(videoUrl)
  
  return (
    //Page Container
    <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
    {/* Box to hold everything */}
    <div className= "flex flex-col h-[90vh] min-w-48 w-[175vh] border-2 border-black"> 
      
      {/* subsection title + progress bar */}
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
        <p className="text-xl font-medium font-fira text-black my-[5vh]">{question.header}</p>


        {/* Lesson Stuff */}
        <div className="flex w-full h-[70dv] justify-start items-center">
          
          {/* Left Side */}
          <div className="flex flex-col w-7/12 items-center">
            {/* Video */}
            <div className="w-[530px] pb-5"> 
              <VideoPlayer videoUrl={videoUrl} />
            </div>
            {/* Text Instructions */}
            <p className="w-9/12 text-base font-medium font-fira text-black">
              {question.description}
            </p>
          </div>
          

          {/* Right Side */}
          <div className="flex flex-col w-1/2 justify-start items-center">
            
            {/* Camera Feed */}
            <div className="rounded-2xl overflow-hidden w-[450px] scale-x-[-1]"> 
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

            {/* Traffic Light Feedback */}
            <p className="pt-5">Correct Answer: {question.correct_answer}</p>
            <p>FeedBack: {feedback}</p>
          </div>

        </div>

        {/* Next Button */}
        <button 
          disabled={!isCorrect}
          className="absolute bottom-[5%] right-[5%] text-xl font-bold justify-end font-fira text-black px-6 py-2 rounded-xl bg-darkBlue"//onClick={handlePrediction}>
          onClick={handleNextQuestion}>
          NEXT
        </button>


      </div>
    
    </div>
    </div>);
};

export default QuestionPage;
