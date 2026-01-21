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
  const [filter, setFilter] = useState("all"); // all | completed | pending


  const fetchTasks = async (url = "tasks/") => {
    try {
      setLoading(true);
      const response = await API.get(url);

      if (Array.isArray(response.data)) {
        setTasks(response.data);
        setNextPage(null);
        setPrevPage(null);
      } else {
        setTasks(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateTask = async (e) => {
  e.preventDefault();

  if (!title.trim()) return;

  try {
    setCreating(true);
    await API.post("tasks/", { title });
    setTitle("");
    fetchTasks(); // refresh list
  } catch (error) {
    console.error("Failed to create task", error);
  } finally {
    setCreating(false);
  }
};
const toggleTaskStatus = async (task) => {
  try {
    await API.patch(`tasks/${task.id}/`, {
      completed: !task.completed,
    });
    fetchTasks(); // refresh tasks
  } catch (error) {
    console.error("Failed to update task", error);
  }
};
const deleteTask = async (id) => {
  const confirmDelete = window.confirm("Delete this task?");
  if (!confirmDelete) return;

  try {
    await API.delete(`tasks/${id}/`);
    fetchTasks(); // refresh list
  } catch (error) {
    console.error("Failed to delete task", error);
  }
};
const totalTasks = tasks.length;
const completedTasks = tasks.filter(t => t.completed).length;

const progressPercent = totalTasks === 0
  ? 0
  : Math.round((completedTasks / totalTasks) * 100);





  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  const filteredTasks = tasks.filter((task) => {
  const matchesSearch = task.title
    .toLowerCase()
    .includes(search.toLowerCase());

  if (filter === "completed") {
    return task.completed && matchesSearch;
  }

  if (filter === "pending") {
    return !task.completed && matchesSearch;
  }

  return matchesSearch; // all
});


  return (
   <div style={styles.container}>
      

      <div style={styles.card}>
        <header style={styles.header}>
        <h2>Task Manager</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>
        <h3>My Tasks</h3>
        <div style={styles.progressContainer}>
          <div style={styles.progressInfo}>
            <span>{completedTasks} / {totalTasks} completed</span>
            <span>{progressPercent}%</span>
          </div>

          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && tasks.length === 0 && <p>No tasks found</p>}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <form onSubmit={handleCreateTask} style={styles.form}>
          <input
            type="text"
            placeholder="Enter new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />
          <button type="submit" disabled={creating}>
            {creating ? "Adding..." : "Add"}
          </button>
        </form>

        <ul style={styles.list}>
          {filteredTasks.map((task) => (
            <li key={task.id} style={styles.task}>
              <span
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                  cursor: "pointer",
                }}
                onClick={() => toggleTaskStatus(task)}
              >
                {task.title}
              </span>
              
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => toggleTaskStatus(task)}
                  style={{
                    ...styles.statusBtn,
                    background: task.completed ? "#9e9e9e" : "#4caf50",
                  }}
                >
                  {task.completed ? "Undo" : "Complete"}
                </button>
              
                          
                <button
                  onClick={() => deleteTask(task.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
                          

            </li>
          ))}
        </ul>

        <div style={styles.pagination}>
          {prevPage && (
            <button onClick={() => fetchTasks(prevPage)}>
              Previous
            </button>
          )}
          {nextPage && (
            <button onClick={() => fetchTasks(nextPage)}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// ⚠️ MUST BE OUTSIDE THE COMPONENT
const styles = {
 container: {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6f8",
},

  header: {
  width: "100%",
  maxWidth: "600px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
},

card: {
  width: "420px",
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
},


  list: {
    listStyle: "none",
    padding: 0,
  },
  task: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 8px",
  borderBottom: "1px solid #f0f0f0",
},
  pagination: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
  },
  form: {
  display: "flex",
  gap: "10px",
  marginBottom: "15px",
},
input: {
  flex: 1,
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "14px",
},

statusBtn: {
  padding: "6px 10px",
  fontSize: "12px",
  cursor: "pointer",
  borderRadius: "6px",
  border: "none",
  background: "#4caf50",
  color: "#fff",
},
filterBar: {
  display: "flex",
  gap: "10px",
  marginBottom: "15px",
},
searchInput: {
  flex: 1,
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "14px",
},

progressContainer: {
  marginBottom: "15px",
},
progressInfo: {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px",
  marginBottom: "5px",
},
progressBar: {
  height: "8px",
  background: "#e0e0e0",
  borderRadius: "4px",
  overflow: "hidden",
},
progressFill: {
  height: "100%",
  background: "#4caf50",
  transition: "width 0.3s ease",
},
deleteBtn: {
  padding: "6px 10px",
  fontSize: "12px",
  cursor: "pointer",
  background: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
},





};

