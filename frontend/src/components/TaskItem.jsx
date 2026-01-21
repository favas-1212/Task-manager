import API from "../api/axios";

const TaskItem = ({ task, refreshTasks }) => {
  const toggleComplete = async () => {
    await API.patch(`tasks/${task.id}/`, {
      completed: !task.completed,
    });
    refreshTasks();
  };

  const deleteTask = async () => {
    await API.delete(`tasks/${task.id}/`);
    refreshTasks();
  };

  return (
    <li>
      <span
        style={{
          textDecoration: task.completed ? "line-through" : "none",
          cursor: "pointer",
        }}
        onClick={toggleComplete}
      >
        {task.title}
      </span>

      <button onClick={deleteTask} style={{ marginLeft: "10px" }}>
        ❌
      </button>
    </li>
  );
};

export default TaskItem;
