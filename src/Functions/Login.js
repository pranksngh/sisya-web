const API_URL = 'https://sisyabackend.in/rkadmin/login';
const API_URL_Teacher = 'https://sisyabackend.in/teacher/login';
const API_URL_Mentor = 'https://sisyabackend.in/teacher/sales/login';
const API_URL_HR = 'https://sisyabackend.in/rkadmin/hr/login';

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
   // console.log("my data is ",data);
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
      if(data.mentor.isActive){
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', "teacher");
      localStorage.setItem('user', JSON.stringify(data));
      }
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

export const hrlogin = async (email, password) => {
  try {
    const response = await fetch(API_URL_HR, {
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
      localStorage.setItem('role', "hr");
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};


export const logout = async () => {
  const user = getUser(); 
  const role = localStorage.getItem("role");

  console.log("Logging out...");
  console.log("User Role:", role);
  console.log("User Data:", user);

  if (role === "teacher" && user?.mentor?.id) {
    console.log("Sending logout request for mentorId:", user.mentor.id);

    try {
      const response = await fetch(
        "https://sisyabackend.in/teacher/mark_logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mentorId: user.mentor.id }),
        }
      );

      const result = await response.json();
      console.log("Logout API Response:", result);
    } catch (error) {
      console.error("Error marking logout:", error);
    }
  } else {
    console.log("No logout request needed.");
  }

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");

  console.log("User logged out successfully.");
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
