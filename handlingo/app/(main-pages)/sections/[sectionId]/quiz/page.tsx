"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Layout from '@/components/ui/layout'; 
import MultipleChoice from "@/components/client/multipleChoice";
import VideoPlayer from "@/components/ui/lessonVid";
import LoadingImage from "@/components/ui/loading";



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
  const [videoUrl, setVideoUrl] = useState("");
  // keeps track of what question the user is on by parsing the url
  const questionNumber = parseInt(searchParams.get("q") || "1", 10);
  //to track if user has gotten answer correct at some point
  const [isCorrect, setIsCorrect] = useState(true); // default = true for now. change later
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
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
        setTotalQuestions(questionData.total_questions);//sets the total amount of questions in the section

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
  }, [params.sectionId, questionNumber]);
  useEffect(() => {
    setPointsAwarded(false);
    setSelectedAnswer(null);
    setFeedback("");
    
  }, [questionNumber]);


  if (loading) return <LoadingImage />;
  if (!question) return <p>Question not found.</p>;

  // NEXT QUESTION (button)
  const handleNextQuestion = () => {
    const nextQuestionNumber = questionNumber + 1;

    // later should use 'total_question' field / 3 to calculate when to switch
    // for now its fine. 6 is start of quiz. 11 is start of exam. 15 is end of section
    let newPhase = "quiz";
    if (nextQuestionNumber >= 11 && nextQuestionNumber <= 15) {
      newPhase = "exam"; // go from quiz to exam
    } 

    // next question
    router.push(`/sections/${params.sectionId}/${newPhase}?q=${nextQuestionNumber}`);
  };

  // MC response
  const handleAnswer= async (answer: string) =>{
    if(!question || pointsAwarded)
      {
        return;
      }
      setSelectedAnswer(answer);
      //progress section
  
    if(totalQuestions)
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
      // points section
    if(answer === question.correct_answer)
      {
        setFeedback("Good job! Thats correct!");
        setIsCorrect(true) //user got answer correct
        if(!pointsAwarded){
        try{
            const result = await fetch("/api/points",{
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: 5}) // the points we're giving in this section(5 points for getting a question right)
            });   
          if(!result.ok)
          {
            let errorText;
            try {
              errorText = await result.json();
            } catch {
              errorText = { error: "Non-JSON response or empty body" };
            }
            console.error("Failed to give points:", errorText);
          }
          else
          {
            console.log("Points given on correct answer");
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
        try{
        const result = await fetch("/api/points",{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 2}) // the points we're giving in this section(5 points for getting a question right)
        });
        if(!result.ok)
          {
            let errorText;
            try {
              errorText = await result.json();
            } catch {
              errorText = { error: "Non-JSON response or empty body" };
            }
            console.error("Failed to give points:", errorText);
          }
          else
          {
            console.log("Half points given on wrong answer");
            setPointsAwarded(true);
          }
      }
      catch(error)
      {
        console.error("Error updating points/score")
      } 
        setIsCorrect(true) // REMOVE LATER. For now, acting as only allow next after user answers question
        setFeedback(`That is incorrect. The correct answer was ${question.correct_answer}`);
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
            {/* Video */}
            <div className="w-[530px] pb-5"> 
              <VideoPlayer videoUrl={videoUrl} />
            </div>

            {/* Multiple Choice */}
            <div className="flex">
              <MultipleChoice
              choices={question.options}
              selectedAnswer={selectedAnswer}
              correctAnswer={question.correct_answer}
              onAnswer={handleAnswer}/> 
            </div>

            <p>{feedback}</p>
          </div>

          {/* NEXT button */}
          <button 
          disabled={!isCorrect}
          className="absolute bottom-[5%] right-[5%] text-xl font-bold justify-end font-fira text-black px-6 py-2 rounded-xl bg-darkBlue"
          onClick={handleNextQuestion}>
          NEXT
          </button>

        </div>
    </div>
  </div>
  );
};

export default QuestionPage;
