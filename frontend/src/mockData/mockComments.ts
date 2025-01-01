import dayjs from "dayjs"

export type CommentType = {
    id: string,
    taskId: string,
    userId: string,
    commentContent: string // Markdown
    date: Date,
    dateEpoch: number,
}

export const mockComments: CommentType[] = [
    {
        id: "c101",
        taskId: "201",
        userId: "1",
        commentContent: "Great job team! The backend setup is complete and everything is running smoothly. Let's keep this momentum going into the next sprint.",
        date: dayjs("2023-11-09T12:00:00Z").toDate(),
        dateEpoch: 1699574400
    },
    {
        id: "c102",
        taskId: "201",
        userId: "2",
        commentContent: "Backend setup was challenging but rewarding. Learned a lot about our new architecture. Excited for the frontend integration!",
        date: dayjs("2023-11-09T15:00:00Z").toDate(),
        dateEpoch: 1699585200
    },
    {
        id: "c201",
        taskId: "202",
        userId: "1",
        commentContent: "Frontend integration is progressing well. Please ensure all components are thoroughly tested before merging.",
        date: dayjs("2023-11-15T10:00:00Z").toDate(),
        dateEpoch: 1700042400
    },
    {
        id: "c202",
        taskId: "202",
        userId: "2",
        commentContent: "Encountered some issues with the API calls, but they are being resolved. The UI is looking great so far!",
        date: dayjs("2023-11-16T14:00:00Z").toDate(),
        dateEpoch: 1700128800
    },
    {
        id: "c301",
        taskId: "203",
        userId: "1",
        commentContent: "Planning phase for authentication is complete. Let's ensure we cover all security aspects in the implementation.",
        date: dayjs("2023-11-23T09:00:00Z").toDate(),
        dateEpoch: 1700720400
    },
    {
        id: "c302",
        taskId: "203",
        userId: "2",
        commentContent: "Looking forward to working on the authentication module. Security is a top priority for this sprint.",
        date: dayjs("2023-11-23T11:00:00Z").toDate(),
        dateEpoch: 1700727600
    }
]