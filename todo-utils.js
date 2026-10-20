function countUnfinishedTodos(todos) {
  return todos.filter(function (todo) {
    return todo.done === false;
  }).length;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { countUnfinishedTodos };
}
