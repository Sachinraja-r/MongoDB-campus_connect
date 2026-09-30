import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AuthorizedUser } from '../models/AuthorizedUser.js';
import { Club } from '../models/Club.js';
import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { Announcement } from '../models/Announcement.js';
import { HeroSlide } from '../models/HeroSlide.js';
import { QrLocation } from '../models/QrLocation.js';
import { PresenceSession } from '../models/PresenceSession.js';
import { PresenceEvent } from '../models/PresenceEvent.js';
import { Friendship } from '../models/Friendship.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSettings } from '../models/SystemSettings.js';

export const seedDatabase = async () => {
  console.log('[Seed] Starting KIOT CampusConnect database population...');

  // 1. System Settings
  await SystemSettings.deleteMany({});
  const settings = await SystemSettings.create({
    institutionName: 'Knowledge Institute of Technology',
    campusAddress: 'KIOT-Campus, NH544, Kakapalayam, Salem, Tamil Nadu – 637504',
    allowedDomain: 'kiot.ac.in',
    enforceDomainRestriction: true,
    allowDemoBypass: true,
    registrationEnabled: true,
    qrPresenceEnabled: true,
    maintenanceMode: false,
  });

  // 2. Clear previous data
  await AuthorizedUser.deleteMany({});
  await User.deleteMany({});
  await Club.deleteMany({});
  await Event.deleteMany({});
  await EventRegistration.deleteMany({});
  await Announcement.deleteMany({});
  await HeroSlide.deleteMany({});
  await QrLocation.deleteMany({});
  await PresenceSession.deleteMany({});
  await PresenceEvent.deleteMany({});
  await Friendship.deleteMany({});
  await Notification.deleteMany({});
  await AuditLog.deleteMany({});

  // 3. Authorized Users list
  const authorizedUsersData = [
    // Developer / Super Admin
    {
      name: 'Dr. P. Rajendran',
      email: 'admin@kiot.ac.in',
      role: 'developer',
      department: 'Administration',
      status: 'active',
      phone: '+91 94432 00001',
      notes: 'Super Admin and Lead System Architect',
    },
    // Faculty Mentors
    {
      name: 'Dr. K. Rajesh',
      email: 'mentor.rajesh@kiot.ac.in',
      role: 'mentor',
      department: 'CSE',
      status: 'active',
      phone: '+91 98421 11234',
      notes: 'Associate Professor & Senior Faculty Mentor',
    },
    {
      name: 'Prof. M. Kavitha',
      email: 'faculty.kavitha@kiot.ac.in',
      role: 'faculty',
      department: 'AI & DS',
      status: 'active',
      phone: '+91 98421 22345',
      notes: 'Assistant Professor, AI & DS',
    },
    // Club Leaders
    {
      name: 'Priya Dharshini S',
      email: 'priya.club@kiot.ac.in',
      registerNumber: '2K23CSE089',
      role: 'club_admin',
      department: 'CSE',
      year: 3,
      section: 'A',
      status: 'active',
      phone: '+91 98421 33456',
      notes: 'President - KIOT Coding Club',
    },
    {
      name: 'Arun Kumar M',
      email: 'arun.robotics@kiot.ac.in',
      registerNumber: '2K23ECE045',
      role: 'club_admin',
      department: 'ECE',
      year: 3,
      section: 'B',
      status: 'active',
      phone: '+91 98421 44567',
      notes: 'Lead Coordinator - Robotics & IoT Club',
    },
    // Students (including the demo mentee cohort)
    {
      name: 'Sachin V',
      email: 'sachin.24cse167@kiot.ac.in',
      registerNumber: '2K24CSE167',
      role: 'student',
      department: 'CSE',
      year: 2,
      section: 'B',
      status: 'active',
      phone: '+91 97890 12345',
      notes: 'Demo Student - Full Stack & Algorithms Enthusiast',
    },
    {
      name: 'Dharun S',
      email: 'dharun.24cse101@kiot.ac.in',
      registerNumber: '2K24CSE101',
      role: 'student',
      department: 'CSE',
      year: 2,
      section: 'A',
      status: 'active',
      phone: '+91 97890 23456',
      notes: 'Assigned Mentee Cohort A',
    },
    {
      name: 'Harini R',
      email: 'harini.24cse112@kiot.ac.in',
      registerNumber: '2K24CSE112',
      role: 'student',
      department: 'CSE',
      year: 2,
      section: 'A',
      status: 'active',
      phone: '+91 97890 34567',
      notes: 'Assigned Mentee Cohort A',
    },
    {
      name: 'Karthikeyan P',
      email: 'karthik.24cse145@kiot.ac.in',
      registerNumber: '2K24CSE145',
      role: 'student',
      department: 'CSE',
      year: 2,
      section: 'B',
      status: 'active',
      phone: '+91 97890 45678',
      notes: 'Assigned Mentee Cohort A',
    },
    {
      name: 'Swetha M',
      email: 'swetha.24cse190@kiot.ac.in',
      registerNumber: '2K24CSE190',
      role: 'student',
      department: 'CSE',
      year: 2,
      section: 'C',
      status: 'active',
      phone: '+91 97890 56789',
      notes: 'Assigned Mentee Cohort A',
    },
    {
      name: 'Vimal Raj K',
      email: 'vimal.24it056@kiot.ac.in',
      registerNumber: '2K24IT056',
      role: 'student',
      department: 'IT',
      year: 2,
      section: 'A',
      status: 'active',
      phone: '+91 97890 67890',
      notes: 'IT Department Student Rep',
    },
    {
      name: 'Ananya S',
      email: 'ananya.24aids022@kiot.ac.in',
      registerNumber: '2K24AIDS022',
      role: 'student',
      department: 'AI & DS',
      year: 2,
      section: 'A',
      status: 'active',
      phone: '+91 97890 78901',
      notes: 'AI & DS Student Member',
    },
  ];

  await AuthorizedUser.insertMany(authorizedUsersData);

  // 4. Create User documents (all demo users get default password: kiot@2026)
  const DEFAULT_PASSWORD = 'kiot@2026';
  const defaultPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const users = [];
  for (const item of authorizedUsersData) {
    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(item.name)}`;
    const user = await User.create({
      name: item.name,
      email: item.email,
      registerNumber: item.registerNumber,
      role: item.role,
      department: item.department,
      year: item.year || 1,
      section: item.section || 'A',
      status: item.status,
      phone: item.phone,
      avatar,
      passwordHash: defaultPasswordHash,
      bio:
        item.role === 'student'
          ? `B.E. ${item.department} Student at Knowledge Institute of Technology. Interested in web architecture, algorithmic coding, and open-source campus initiatives.`
          : `${item.notes} at Knowledge Institute of Technology.`,
      skills:
        item.role === 'student'
          ? ['React', 'Node.js', 'Python', 'Data Structures', 'MongoDB', 'Tailwind CSS']
          : ['Curriculum Design', 'Mentorship', 'Cloud Computing', 'Research & Development'],
      interests: ['Hackathons', 'Open Source', 'Competitive Programming', 'Robotics', 'Campus Events'],
      achievements:
        item.role === 'student'
          ? ['Finalist - Smart India Hackathon 2025', '1st Place - KIOT Inter-Department Coding Sprint']
          : ['Best Faculty Mentor Award 2024-25', 'Published 14 Scopus Indexed Research Papers'],
      certifications: ['AWS Certified Cloud Practitioner', 'MongoDB Certified Associate Developer'],
      privacySettings: {
        showPresenceToFriends: true,
        showSkills: true,
        allowFriendRequests: true,
      },
    });
    users.push(user);
  }

  const userMap = new Map();
  users.forEach((u) => userMap.set(u.email, u));

  // 5. Assign Mentor: Dr. K. Rajesh -> cohort of 5 mentees
  const mentorRajesh = userMap.get('mentor.rajesh@kiot.ac.in');
  const menteeEmails = [
    'dharun.24cse101@kiot.ac.in',
    'harini.24cse112@kiot.ac.in',
    'karthik.24cse145@kiot.ac.in',
    'sachin.24cse167@kiot.ac.in',
    'swetha.24cse190@kiot.ac.in',
  ];

  for (const email of menteeEmails) {
    const mentee = userMap.get(email);
    if (mentee) {
      mentee.assignedMentor = mentorRajesh._id;
      await mentee.save();
    }
  }

  // 6. QR Monitored Locations (Official KIOT Campus reference: NH544, Kakapalayam, Salem)
  // Base coordinates around 11.5997, 77.9868
  const locationSeeds = [
    {
      name: 'Seminar Hall A',
      code: 'SEMINAR_HALL_A',
      locationType: 'Seminar Hall',
      building: 'Main Academic Block',
      floor: '2nd Floor',
      latitude: 11.5997,
      longitude: 77.9868,
      description: 'Air-conditioned seminar auditorium equipped with high-definition AV and smart podium.',
    },
    {
      name: 'Advanced Computer Lab 3',
      code: 'CSE_LAB_3',
      locationType: 'Computer Laboratory',
      building: 'IT & Computing Block',
      floor: '1st Floor',
      latitude: 11.5992,
      longitude: 77.9873,
      description: 'High-performance computing laboratory configured for Linux, AI development, and competitive coding.',
    },
    {
      name: 'Central Auditorium',
      code: 'AUDITORIUM_CENTRAL',
      locationType: 'Auditorium',
      building: 'Auditorium Complex',
      floor: 'Ground Floor',
      latitude: 11.6003,
      longitude: 77.9864,
      description: '1,500-capacity state-of-the-art auditorium for symposiums, cultural fests, and conferences.',
    },
    {
      name: 'Central Digital Library',
      code: 'LIBRARY_MAIN',
      locationType: 'Library',
      building: 'Knowledge Resource Centre',
      floor: 'Ground Floor',
      latitude: 11.5995,
      longitude: 77.9859,
      description: 'Digital research hub with access to IEEE, ACM, Springer e-journals, and silent study zones.',
    },
    {
      name: 'Innovation & Incubation Centre',
      code: 'INNOVATION_CENTRE',
      locationType: 'Innovation Center',
      building: 'Tech Innovation Park',
      floor: '3rd Floor',
      latitude: 11.6006,
      longitude: 77.9877,
      description: 'Incubation laboratory providing 3D printers, IoT hardware kits, and startup mentoring.',
    },
    {
      name: 'Campus Main Entrance & Reception',
      code: 'CAMPUS_MAIN_GATE',
      locationType: 'Campus Entrance',
      building: 'Main Gate Complex',
      floor: 'Ground Floor',
      latitude: 11.5986,
      longitude: 77.9861,
      description: 'Official entrance check-in on Salem-Kochi Highway (NH544).',
    },
  ];

  const qrLocations = [];
  for (const loc of locationSeeds) {
    const qrIdentifier = `KIOT_LOC_${loc.code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrIdentifier, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: { dark: '#800000', light: '#FFFFFF' }, // KIOT Maroon
    });

    const createdLoc = await QrLocation.create({
      ...loc,
      qrIdentifier,
      qrCodeDataUrl,
      status: 'active',
      currentOccupancy: 0,
    });
    qrLocations.push(createdLoc);
  }

  const seminarHall = qrLocations.find((l) => l.code === 'SEMINAR_HALL_A');

  // 7. Presence Sessions for students
  for (const user of users) {
    if (user.role === 'student') {
      // In demo scenario: Sachin V is currently IN at Seminar Hall A!
      const isSachin = user.email === 'sachin.24cse167@kiot.ac.in';
      const status = isSachin ? 'IN' : 'OUT';
      const enteredAt = isSachin ? new Date(Date.now() - 45 * 60 * 1000) : null;

      await PresenceSession.create({
        student: user._id,
        status,
        location: isSachin ? seminarHall._id : null,
        locationName: isSachin ? seminarHall.name : null,
        enteredAt,
        presenceSource: 'QR',
      });

      if (isSachin) {
        seminarHall.currentOccupancy += 1;
        await seminarHall.save();

        await PresenceEvent.create({
          student: user._id,
          location: seminarHall._id,
          locationName: seminarHall.name,
          action: 'CHECK_IN',
          timestamp: enteredAt,
          presenceSource: 'QR',
        });
      }
    }
  }

  // 8. Clubs
  const priyaUser = userMap.get('priya.club@kiot.ac.in');
  const arunUser = userMap.get('arun.robotics@kiot.ac.in');
  const sachinUser = userMap.get('sachin.24cse167@kiot.ac.in');
  const dharunUser = userMap.get('dharun.24cse101@kiot.ac.in');
  const hariniUser = userMap.get('harini.24cse112@kiot.ac.in');

  const club1 = await Club.create({
    name: 'KIOT Coding Club',
    code: 'KCC',
    department: 'CSE',
    category: 'Technical',
    description:
      'Premier competitive programming and software engineering community at KIOT. We conduct weekly algorithms workshops, hackathons, and mock technical interviews.',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
    facultyAdvisor: mentorRajesh._id,
    clubLeader: priyaUser._id,
    coordinators: [sachinUser._id],
    members: [
      { user: priyaUser._id, clubRole: 'Club Leader' },
      { user: sachinUser._id, clubRole: 'Coordinator' },
      { user: dharunUser._id, clubRole: 'Member' },
      { user: hariniUser._id, clubRole: 'Member' },
    ],
    achievements: [
      { title: 'Top 10 in ACM-ICPC Amritapuri Regionals 2024', year: '2024' },
      { title: 'Best Technical Club Trophy - KIOT Annual Awards', year: '2025' },
    ],
  });

  const club2 = await Club.create({
    name: 'Robotics & IoT Innovation Club',
    code: 'RIOC',
    department: 'ECE',
    category: 'Innovation',
    description:
      'Hands-on engineering guild focusing on autonomous drones, embedded systems, microcontrollers (ESP32/STM32), ROS, and smart hardware prototypes.',
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80',
    facultyAdvisor: userMap.get('faculty.kavitha@kiot.ac.in')._id,
    clubLeader: arunUser._id,
    members: [
      { user: arunUser._id, clubRole: 'Club Leader' },
      { user: sachinUser._id, clubRole: 'Member' },
    ],
  });

  const club3 = await Club.create({
    name: 'Google Developer Student Club (GDSC KIOT)',
    code: 'GDSC-KIOT',
    department: 'IT',
    category: 'Technical',
    description:
      'University-based community group supported by Google Developers. We help students bridge theory and practice through Android, Google Cloud, and Web technologies.',
    logo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80',
    facultyAdvisor: mentorRajesh._id,
    clubLeader: priyaUser._id,
    members: [{ user: priyaUser._id, clubRole: 'Club Leader' }],
  });

  const club4 = await Club.create({
    name: 'KIOT Entrepreneurship Development Cell',
    code: 'EDC-KIOT',
    department: 'Institution',
    category: 'Innovation',
    description:
      'Fostering entrepreneurial mindset, startup incubation, angel funding preparation, and patent assistance for student innovators at KIOT.',
    logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80',
    facultyAdvisor: mentorRajesh._id,
    members: [],
  });

  // 9. Events
  const hackathonDate = new Date();
  hackathonDate.setDate(hackathonDate.getDate() + 12);

  const event1 = await Event.create({
    title: 'Campus Hackathon 2026: Smart Tamil Nadu Innovation Challenge',
    category: 'Hackathon',
    poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
    description:
      'KIOT’s flagship 36-hour non-stop hackathon inviting innovative software and IoT solutions for Agriculture, Healthcare, Smart Mobility, and Education. Grand cash prizes, incubation support, and direct mentor reviews.',
    organizerType: 'club',
    club: club1._id,
    department: 'CSE',
    facultyCoordinator: mentorRajesh._id,
    studentCoordinator: priyaUser._id,
    date: hackathonDate,
    startTime: '08:30 AM',
    endTime: '08:30 PM (Next Day)',
    venue: 'Central Auditorium & Computer Labs 1-4',
    eligibility: 'All Engineering & Technology Students (Teams of 2-4)',
    maxParticipants: 180,
    registrationDeadline: new Date(hackathonDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    prizes: '₹25,000 (1st Prize) | ₹15,000 (2nd Prize) | ₹10,000 (3rd Prize)',
    isFeatured: true,
    registrationCount: 1,
    tags: ['Hackathon', 'AI', 'FullStack', 'CashPrize'],
    createdBy: priyaUser._id,
  });

  const codeSprintDate = new Date();
  codeSprintDate.setDate(codeSprintDate.getDate() + 5);

  const event2 = await Event.create({
    title: 'CodeSprint 4.0: Algorithmic Battle',
    category: 'Coding',
    poster: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80',
    description:
      'Speed coding, data structures, and dynamic programming showdown. Test your algorithmic thinking under strict time complexity constraints.',
    organizerType: 'club',
    club: club1._id,
    department: 'CSE',
    facultyCoordinator: mentorRajesh._id,
    studentCoordinator: sachinUser._id,
    date: codeSprintDate,
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    venue: 'Advanced Computer Lab 3',
    eligibility: 'Open to all departments & all years',
    maxParticipants: 90,
    registrationDeadline: new Date(codeSprintDate.getTime() - 24 * 60 * 60 * 1000),
    prizes: '₹5,000 + Merit Certificates',
    isFeatured: true,
    registrationCount: 1,
    tags: ['CompetitiveProgramming', 'DataStructures', 'Algorithms'],
    createdBy: priyaUser._id,
  });

  const workshopDate = new Date();
  workshopDate.setDate(workshopDate.getDate() + 8);

  const event3 = await Event.create({
    title: 'Agentic AI & Generative Systems Workshop',
    category: 'Workshop',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    description:
      'Hands-on workshop exploring LLM tool-calling, autonomous agent orchestration, vector embeddings, and LangChain integration with real-world deployments.',
    organizerType: 'department',
    department: 'AI & DS',
    facultyCoordinator: userMap.get('faculty.kavitha@kiot.ac.in')._id,
    date: workshopDate,
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    venue: 'Seminar Hall A',
    eligibility: 'Pre-requisite: Basic Python knowledge',
    maxParticipants: 120,
    registrationDeadline: new Date(workshopDate.getTime() - 24 * 60 * 60 * 1000),
    prizes: 'Official Course Completion Certificate & GitHub Project Kit',
    isFeatured: true,
    registrationCount: 0,
    tags: ['GenerativeAI', 'DeepLearning', 'Python'],
    createdBy: userMap.get('faculty.kavitha@kiot.ac.in')._id,
  });

  const roboticsDate = new Date();
  roboticsDate.setDate(roboticsDate.getDate() + 16);

  const event4 = await Event.create({
    title: 'RoboClash & Autonomous Line Follower Arena',
    category: 'Competition',
    poster: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&q=80',
    description:
      'National-level robotics duel featuring robo-soccer, obstacle evasion arena, and high-speed line followers.',
    organizerType: 'club',
    club: club2._id,
    department: 'ECE',
    facultyCoordinator: mentorRajesh._id,
    studentCoordinator: arunUser._id,
    date: roboticsDate,
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    venue: 'Indoor Sports Arena & Innovation Lab',
    eligibility: 'Inter-College & Intra-College Engineering Teams',
    maxParticipants: 60,
    registrationDeadline: new Date(roboticsDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    prizes: '₹15,000 Cash Pool + Robot Component Kits',
    isFeatured: false,
    registrationCount: 0,
    tags: ['Robotics', 'Hardware', 'Arduino'],
    createdBy: arunUser._id,
  });

  // 10. Pre-register Sachin for the Hackathon & CodeSprint
  await EventRegistration.create({
    event: event1._id,
    student: sachinUser._id,
    registerNumber: sachinUser.registerNumber,
    studentName: sachinUser.name,
    department: sachinUser.department,
    year: sachinUser.year,
    section: sachinUser.section,
    status: 'confirmed',
  });

  await EventRegistration.create({
    event: event2._id,
    student: dharunUser._id,
    registerNumber: dharunUser.registerNumber,
    studentName: dharunUser.name,
    department: dharunUser.department,
    year: dharunUser.year,
    section: dharunUser.section,
    status: 'confirmed',
  });

  // 11. Hero Slides (Smooth dynamic carousel for Student Dashboard)
  await HeroSlide.create([
    {
      title: 'Campus Hackathon 2026',
      subtitle: '36-Hour National Innovation Challenge at KIOT',
      description:
        'Transform your innovative ideas into working products. Prizes worth ₹50,000 + Angel Incubation by KIOT Incubation Centre.',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
      tag: 'FEATURED HACKATHON',
      ctaLabel: 'Register Team Now',
      ctaDestination: `/events/${event1._id}`,
      order: 1,
      isActive: true,
    },
    {
      title: 'CodeSprint 4.0 Algorithmic Battle',
      subtitle: 'Knowledge Institute of Technology Coding Club',
      description:
        'Showcase algorithmic problem solving under pressure. Compete with top programmers across all departments.',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80',
      tag: 'CODING CONTEST',
      ctaLabel: 'View Contest Details',
      ctaDestination: `/events/${event2._id}`,
      order: 2,
      isActive: true,
    },
    {
      title: 'Agentic AI & Generative Systems Workshop',
      subtitle: 'Department of Artificial Intelligence & Data Science',
      description:
        'Hands-on deep dive into modern LLMs, autonomous agent workflows, and vector architectures.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      tag: 'TECH WORKSHOP',
      ctaLabel: 'Reserve Your Seat',
      ctaDestination: `/events/${event3._id}`,
      order: 3,
      isActive: true,
    },
    {
      title: 'RoboClash & Autonomous Arena',
      subtitle: 'Robotics & IoT Innovation Club',
      description:
        'Design, build, and program autonomous robots for the ultimate campus obstacle arena.',
      image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&q=80',
      tag: 'INNOVATION CHALLENGE',
      ctaLabel: 'Explore Competition',
      ctaDestination: `/events/${event4._id}`,
      order: 4,
      isActive: true,
    },
  ]);

  // 12. Announcements
  await Announcement.create([
    {
      title: 'Smart India Hackathon (SIH 2026) - Internal College Hackathon Schedule',
      content:
        'All student project teams intending to represent KIOT in SIH 2026 must attend the internal screening on Oct 14th in Seminar Hall A. Prepare a 5-minute slide deck and working prototype demonstration.',
      priority: 'urgent',
      audience: 'all',
      author: userMap.get('admin@kiot.ac.in')._id,
      publishDate: new Date(),
    },
    {
      title: 'TCS Digital & Cognizant GenC Placement Orientation',
      content:
        'The Department of Placement & Training is organizing an advanced technical assessment prep session for Pre-final (3rd Year) and Final Year CSE/IT/ECE students.',
      priority: 'important',
      audience: 'all',
      author: mentorRajesh._id,
      publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: 'Semester Continuous Internal Assessment (CIA-II) Dates Announced',
      content:
        'CIA-II examinations for all B.E./B.Tech programs will commence from the third week of the month. Detailed hall allocation and seating plans will be accessible on the department notice board.',
      priority: 'normal',
      audience: 'all',
      author: userMap.get('admin@kiot.ac.in')._id,
      publishDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  ]);

  // 13. Friendships
  // Accepted: Sachin <-> Dharun
  await Friendship.create({
    requester: sachinUser._id,
    recipient: dharunUser._id,
    status: 'accepted',
  });

  // Accepted: Sachin <-> Harini
  await Friendship.create({
    requester: hariniUser._id,
    recipient: sachinUser._id,
    status: 'accepted',
  });

  // Pending: Karthikeyan -> Sachin (so Sachin sees a live pending request to accept in the demo!)
  await Friendship.create({
    requester: userMap.get('karthik.24cse145@kiot.ac.in')._id,
    recipient: sachinUser._id,
    status: 'pending',
  });

  // 14. Initial Notifications for Sachin
  await Notification.create([
    {
      recipient: sachinUser._id,
      sender: userMap.get('karthik.24cse145@kiot.ac.in')._id,
      type: 'friend_request',
      title: 'New Friend Request 🤝',
      message: 'Karthikeyan P (2K24CSE145 - CSE) sent you a friend request.',
      link: '/friends',
    },
    {
      recipient: sachinUser._id,
      sender: mentorRajesh._id,
      type: 'mentor_announcement',
      title: 'Mentorship Cohort Review Scheduled',
      message: 'Dr. K. Rajesh has scheduled a quick progress sync this Friday at 3:30 PM in Seminar Hall A.',
      link: '/profile',
    },
    {
      recipient: sachinUser._id,
      type: 'event_registration',
      title: 'Registration Confirmed! 🎉',
      message: 'You are successfully registered for "Campus Hackathon 2026: Smart Tamil Nadu Innovation Challenge".',
      link: `/events/${event1._id}`,
    },
  ]);

  // 15. Initial Audit Log
  await AuditLog.create({
    actorEmail: 'admin@kiot.ac.in',
    actorRole: 'developer',
    action: 'DEMO_DATA_INITIALIZED',
    targetType: 'System',
    targetId: 'KIOT_CAMPUSCONNECT',
    details: {
      seededUsers: authorizedUsersData.length,
      seededClubs: 4,
      seededEvents: 4,
      seededLocations: locationSeeds.length,
    },
    ipAddress: '127.0.0.1',
  });

  console.log('[Seed] Database seeding completed successfully!');
};
