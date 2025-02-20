export const addBoardFunction = async(formData)=>{
    try {
        const response = await fetch('https://sisyabackend.in/rkadmin/add_board', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({formData }),
        });
    
        const result = await response.json();
    
       return  result;
      } catch (error) {
       // setLoading(false); // Stop loading
      //  console.log("Error updating/adding board:", error);
      //  setErrorMessage('An error occurred. Please try again.');
      }

}

