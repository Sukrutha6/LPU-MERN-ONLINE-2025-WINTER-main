import React from 'react'
import { Link } from 'react-router';

const Navbar = ({currUser,handleLogout}) => {
  return (
    <>
  <nav className='navbar-nav'>
    <header>
    <ul>
      <span className='navbar-span'>Hello, {currUser.fullName}!</span>
      <Link to="/" className='navbar-link'>Home</Link>
      <Link to="/login" className='navbar-link'>Login</Link>
      <Link to="/signup" className='navbar-link'>SignUp</Link>
      <Link to="/tasks" className='navbar-link'>Tasks</Link>
      <button onClick={handleLogout} className='navbar-button'>Logout</button>
    </ul>
    </header> 

  </nav>
  </>
  )
}

export default Navbar