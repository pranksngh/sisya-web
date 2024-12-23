export const fetchPurchases = async () => {
    const purchaseResponse = await fetch('https://sisyabackend.in/rkadmin/get_purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const purchaseResult = await purchaseResponse.json();

     return purchaseResult;
  };

  