import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { XIcon, PlusIcon, TrashIcon, CheckIcon, UndoIcon } from "lucide-react";
import { setLocalStorage, getLocalStorage } from "./../../lib/localStorage";

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

interface TodoListDropdownProps {
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const TodoListDropdown: React.FC<TodoListDropdownProps> = ({ buttonRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");

  const loadTodos = () => {
    const storedTodos = getLocalStorage("todos");
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos);
        if (Array.isArray(parsedTodos)) {
          setTodos(parsedTodos);
        } else {
          console.error("Stored todos is not an array");
          setTodos([]);
        }
      } catch (error) {
        console.error("Error parsing stored todos:", error);
        setTodos([]);
      }
    } else {
      setTodos([]);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    const updateDropdownPosition = () => {
      if (isOpen && buttonRef.current && dropdownRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const dropdownWidth = Math.min(320, viewportWidth * 0.9);
        const dropdownHeight = Math.min(400, viewportHeight * 0.7);

        let left = buttonRect.left;
        if (left + dropdownWidth > viewportWidth) {
          left = Math.max(0, viewportWidth - dropdownWidth);
        }

        let top = buttonRect.bottom;
        if (top + dropdownHeight > viewportHeight) {
          top = Math.max(0, buttonRect.top - dropdownHeight);
        }

        dropdownRef.current.style.left = `${left}px`;
        dropdownRef.current.style.top = `${top}px`;
        dropdownRef.current.style.width = `${dropdownWidth}px`;
        dropdownRef.current.style.maxHeight = `${dropdownHeight}px`;
      }
    };

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition);
    };
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [buttonRef]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const addTodo = () => {
    if (newTask.trim()) {
      const updatedTodos = [
        ...todos,
        { id: Date.now(), task: newTask.trim(), completed: false },
      ];
      setTodos(updatedTodos);
      setLocalStorage("todos", JSON.stringify(updatedTodos));
      setNewTask("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const toggleComplete = (id: number) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    setLocalStorage("todos", JSON.stringify(updatedTodos));
  };

  const removeTodo = (id: number) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    setLocalStorage("todos", JSON.stringify(updatedTodos));
  };

  const clearTodos = () => {
    setTodos([]);
    setLocalStorage("todos", JSON.stringify([]));
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`font-bold py-2.5 px-2.5 ${
          isOpen ? "bg-white/20 dark:bg-white/20" : ""
        } `}
      >
        <div>
          <img
            src="/assets/Todo.svg"
            alt="To-Do List"
            className="w-6 h-6 dark:invert-[.835]"
          />
        </div>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="overflow-y-scroll no-scrollbar overflow-hidden fixed bg-[#C2E6EC] dark:bg-[#0C1222] shadow-xl transform transition-all ease-in-out duration-300 opacity-100 z-50 border-2 border-[#5FC4E7] dark:border-[#008A90] overflow-hidden"
          style={{ maxWidth: "90vw", maxHeight: "70vh" }}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold dark:text-[#D5D5D5]">
              To-Do List
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon size={24} />
            </button>
          </div>
          <div
            className="p-4 overflow-y-auto"
            style={{ maxHeight: "calc(70vh - 60px)" }}
          >
            <div className="flex mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter new task"
                className="flex-grow border px-2 dark:text-white py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white dark:bg-[#3D414E] rounded "
              />
              <button
                onClick={addTodo}
                className="bg-[#82BEE9] hover:bg-[#5FA0D9] dark:bg-[#008A90] text-white dark:text-[#D5D5D5] px-3 py-1 rounded p-2 transition duration-200"
              >
                <PlusIcon size={20} />
              </button>
            </div>
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between bg-[#5FC4E7] dark:bg-[#008A90] dark:text-[#D5D5D5] p-2 "
                >
                  <span className={todo.completed ? "line-through" : ""}>
                    {todo.task}
                  </span>
                  <div>
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className="text-blue-500 mr-2 hover:text-blue-600 transition duration-200"
                    >
                      {todo.completed ? (
                        <UndoIcon size={16} color="#d5d5d5" />
                      ) : (
                        <CheckIcon size={16} color="#d5d5d5" />
                      )}
                    </button>
                    <button
                      onClick={() => removeTodo(todo.id)}
                      className="text-red-500 hover:text-red-600 transition duration-200"
                    >
                      <TrashIcon size={16} color="#d5d5d5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {todos.length > 0 && (
              <button
                onClick={clearTodos}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white dark:text-[#D5D5D5] px-3 py-1 rounded w-full transition duration-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TodoListDropdown;
