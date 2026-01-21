import TaskItem from "./TaskItem";

const TaskList = ({ tasks, refreshTasks }) => {
  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          refreshTasks={refreshTasks}
        />
      ))}
    </ul>
  );
};

export default TaskList;
