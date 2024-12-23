export const fetchStudentList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/get_recent_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 1,
          amount: 10000 // Adjust the amount as needed
        })
      });
      const result = await response.json();

      return result;

    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  };