import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EnrolledCoursesData = () => {
  const [courses, setCourses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  const navigate = useNavigate();

  // Sample data fetch function (replace with your API call)
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://sisyabackend.in/teacher/get_all_courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
       
      });
      const result = await response.json();
      if (result.success) {
        setCourses(result.bigCourses);
        setFilteredData(result.bigCourses);
      }
    };

    fetchData();
  }, []);

  // Filter data based on searchTerm
  useEffect(() => {
    const filtered = courses.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, courses]);

  // Handle page change
  const handlePageChange = (event) => {
    setCurrentPage(Number(event.target.value));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1 when items per page changes
  };

  // Pagination logic: get the current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Format date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // Redirect to Course Detail Page
  const handleViewCourseDetails = (courseId) => {
    navigate(`../course-details`, { state: { courseId } });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Courses</h2>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search courses by name"
          style={{
            padding: '8px',
            width: '250px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '10px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Items per page selection */}
      <div style={{ marginBottom: '20px' }}>
        <label>Items per page:</label>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          style={{
            marginLeft: '10px',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',  // Add light border to separate rows
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#f9f9f9',
              color: '#333',
              fontWeight: 'bold',
            }}
          >
            <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Course Type</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Grade</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Start Date</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>End Date</th>
            {/* <th style={{ padding: '10px', textAlign: 'left' }}>Enrolled Students</th> */}
            <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => {
            return (
              <tr
                key={item.id}
                onClick={() => handleViewCourseDetails(item.id)} // Trigger function on row click
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : 'white', // Alternate row colors
                }}
              >
                <td style={{ padding: '10px' }}>{item.id}</td>
                <td style={{ padding: '10px' }}>{item.isLongTerm ? 'Long Term' : 'Short Term'}</td>
                <td style={{ padding: '10px' }}>
                  <span
                    style={{
                      color: '#1976d2',
                      textDecoration: 'underline',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.name}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{item.grade}</td>
                <td style={{ padding: '10px' }}>{formatDate(item.startDate)}</td>
                <td style={{ padding: '10px' }}>{formatDate(item.endDate)}</td>
                {/* <td style={{ padding: '10px' }}>{item.enrolledStudents}</td> */}
                <td
                  style={{
                    padding: '10px',
                    color: item.isActive ? 'green' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  {item.isActive ? 'Active' : 'Inactive'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: '20px' }}>
        <span>Page: </span>
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '5px 10px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Prev
        </button>
        <span style={{ margin: '0 10px' }}>{currentPage}</span>
        <button
          onClick={() => setCurrentPage(Math.min(Math.ceil(filteredData.length / itemsPerPage), currentPage + 1))}
          disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
          style={{
            padding: '5px 10px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EnrolledCoursesData;
