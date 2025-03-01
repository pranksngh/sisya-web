export const fetchSalesmenData = async () => {
    try {
      const response = await fetch('https://sisyabackend.in/rkadmin/list_salesmen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
     return result;
    } catch (error) {
      console.error('Error fetching salesmen:', error);
    }
  };