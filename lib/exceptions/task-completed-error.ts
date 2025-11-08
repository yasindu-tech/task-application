export class TaskCompletedError extends Error {
  constructor(message = "Task is already completed and cannot be modified") {
    super(message)
    this.name = "TaskCompletedError"
  }
}

export default TaskCompletedError
