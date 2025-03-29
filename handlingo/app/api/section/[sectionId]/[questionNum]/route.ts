// Example route to fetch question using `q`
import { NextResponse } from "next/server";
import { getQuestionByNum } from "@/utils/databaseQuery";

export async function GET(request: Request, { params }: { params: { sectionId: string } }) {
    const url = new URL(request.url);
    const questionId = url.searchParams.get('q'); // Get query parameter `q`

    if (!questionId) {
        return NextResponse.json({ error: "Missing question id" }, { status: 400 });
    }

    try {
        const question = await getQuestionByNum(Number(questionId), Number(params.sectionId));

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        return NextResponse.json({ question });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching question data" }, { status: 500 });
    }
}
