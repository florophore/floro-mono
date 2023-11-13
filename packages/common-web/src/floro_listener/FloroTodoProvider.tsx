import React, { useContext} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import initTodos, { TodoMap, getTodo } from "@floro/common-generators/floro_modules/todo-generator/index";
import { getJSON } from "@floro/generators/todo-generator/src/index";
import { useWatchFloroState } from "./FloroListener";


const FloroPaletteContext = React.createContext(initTodos);
export interface Props {
  children: React.ReactElement;
}

export const FloroTodoProvider = (props: Props) => {
  const todos = useWatchFloroState(metaFile.repositoryId, initTodos, getJSON);

  return (
    <FloroPaletteContext.Provider value={todos}>
      {props.children}
    </FloroPaletteContext.Provider>
  );
};

export const useFloroTodos = () => {
    return useContext(FloroPaletteContext);
}

export const useTodo = (key: keyof TodoMap) => {
  const todoMap = useFloroTodos();
  return getTodo(todoMap, key);
}