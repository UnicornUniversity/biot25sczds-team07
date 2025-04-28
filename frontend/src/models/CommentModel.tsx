export type CommentType = {
  _id: string;
  taskId: string;
  userId: string;
  commentContent: string;
  date: Date;
  dateEpoch: number,
}

export type CommentCreateType = {
  taskId: string,
  userId: string,
  commentContent: string
}
