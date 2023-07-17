import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'
import { TodoUpdate } from '../../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE) {
    }
  
    async deleteTodosByTodoId(todoId: string) {
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          'todoId': todoId,
        }
      }).promise()
    }
  
    async updateTodo(todoId: string, updatedTodo: TodoUpdate){
  
      await this.docClient.update({
          TableName: this.todosTable,
          Key: {
              "todoId": todoId
          },
          UpdateExpression: "set #todoName = :name, done = :done, dueDate = :dueDate",
          ExpressionAttributeNames: {
              "#todoName": "name"
          },
          ExpressionAttributeValues: {
              ":name": updatedTodo.name,
              ":done": updatedTodo.done,
              ":dueDate": updatedTodo.dueDate
          }
      }).promise()
  }
  
    async getTodosByUserId(userId: string): Promise<TodoItem[]> {
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: 'userIdGSI',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise()
      const items = result.Items
      return items as TodoItem[]
    }
  
    async createTodo(todos: TodoItem): Promise<TodoItem> {
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todos
      }).promise()
  
      return todos
    }
  }
  
  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  