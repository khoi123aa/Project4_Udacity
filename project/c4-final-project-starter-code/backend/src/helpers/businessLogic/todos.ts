import { TodosAccess } from '../../helpers/dataLayer/todosAcess'
import { AttachmentUtils } from '../../helpers/fileStorage/attachmentUtils';
import { TodoItem } from '../../models/TodoItem'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosByUserId(userId :string): Promise<TodoItem[]> {
  return todosAccess.getTodosByUserId(userId)
}

export async function deleteTodosByTodoId(todoId :string) {
  todosAccess.deleteTodosByTodoId(todoId)
}

export async function updateTodos(todoId :string, updateTodo :UpdateTodoRequest ) {
  todosAccess.updateTodo(todoId, updateTodo)
}

export async function createTodos(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()

  return await todosAccess.createTodo({
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: await attachmentUtils.createAttachmentURL(itemId),
    userId: jwtToken
  })
}