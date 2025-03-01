// src/utils/authService.js

// Mock function to simulate server-side authentication
async function authenticate(username, password) {
    // Simulate a server response delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    // Mock user data for demonstration purposes
    const mockUserDatabase = {
      teacher: { username: 'teacher@gmail.com', role: 'teacher', password: 'teacher123' },
      hr: { username: 'hr@gmail.com', role: 'hr', password: 'hr123' },
      mentor: { username: 'mentrol@gmail.com', role: 'mentor', password: 'mentor123' },
      admin: { username: 'admin@gmail.com', role: 'admin', password: 'admin123' },
    };
  
    // Check if username exists and password matches
    const user = Object.values(mockUserDatabase).find(
      (u) => u.username === username && u.password === password
    );
  
    if (!!user) {
      return { username: user.username, role: user.role };
    }
  
    // Throw an error if authentication fails
    throw new Error('Invalid credentials');
  }
  
  // Export the login function for use in the login component
  export async function login(username, password) {
    return await authenticate(username, password);
  }
  