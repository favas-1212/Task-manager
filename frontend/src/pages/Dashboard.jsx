import { useEffect, useState } from "react";
import API from "../api/axios";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0 });


  const fetchTasks = async (url = "tasks/") => {
  try {
    setLoading(true);

    let queryUrl = url;

    // only add params when calling base endpoint
    if (url === "tasks/") {
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (filter !== "all") params.append("status", filter);

      queryUrl = `tasks/?${params.toString()}`;
    }
    const response = await API.get(queryUrl);

    setTasks(response.data.results.tasks);
    setStats(response.data.results.stats);
    setNextPage(response.data.next);
    setPrevPage(response.data.previous);
    
  } catch (error) {
    console.error("Failed to fetch tasks", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchTasks();
  }, [search,filter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      await API.post("tasks/", { title });
      setTitle("");
      fetchTasks();
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setCreating(false);
    }
  };
  const updateTask = async (id) => {
  if (!editingTitle.trim()) return;

  try {
      await API.patch(`tasks/${id}/`, {
        title: editingTitle,
      });
      setEditingTaskId(null);
      setEditingTitle("");
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };


  const toggleTaskStatus = async (task) => {
    await API.patch(`tasks/${task.id}/`, {
      completed: !task.completed,
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await API.delete(`tasks/${id}/`);
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

 

  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent =
    stats.total === 0
      ? 0
      : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="container py-4">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Task Manager</h3>
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Card */}
      <div className="card shadow-sm">
        <div className="card-body">

          {/* Progress */}
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <small>{stats.completed} / {stats.total} completed</small>
              <small>{progressPercent}%</small>
            </div>
            <div className="progress">
              <div
                className="progress-bar bg-success"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Search + Filter */}
          <div className="row g-2 mb-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Create Task */}
          <form onSubmit={handleCreateTask} className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter new task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className="btn btn-primary" disabled={creating}>
              {creating ? "Adding..." : "Add"}
            </button>
          </form>

          {/* Task List */}
          {loading && <p className="text-center">Loading...</p>}
          {!loading && tasks.length === 0 && (
            <p className="text-center text-muted">No tasks found</p>
          )}

          <ul className="list-group">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {/* LEFT SIDE */}
                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    className="form-control me-2"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                  />
                ) : (
                  <span
                    style={{
                      cursor: "pointer",
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                    onClick={() => toggleTaskStatus(task)}
                  >
                    {task.title}
                  </span>
                )}

                {/* RIGHT SIDE BUTTONS */}
                <div className="btn-group btn-group-sm ms-2">
                  {editingTaskId === task.id ? (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() => updateTask(task.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning"
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingTitle(task.title);
                        }}
                      >
                        Update
                      </button>
                      
                      <button
                        className={`btn ${
                          task.completed ? "btn-secondary" : "btn-success"
                        }`}
                        onClick={() => toggleTaskStatus(task)}
                      >
                        {task.completed ? "Undo" : "Complete"}
                      </button>
                      
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="d-flex justify-content-between mt-3">
            {prevPage && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => fetchTasks(prevPage)}
              >
                Previous
              </button>
            )}
            {nextPage && (
              <button
                className="btn btn-outline-primary btn-sm ms-auto"
                onClick={() => fetchTasks(nextPage)}
              >
                Next
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;


