const API_URL = 'https://sisyabackend.in/rkadmin/login';
const API_URL_Teacher = 'https://sisyabackend.in/teacher/login';
const API_URL_Mentor = 'https://sisyabackend.in/teacher/sales/login';

export const login = async (user, password) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user, password }),
      
    });

    if (!response.ok) {
      console.log('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', "admin");
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};

export const teacherlogin = async (phone, password) => {
  try {
    const response = await fetch(API_URL_Teacher, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, password }),
      
    });

    if (!response.ok) {
      console.log('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', "teacher");
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};

export const mentorlogin = async (email, password) => {
  try {
    const response = await fetch(API_URL_Mentor, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      
    });

    if (!response.ok) {
      console.log('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', "mentor");
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  return token !== null;
};
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
