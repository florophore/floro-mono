import todoJSON from './todo.json';

// To parse this data:
//
//   import { Convert, TodoMap } from "./file";
//
//   const todoMap = Convert.toTodoMap(json);

export interface TodoMap {
    "another todo":  Todo;
    "my todo":       Todo;
    "one more todo": Todo;
    test:            Todo;
}

export interface Todo {
    id:         string;
    inProgress: boolean;
    isDone:     boolean;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toTodoMap(json: string): TodoMap {
        return JSON.parse(json);
    }

    public static todoMapToJson(value: TodoMap): string {
        return JSON.stringify(value);
    }
}

export const getTodo = <
  T extends keyof TodoMap
>(
  todos: TodoMap,
  key: T
): Todo | null => {
  return todos?.[key] ?? null;
};

export default todoJSON as TodoMap;