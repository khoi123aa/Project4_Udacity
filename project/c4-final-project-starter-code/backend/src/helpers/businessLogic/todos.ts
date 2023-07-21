import { TodosAccess } from '../../helpers/dataLayer/todosAcess'
import { TodoItem } from '../../models/TodoItem'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { AttachmentUtils } from '../../helpers/fileStorage/attachmentUtils';
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosByUserId(userId :string): Promise<TodoItem[]> {
  return todosAccess.getTodosByUserId(userId)
}

export async function deleteTodosByTodoId(userId: string, todoId: string) {
  todosAccess.deleteTodosByTodoId(userId, todoId)
}

export async function updateTodos(userId: string, todoId :string, updateTodo :UpdateTodoRequest ) {
  todosAccess.updateTodo(userId, todoId, updateTodo)
}

export async function createTodos(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()

  return await todosAccess.createTodo({
    todoId: itemId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: await attachmentUtils.createAttachmentURL(itemId),
    userId: jwtToken,
    ...createTodoRequest
  })
}