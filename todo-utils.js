function countUnfinishedTodos(todos) {
  return todos.filter(function (todo) {
    return todo.done === false;
  }).length;
}

function filterTodos(todos, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return todos.filter(function (todo) {
    return todo.text.toLowerCase().includes(normalizedKeyword);
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { countUnfinishedTodos, filterTodos };
}
