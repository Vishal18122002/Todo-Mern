import { useEffect, useState } from "react";

export default function Todo() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(-1);
  const [loading, setLoading] = useState(false);
  const apiUrl = "http://localhost:8000";

  // Handle form submission
  const handleSubmit = () => {
    setError("");
    setMessage("");

    if (title.trim() === "" || description.trim() === "") {
      setError("Both title and description are required.");
      return;
    }

    setLoading(true);
    fetch(apiUrl + "/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Unable to create TODO item.");
        }
      })
      .then((newTodo) => {
        setTodos([...todos, newTodo]);
        setMessage("Item added successfully!");
        resetForm();
      })
      .catch((err) => {
        setError(err.message || "Unable to create TODO");
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => {
          setMessage("");
          setError("");
        }, 3000);
      });
  };

  // Fetch all tasks on component load
  useEffect(() => {
    getItems();
  }, []);

  const getItems = () => {
    setLoading(true);
    fetch(apiUrl + "/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch(() => setError("Unable to fetch TODO items"))
      .finally(() => setLoading(false));
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      fetch(apiUrl + "/todos/" + id, {
        method: "DELETE",
      })
        .then(() => {
          const updatedTodos = todos.filter((item) => item._id !== id);
          setTodos(updatedTodos);
        })
        .catch(() => setError("Unable to delete the item."));
    }
  };

  // Handle Edit
  const handleEdit = (item) => {
    setEditId(item._id); // Set the ID of the item to be edited
    setTitle(item.title); // Set the title of the item in the input field
    setDescription(item.description); // Set the description of the item in the input field
  };

  // Handle Update
  const handleUpdate = () => {
    setError("");
    setMessage("");

    if (title.trim() === "" || description.trim() === "") {
      setError("Both title and description are required.");
      return;
    }

    fetch(apiUrl + "/todos/" + editId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    })
      .then((res) => {
        if (res.ok) {
          const updatedTodos = todos.map((item) =>
            item._id === editId ? { ...item, title, description } : item
          );
          setTodos(updatedTodos);
          setMessage("Item updated successfully!");
          setEditId(-1);
          resetForm();
        } else {
          throw new Error("Unable to update TODO item.");
        }
      })
      .catch((err) => {
        setError(err.message || "Unable to update TODO");
      })
      .finally(() => {
        setTimeout(() => {
          setMessage("");
          setError("");
        }, 3000);
      });
  };

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  return (
    <div className="container my-4">
      <div className="header p-3 text-light">
        <h1>Todo Manager</h1>
      </div>

      {/* Form Section */}
      <div className="row mt-3">
        {message && <Message message={message} type="success" />}
        {error && <Message message={error} type="danger" />}
        <div className="form-group d-flex gap-2">
          <input
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="form-control custom-input"
            type="text"
            style={{ color: "white" }}
          />
          <input
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="form-control custom-input"
            type="text"
            style={{ color: "white" }}
          />
          {editId === -1 ? (
            <button
              className="btn custom-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Adding..." : "Submit"}
            </button>
          ) : (
            <button className="btn custom-btn" onClick={handleUpdate}>
              Update
            </button>
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="row mt-3">
        <h3 className="text-light">Tasks</h3>
        {loading && <p className="text-light">Loading tasks...</p>}
        {!loading && todos.length === 0 && (
          <p className="text-light">No tasks found.</p>
        )}
        <ul className="list-group">
          {todos.map((item) => (
            <TodoItem
              key={item._id}
              todo={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

// Component to display messages (success or error)
function Message({ message, type }) {
  return <p className={`text-${type}`}>{message}</p>;
}

// Component for rendering a single todo item
function TodoItem({ todo, onEdit, onDelete }) {
  return (
    <li className="list-group-item custom-item d-flex justify-content-between align-items-center my-2">
      <div className="d-flex flex-column text-start me-2">
        <span className="fw-bold">{todo.title}</span>
        <span>{todo.description}</span>
      </div>
      <div className="form-group d-flex gap-2">
        <button className="btn btn-warning custom-btn" onClick={() => onEdit(todo)}>
          Edit
        </button>
        <button
          className="btn btn-danger custom-btn"
          onClick={() => onDelete(todo._id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
