const fetchCourses = async () => {
    const courseResponse = await fetch('https://sisyabackend.in/rkadmin/get_purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const courseResult = await courseResponse.json();

     return courseResult;
  };