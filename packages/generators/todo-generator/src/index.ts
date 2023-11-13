import {
  SchemaRoot
} from "./floro-generator-schema-api";
import floroGeneratorFile from '../floro/floro.generator.json';
import path from "path";
import fs from "fs";
import { quicktype, InputData, JSONSchemaInput, TypeScriptTargetLanguage } from "quicktype-core";

type Languages = 'typescript';

export function filename() {
  return __filename;
}

export function getFloroGenerator() {
  return floroGeneratorFile;
}

const GET_TODO = `
export const getTodo = <
  T extends keyof TodoMap
>(
  todos: TodoMap,
  key: T
): Todo | null => {
  return todos?.[key] ?? null;
};
`.trim();

export async function getJSON<T>(
  state: SchemaRoot,
): Promise<T> {

  const todoMap = {};
  for (const todo of state.todo.todos) {
    todoMap[todo.id] = {
      id: todo.id,
      inProgress: todo.inProgress.value ?? false,
      isDone: todo.isDone
    }
  }
  return todoMap as T;
}

export async function generate(
  state: SchemaRoot,
  outDir: string,
  args: { lang: Languages } = { lang: "typescript" }
) {
  const SCHEMA = {
    $schema: "http://json-schema.org/draft-06/schema#",
    $ref: "#/definitions/TodoMap",
    definitions: {
      TodoMap: {
        type: "object",
        properties: {},
        required: [] as string[],
        additionalProperties: false,
      },
      Todo: {
        type: "object",
        additionalProperties: false,
        required: ["id", "inProgress", "isDone"],
        properties: {
          id: {
            type: ["string"],
          },
          inProgress: {
            type: ["boolean"],
          },
          isDone: {
            type: ["boolean"],
          },
        },
      }
    },
  };
  const requiredTodos: string[] = [];
  for (const todo of state.todo.todos) {
    SCHEMA.definitions.TodoMap.properties[todo.id] = {
      '$ref'  : "#/definitions/Todo",
    };
    requiredTodos.push(todo.id);
  }
  SCHEMA.definitions.TodoMap.required = requiredTodos;

  const inputData = new InputData();
  const source = { name: "TodoMap", schema: JSON.stringify(SCHEMA) };
  await inputData.addSource(
    "schema",
    source,
    () => new JSONSchemaInput(undefined)
  );

  if (args.lang == 'typescript') {
    const lang = new TypeScriptTargetLanguage();
    const runtimeTypecheck = lang.optionDefinitions.find(option => option.name == 'runtime-typecheck')
    if (runtimeTypecheck) {
      runtimeTypecheck.defaultValue = false;
    }
    const { lines } = await quicktype({ lang, inputData });
    const code = lines.join("\n");
    const tsFile = path.join(outDir, 'index.ts');
    let tsCode =`import todoJSON from './todo.json';\n\n`;
    tsCode += code + '\n';
    tsCode += GET_TODO + '\n\n';
    tsCode += `export default todoJSON as TodoMap;`;
    await fs.promises.writeFile(tsFile, tsCode, 'utf-8');

    const todoJson = await getJSON(state);
    const jsonFile = path.join(outDir, 'todo.json');
    await fs.promises.writeFile(jsonFile, JSON.stringify(todoJson, null, 2), 'utf-8');
  }
}