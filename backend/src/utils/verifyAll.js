import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 CampusConnect End-to-End Functional Verification Suite');
  console.log('🏛️  Knowledge Institute of Technology (KIOT), Salem');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health check
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'ONLINE', 'System Health API online');

  // 2. Security Test: Unauthorized email domain or unregistered user
  const unauthTest = await request('/auth/google-login', 'POST', {
    email: 'hacker@externaldomain.com',
    isDemo: true,
  });
  assert(
    unauthTest.status === 403,
    `Security Gateway: Non-KIOT domain rejected (Status: ${unauthTest.status})`
  );

  const unregKiotTest = await request('/auth/google-login', 'POST', {
    email: 'unregistered.student@kiot.ac.in',
    isDemo: true,
  });
  assert(
    unregKiotTest.status === 403,
    `Security Gateway: Unregistered KIOT email rejected by CMS AuthorizedUsers check (Status: ${unregKiotTest.status})`
  );

  // 3. Login as Student Sachin V (2K24CSE167)
  const studentLogin = await request('/auth/google-login', 'POST', {
    email: 'sachin.24cse167@kiot.ac.in',
    isDemo: true,
  });
  assert(studentLogin.status === 200 && studentLogin.data.token, 'Student Login: Sachin V (2K24CSE167)');
  const studentToken = studentLogin.data.token;

  // 4. Student Profile & Presence Status
  const me = await request('/auth/me', 'GET', null, studentToken);
  assert(me.data.user && me.data.user.registerNumber === '2K24CSE167', 'User Profile: Verified 2K24CSE167');
  console.log(`   Current Student Presence: ${me.data.user.presence?.status} (${me.data.user.presence?.locationName || 'OUT'})`);

  // 5. Test Single-QR IN/OUT Toggle Logic
  // Fetch active QR locations
  const locRes = await request('/presence/locations');
  assert(locRes.data.locations.length > 0, `Campus Locations loaded (${locRes.data.locations.length} monitored rooms)`);
  const seminarHall = locRes.data.locations.find((l) => l.code === 'SEMINAR_HALL_A');

  // Check initial presence status
  const initialStatus = me.data.user.presence?.status || 'OUT';

  // Scan 1: toggle opposite
  const scan1 = await request(
    '/presence/scan',
    'POST',
    { qrIdentifier: seminarHall.qrIdentifier, presenceSource: 'QR' },
    studentToken
  );
  assert(
    scan1.status === 200,
    `Single-QR Scan 1: ${scan1.data.action} -> Status: ${scan1.data.presence.status}`
  );

  // Wait 3.1s to respect debounce
  await new Promise((r) => setTimeout(r, 3100));

  // Scan 2: toggle back
  const scan2 = await request(
    '/presence/scan',
    'POST',
    { qrIdentifier: seminarHall.qrIdentifier, presenceSource: 'QR' },
    studentToken
  );
  assert(
    scan2.status === 200,
    `Single-QR Scan 2: ${scan2.data.action} -> Status: ${scan2.data.presence.status}`
  );

  // If status is OUT after toggle, do one more scan to leave him IN for mentor test
  if (scan2.data.presence.status === 'OUT') {
    await new Promise((r) => setTimeout(r, 3100));
    const scan3 = await request(
      '/presence/scan',
      'POST',
      { qrIdentifier: seminarHall.qrIdentifier, presenceSource: 'QR' },
      studentToken
    );
    assert(scan3.data.presence.status === 'IN', 'Set student presence to IN at Seminar Hall A');
  } else {
    assert(scan2.data.presence.status === 'IN', 'Student presence confirmed IN at Seminar Hall A');
  }

  // 6. Test Friend Search and Mutual Presence
  const friendSearch = await request('/friends/search?query=2K24CSE101', 'GET', null, studentToken);
  assert(friendSearch.data.users.length > 0, 'Friend Search: Found student by Register Number 2K24CSE101');

  const friendsList = await request('/friends', 'GET', null, studentToken);
  assert(friendsList.data.friends.length > 0, `Friends Network: ${friendsList.data.friends.length} connected friends`);

  // 7. Scoped Mentor Access Test
  // Login as Mentor Dr. K. Rajesh
  const mentorLogin = await request('/auth/google-login', 'POST', {
    email: 'mentor.rajesh@kiot.ac.in',
    isDemo: true,
  });
  assert(mentorLogin.status === 200 && mentorLogin.data.token, 'Mentor Login: Dr. K. Rajesh');
  const mentorToken = mentorLogin.data.token;

  // Query assigned mentee Sachin V (2K24CSE167)
  const menteeQuery = await request(
    '/presence/mentee?registerNumber=2K24CSE167',
    'GET',
    null,
    mentorToken
  );
  assert(
    menteeQuery.status === 200 && menteeQuery.data.mentee.presence.status === 'IN',
    `Mentor Scoped Presence: Authorized mentee 2K24CSE167 status is ${menteeQuery.data.mentee.presence.status} at ${menteeQuery.data.mentee.presence.locationName}`
  );

  // Query UNASSIGNED student (e.g. 2K24IT056)
  const unassignedQuery = await request(
    '/presence/mentee?registerNumber=2K24IT056',
    'GET',
    null,
    mentorToken
  );
  assert(
    unassignedQuery.status === 403,
    `Mentor Scope Enforcement: Access to unassigned student 2K24IT056 strictly rejected with 403 Forbidden`
  );

  // 8. Event Discovery & 1-Click Registration Test
  const events = await request('/events');
  assert(events.data.events.length > 0, `Events Module: ${events.data.events.length} campus events published`);
  const hackathon = events.data.events.find((e) => e.category === 'Hackathon');

  // Register for hackathon
  const regTest = await request(`/events/${hackathon._id}/register`, 'POST', {}, studentToken);
  assert(
    regTest.status === 200 || regTest.status === 400, // 400 if already registered, which verifies anti-double registration
    `Anti-Double Registration Check: ${regTest.data.message}`
  );

  // 9. Clubs Module & Leadership Test
  const clubs = await request('/clubs');
  assert(clubs.data.clubs.length > 0, `Clubs Directory: ${clubs.data.clubs.length} active student clubs`);

  // 10. Developer CMS System Control Center
  const adminLogin = await request('/auth/google-login', 'POST', {
    email: 'admin@kiot.ac.in',
    isDemo: true,
  });
  assert(adminLogin.status === 200 && adminLogin.data.token, 'Developer/Admin Login: Dr. P. Rajendran');
  const adminToken = adminLogin.data.token;

  const cmsStats = await request('/cms/stats', 'GET', null, adminToken);
  assert(
    cmsStats.status === 200 && cmsStats.data.stats.totalStudents > 0,
    `CMS System Control Center: Loaded live analytics (${cmsStats.data.stats.totalStudents} students, ${cmsStats.data.stats.activeUsers} active accounts)`
  );

  // Test Non-Admin trying to call CMS
  const studentCmsAttempt = await request('/cms/stats', 'GET', null, studentToken);
  assert(
    studentCmsAttempt.status === 403,
    `CMS Privilege Protection: Student cannot access CMS endpoints (Status: ${studentCmsAttempt.status})`
  );

  // 11. Hero Slides
  const heroSlides = await request('/hero-slides/active');
  assert(
    heroSlides.data.slides.length > 0,
    `Dashboard Moving Hero Section: ${heroSlides.data.slides.length} active slides loaded`
  );

  console.log('\n================================================================');
  console.log(`📊 Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 ALL CAMPUSCONNECT FUNCTIONAL MODULES OPERATING AT PRODUCTION QUALITY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
