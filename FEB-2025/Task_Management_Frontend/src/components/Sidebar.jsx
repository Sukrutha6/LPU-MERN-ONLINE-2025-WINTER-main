import React from "react";
import "./Sidebar.css";
import { CgNotes } from "react-icons/cg";
import { MdLabelImportant } from "react-icons/md";
import { FaCheckDouble } from "react-icons/fa";
import { TbNotebookOff } from "react-icons/tb";
import { Link } from "react-router";

const Sidebar = ({currUser, handleLogout}) => {
  const data = [
    {
      title: "All Tasks",
      icon: <CgNotes />,
      link:"/",
    },
    {
      title: "Important Tasks",
      icon: <MdLabelImportant />,
      link:"/importantTasks",
    },
    {
      title: "Completed Tasks",
      icon: <FaCheckDouble />,
      link:"/completedTasks",
    },
    {
      title: "Incomplete Tasks",
      icon: <TbNotebookOff />,
      link:"/incompleteTasks",
    },
  ];
  return (
    <div className="main">
      <div className="user">Hello, {currUser.fullName}!</div>
      <div className="email">{currUser.email}</div>
      
        {data.map((item,i) => (
          <div className="taskStatus" key={item.title}>
          <Link to= {item.link}  className="item">{item.icon} {item.title}</Link>
          </div>
        ))}
     
      <button onClick={handleLogout} className="btnn">Logout</button>
    </div>
  );
};

export default Sidebar;
