import { useState } from "react";
import "./taskList.css"; //ES6
import PropTypes from "prop-types";
// require("./taskList.css") // CJS

// re-render === re-run the function
const TaskList = ({ list, getData, filterObj, title }) => {
    // HW, TODO : add prop validation
    const [editTask, setEditTask] = useState(-1);
    const [editObject, setEditObject] = useState({});
    // console.log("🟡 : editObject:", editObject);
    // console.log("🟡 : editTask:", editTask); // 2

    const handleEditField = (key, value) => {
        // console.log(key, value);
        setEditObject((prev) => {
            const newObj = { ...prev };
            newObj[key] = value;
            return newObj;
        });
    };

    const handleEditData = async () => {
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks/${editObject._id}`, {
            method: "PATCH",
            body: JSON.stringify(editObject),
            headers: {
                "content-type": "application/json",
            },
        });
        const respObj = await resp.json();
        if (respObj.status === "success") {
            console.log("success :: updated");
            handleCancel();
            getData();
        } else {
            alert(respObj.message);
        }
    };

    const handleCancel = () => {
        setEditTask(-1);
        setEditObject({});
    };

    const handleDelete = async (taskId) => {
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks/${taskId}`, {
            method: "DELETE",
        });
        console.log("🟡 : resp:", resp);
        if (resp.status === 204) {
            console.log("success :: deleted");
            getData();
        } else {
            alert("Error in delete");
        }
    };

    const filteredList = list.filter((elem) => {
        if (elem.status === filterObj.status) return true;
        else return false;
    });

    const handleMarkAsDone = async (taskId) => {
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify({
                status: "done",
            }),
            headers: {
                "content-type": "application/json",
            },
        });
        const respObj = await resp.json();
        if (respObj.status === "success") {
            console.log("success :: updated");
            getData();
        } else {
            alert(respObj.message);
        }
    };

    return (
        <div className="task-list-main">
            <h3 className="task-list-title">{title}</h3>
            <div className="task-list-task-container">
                {filteredList.map((elem, idx) => {
                    // key :: best: unique property on your own, good: index, worst: nothing as key
                    return (
                        <div key={elem._id} className="task-card">
                            <h5>{idx}</h5>
                            <p>{elem.workTitle}</p> 
                            <p>{elem.taskTitle}</p>
                            {/* short hand of if - else  */}
                            {/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator */}
                            {idx === editTask ? (
                                <div>
                                    <label>Assignee</label>
                                    <input
                                        value={editObject.assignee}
                                        onChange={(e) => {
                                            handleEditField("assignee", e.target.value);
                                        }}
                                    />
                                    {/* controlled  input*/}
                                </div>
                            ) : (
                                <p>{elem.assignee}</p>
                            )}
                            <p>{elem.assignor}</p>
                            <p>{elem.deadline}</p>
                            {idx === editTask ? (
                                <div>
                                    <label>Priority</label>
                                    <select
                                        name="priority"
                                        value={editObject.priority}
                                        onChange={(e) => {
                                            handleEditField("priority", e.target.value);
                                        }}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="low">Low</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                    {/* controlled  input*/}
                                </div>
                            ) : (
                                <p>{elem.priority}</p>
                            )}

                            <p>{elem.status}</p>
                            {idx === editTask ? (
                                <div>
                                    <button onClick={handleEditData}>Submit Changes</button>
                                    <button onClick={handleCancel}>Cancel</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setEditObject(elem);
                                        setEditTask(idx);
                                    }}
                                >
                                    Edit
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    handleDelete(elem._id);
                                }}
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    handleMarkAsDone(elem._id);
                                }}
                            >
                                Mark as Done
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// https://legacy.reactjs.org/docs/typechecking-with-proptypes.html
TaskList.propTypes = {
    list: PropTypes.array,
    getData: PropTypes.func,
};

export default TaskList;