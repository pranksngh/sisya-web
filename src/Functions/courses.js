export const fetchCoursesList = async () => {
    try{
        const courseResponse = await fetch('https://sisyabackend.in/rkadmin//get_all_courses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
         
          });
          const courseResult = await courseResponse.json();

          console.log(courseResult);
      
          return courseResult;
    }catch(error){
     console.log("fetch course error", error);
    }

  
  };