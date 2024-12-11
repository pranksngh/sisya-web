const sidebarConfig = [
    {
      label: "Dashboard",
      icon: "Dashboard",
      path: "/dashboard/admin",
      roles: ["admin"], // Accessible to both
      expandable: false,
    },
    {
        label: "Dashboard",
        icon: "Dashboard",
        path: "/dashboard/teacher",
        roles: ["teacher"], // Accessible to both
        expandable: false,
      },
    {
      label: "Boards",
      icon: "PieChart",
      path: "/dashboard/boards",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Subjects",
      icon: "BarChart",
      path: "/dashboard/subjects",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Students",
      icon: "Group",
      roles: ["admin"], // Only for admin
      expandable: true,
      subItems: [
        { label: "List Students", path: "students" },
        { label: "Add Student", path: "addStudent" },
      ],
    },
    {
      label: "Teachers",
      icon: "AccountCircle",
      roles: ["admin"], // Only for admin
      expandable: true,
      subItems: [
        { label: "List Teachers", path: "teachers" },
        { label: "Add Teacher", path: "addTeacher" },
      ],
    },
    {
      label: "Courses",
      icon: "BarChart",
      roles: ["admin"], // Only for admin
      expandable: true,
      subItems: [
        { label: "List Courses", path: "courses" },
        { label: "Add Course", path: "addCourse" },
      ],
    },
    {
      label: "Reports",
      icon: "BarChart",
      roles: ["admin"], // Only for admin
      expandable: true,
      subItems: [
        { label: "Student Report", path: "student-report" },
        { label: "Teacher Report", path: "teacher-report" },
      ],
    },
    {
      label: "Purchases",
      icon: "ShoppingCart",
      path: "course-purchase-list",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Sales Mentor",
      icon: "AccountCircle",
      path: "sales-mentor-list",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Lead Manager",
      icon: "Settings",
      path: "lead-manager",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Doubts",
      icon: "Chat",
      path: "doubts",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Enquiries",
      icon: "Notifications",
      path: "enquiry",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Banners",
      icon: "CalendarToday",
      path: "banners",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Push Notification",
      icon: "Notifications",
      path: "pushNotification",
      roles: ["admin"], // Only for admin
      expandable: false,
    },
    {
      label: "Assigned Courses",
      icon: "Notifications",
      path: "enrolled-courses",
      roles: ["teacher"], // Only for admin
      expandable: false,
    },
    {
      label: "Add Class",
      icon: "Notifications",
      path: "add-class",
      roles: ["teacher"], // Only for admin
      expandable: false,
    },
    {
      label: "Chats",
      icon: "Notifications",
      path: "Chats",
      roles: ["teacher"], // Only for admin
      expandable: false,
    },
    {
      label: "Group Chats",
      icon: "Notifications",
      path: "group-chat",
      roles: ["teacher"], // Only for admin
      expandable: false,
    },
    {
      label: "Doubts",
      icon: "Notifications",
      path: "doubtscreen",
      roles: ["teacher"], // Only for admin
      expandable: false,
    },
    
  ];
  
  export default sidebarConfig;
  