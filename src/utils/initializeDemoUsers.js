export function initializeDemoUsers() {
  const existingUsers = localStorage.getItem('users');
  if (existingUsers) return;

  const demoUsers = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'student@demo.com',
      password: 'password',
      role: 'student'
    },
    {
      id: 2,
      name: 'Mr. Smith',
      email: 'teacher@demo.com',
      password: 'password',
      role: 'teacher'
    },
    {
      id: 3,
      name: 'Mrs. Johnson',
      email: 'parent@demo.com',
      password: 'password',
      role: 'parent'
    },
    {
      id: 4,
      name: 'Dr. Brown',
      email: 'tutor@demo.com',
      password: 'password',
      role: 'tutor'
    },
    {
      id: 5,
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password',
      role: 'admin'
    }
  ];

  localStorage.setItem('users', JSON.stringify(demoUsers));

  // Initialize demo tutors
  const existingTutors = localStorage.getItem('tutors');
  if (!existingTutors) {
    const demoTutors = [
      {
        id: 1,
        name: 'Dr. Sarah Wilson',
        email: 'sarah.wilson@tutor.com',
        qualification: 'PhD Mathematics',
        subjects: 'Mathematics, Physics',
        rate: 75,
        availability: 'Mon-Fri 4pm-8pm',
        bio: 'Experienced mathematics tutor with 10+ years helping students excel.',
        rating: 4.8
      },
      {
        id: 2,
        name: 'Prof. Michael Chen',
        email: 'michael.chen@tutor.com',
        qualification: 'MSc Chemistry',
        subjects: 'Chemistry, Science',
        rate: 60,
        availability: 'Weekends 10am-6pm',
        bio: 'Chemistry professor passionate about making science accessible.',
        rating: 4.9
      },
      {
        id: 3,
        name: 'Ms. Emily Davis',
        email: 'emily.davis@tutor.com',
        qualification: 'BA English Literature',
        subjects: 'English, Literature',
        rate: 50,
        availability: 'Tue-Thu 3pm-7pm',
        bio: 'English tutor specializing in literature and writing skills.',
        rating: 4.7
      }
    ];
    localStorage.setItem('tutors', JSON.stringify(demoTutors));
  }
}
