export const fetchDoubtList = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/all_doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
     return result;
      
    } catch (error) {
    //  console.error('Error fetching doubts:', error);
    }
  };