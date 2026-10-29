const STORAGE_KEY = "todo-list-v1";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const addButton = document.getElementById("add-button");
const list = document.getElementById("todo-list");
const remainingCount = document.getElementById("remaining-count");
const clearCompletedButton = document.getElementById("clear-completed-button");
const searchInput = document.getElementById("search-input");
const noResults = document.getElementById("no-results");
let todos = loadTodos();

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(function (item) {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.done === "boolean"
      );
    });
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateRemainingCount() {
  const unfinishedCount = countUnfinishedTodos(todos);

  remainingCount.textContent = "剩餘 " + unfinishedCount + " 項未完成任務";
}

function updateAddButton() {
  addButton.disabled = input.value.trim() === "";
}

function createTodoElement(todo) {
  const item = document.createElement("li");
  item.className = "todo-item";
  if (todo.done) {
    item.classList.add("done");
  }

  const label = document.createElement("label");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.done;
  checkbox.addEventListener("change", function () {
    toggleTodo(todo.id);
  });

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "刪除";
  deleteButton.addEventListener("click", function () {
    deleteTodo(todo.id);
  });

  label.appendChild(checkbox);
  label.appendChild(text);
  item.appendChild(label);
  item.appendChild(deleteButton);
  return item;
}

function renderTodos() {
  const visibleTodos = filterTodos(todos, searchInput.value);
  list.innerHTML = "";

  visibleTodos.forEach(function (todo) {
    list.appendChild(createTodoElement(todo));
  });

  noResults.hidden = searchInput.value.trim() === "" || visibleTodos.length > 0;
  updateRemainingCount();
}

function addTodo(text) {
  todos.push({
    id: createId(),
    text: text,
    done: false,
  });
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map(function (todo) {
    if (todo.id === id) {
      return {
        id: todo.id,
        text: todo.text,
        done: !todo.done,
      };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
}

function clearCompletedTodos() {
  todos = todos.filter(function (todo) {
    return todo.done === false;
  });

  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(function (todo) {
    return todo.id !== id;
  });
  saveTodos();
  renderTodos();
}

input.addEventListener("input", updateAddButton);
searchInput.addEventListener("input", renderTodos);

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") {
    return;
  }
  addTodo(text);
  input.value = "";
  updateAddButton();
});

clearCompletedButton.addEventListener("click", clearCompletedTodos);

searchInput.value = "";
updateAddButton();
renderTodos();
