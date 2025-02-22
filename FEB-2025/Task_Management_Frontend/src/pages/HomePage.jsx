import React from 'react'
// import Navbar from '../components/Navbar';
import "./home.css";
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router';

const HomePage = ({currUser,handleLogout}) => {
  return (
   <>
   {/* <Navbar currUser={currUser} handleLogout={handleLogout}/>
   <h1>homepage</h1> */}
   <div className="flex">
    

   <div className="sidebar"><Sidebar currUser={currUser} handleLogout={handleLogout}/></div>
   <div className="workspace">
    <Outlet/>
   </div>
   </div>
   </>
  )
}

export default HomePage 