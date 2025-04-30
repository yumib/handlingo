"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import VideoPlayer from "@/components/ui/lessonVid";

const QuestionPage = () => {

  //not sure what this does
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // set up structure of question
  type Question = {
    title: string;
    header: string;
    correct_answer: string;
    options:string[];
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
    if (!params.sectionId || isNaN(questionNumber)) return;

    console.log("sectionId:", params.sectionId);
    console.log("questionNumber from URL:", questionNumber);

    // fetch the question data from API
    const fetchQuestion = async () => {
      try {
        // fetch question and video in parallel
        const [questionRes, videoRes] = await Promise.all([
          fetch(`/api/section/${params.sectionId}/${questionNumber}`),
          fetch(`/api/lessonVids/${params.sectionId}/${questionNumber - 5}`) //since video is 1-5
        ]);

        const questionData = await questionRes.json();
        const videoData = await videoRes.json();
        
        if (!questionRes.ok) throw new Error(questionData.error);
        if (!videoRes.ok) throw new Error(videoData.error);

        setQuestion(questionData.question); // set question data
        setVideoUrl(videoData.lessonVid); // set video URL

        // Reset UI state for new question
        setSelectedAnswer(null);
        setFeedback("");

      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [params.sectionId, questionNumber]);

  if (loading) return <p>Loading question...</p>;
  if (!question) return <p>Question not found.</p>;

  const handleAnswer= async (answer: string) =>{
    if(!question || pointsAwarded)
      {
        return;
      }
      setSelectedAnswer(answer);
  
    if(answer === question.correct_answer)
      {
        setFeedback("Thats Correct!");
        if(questionNumber===5 && !pointsAwarded){
        try{
          const result = await fetch("/api/points",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 5 }) // the points we're giving in this section(5 points for getting a question right)
          
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
            {/* Video */}
            <div className="w-[530px] pb-5"> 
              <VideoPlayer videoUrl={videoUrl} />
            </div>

            {/* Multiple Choice */}
            {/* <MultipleChoice
            choices={question.options}
            selectedAnswer={selectedAnswer}
            onAnswer={handleAnswer}
            /> */}

            <p>FeedBack:{feedback}</p>
            <p>Correct Answer: {question.correct_answer}</p>
          </div>
        </div>
    </div>
  </div>
  );
};

export default QuestionPage;
