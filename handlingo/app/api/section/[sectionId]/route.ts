import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getInternalUserByEmail, getUserProgress, getQuestionsForSection, getQuestionByNum } from "@/utils/databaseQuery";

export async function GET(request: Request, context: { params: { sectionId?: string } }) {

    // find auth user
    const supabase = await createClient(); 
    const { data: { user }, error } = await supabase.auth.getUser();

    // get params
    let { params } = context;
    params = await params
    if (!params) {
        return NextResponse.json({ error: "Missing sectionId parameter" }, { status: 400 });
    }

    if (!user) {
        return NextResponse.json({ message: 'Error getting internal user' }, { status: 400 });
    }
    
    // get user from User_Table
    let internalUser = await getInternalUserByEmail(String(user.email));

    // convert string parameter to a number for db queries 
    const sectionId = Number(params.sectionId);
    console.log("SectionId: " + sectionId)
    if (isNaN(sectionId)) {
        return NextResponse.json({ error: "Invalid sectionId parameter" }, { status: 400 });
    }

    if (!sectionId) {
        return NextResponse.json({ error: "Missing sectionId parameter" }, { status: 400 });
    }

    try {

        // get progress and question list associated w/ sectionId from db queries on './utils/databaseQuery.ts'
        const progress = await getUserProgress(internalUser.id, sectionId);
        console.log("Progress: " + progress)
        const questionList = await getQuestionsForSection(sectionId);
        //console.log("Question List: " + questionList)

        if (!questionList.length) {
            return NextResponse.json({ error: "No questions found for section" }, { status: 404 });
        }

        // find specific question based on user progress w/ math
        const totalQuestions = questionList.length;
        const questionIndex = Math.ceil((progress.progress_pct / 100) * totalQuestions) - 1;
        const selectedQuestion = questionList[Math.max(0, Math.min(questionIndex, totalQuestions - 1))];
        console.log(selectedQuestion)

        // find specific question and question type (lesson, quiz, or exam)
        const question = await getQuestionByNum(selectedQuestion.question_num, sectionId);
        const questionType = question.type
       

        return NextResponse.json({ progress, questionList, question, questionType });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
