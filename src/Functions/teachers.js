export  const fetchTeacherList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const result = await response.json();

     return result;
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };