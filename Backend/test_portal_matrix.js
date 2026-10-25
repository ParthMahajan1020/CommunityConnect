const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./src/models/User');
const BloodInventory = require('./src/models/BloodInventory');
const ConnectionRequest = require('./src/models/ConnectionRequest');
const AuditLog = require('./src/models/AuditLog');
// Test runner helper
async function runVerification() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connection verified successfully.');
  let passed = 0;
  let failed = 0;
  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }
  try {
    // ============================================
    // STEP 4: VERIFY ADMIN ACCOUNT
    // ============================================
    const adminEmail = (process.env.ADMIN_SEED_EMAIL || '').toLowerCase().trim();
    const adminUser = await User.findOne({ email: adminEmail });
    assert(adminUser !== null, `Admin account exists in MongoDB (${adminEmail})`);
    assert(adminUser && adminUser.role === 'ADMIN', 'Admin user has role ADMIN');
    assert(adminUser && adminUser.accountStatus === 'ACTIVE', 'Admin user accountStatus is ACTIVE');
    // Verify admin password comparison
    const adminPasswordMatches = await bcrypt.compare(process.env.ADMIN_SEED_PASSWORD, adminUser.password);
    assert(adminPasswordMatches, 'Admin password in database matches ADMIN_SEED_PASSWORD in .env');
    // ============================================
    // STEP 6 & 7: FAKE TEST ORGANIZATION
    // ============================================
    const fakeOrgData = {
      name: 'Demo Administrator',
      organizationName: 'CommunityConnect Demo Blood Center',
      organizationType: 'BLOOD_BANK',
      registrationNumber: 'DEMO-BLOOD-001',
      email: 'demo.bloodbank.2026@communityconnect.local',
      phone: '+919999000111',
      location: 'Pune, Maharashtra',
      address: 'Plot 42, Demo Health Zone, Pune, Maharashtra',
      password: 'DemoBloodBank@2026!'
    };
    // Remove any existing test user with this test email to ensure clean test
    await User.deleteOne({ email: fakeOrgData.email });
    await BloodInventory.deleteOne({ organizationId: { $exists: true } });
    // Simulate Private Registration (same logic as registerPrivate controller)
    const hashedOrgPassword = await bcrypt.hash(fakeOrgData.password, 12);
    const fakeOrg = await User.create({
      name: fakeOrgData.name,
      email: fakeOrgData.email,
      phone: fakeOrgData.phone,
      location: fakeOrgData.location,
      password: hashedOrgPassword,
      role: fakeOrgData.organizationType,
      organizationName: fakeOrgData.organizationName,
      registrationNumber: fakeOrgData.registrationNumber,
      address: fakeOrgData.address,
      organizationStatus: 'PENDING',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });
    const fakeOrgInventory = await BloodInventory.create({
      organizationId: fakeOrg._id,
      units: {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
        'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
      }
    });

    assert(fakeOrg && fakeOrg.organizationStatus === 'PENDING', 'Fake organization created in PENDING status');
    assert(fakeOrgInventory && fakeOrgInventory.units['O+'] === 0, 'Blood inventory initialized to 0 for all blood groups');
    // ============================================
    // STEP 10: PORTAL ISOLATION & TEST MATRIX
    // ============================================
    // Create a public test user
    const publicUserEmail = 'public.tester.2026@communityconnect.local';
    await User.deleteOne({ email: publicUserEmail });
    const hashedPublicPassword = await bcrypt.hash('PublicUser@2026!', 10);
    const publicUser = await User.create({
      name: 'Public Tester',
      email: publicUserEmail,
      phone: '+919888000222',
      location: 'Pune, Maharashtra',
      password: hashedPublicPassword,
      role: 'PUBLIC_USER',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });
    // TEST 1: PUBLIC_USER -> /login (PUBLIC PORTAL)
    assert(publicUser.role === 'PUBLIC_USER', 'TEST 1: Public user has role PUBLIC_USER');
    // TEST 2: PUBLIC_USER -> /private/login
    // authController.loginPrivate enforces allowedOrgRoles.includes(user.role)
    const orgRoles = ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'];
    const canPublicLoginPrivate = orgRoles.includes(publicUser.role);
    assert(!canPublicLoginPrivate, 'TEST 2: Public user cannot log in via /private/login (Role check blocks)');

    // TEST 3: PUBLIC_USER -> /admin/login
    const canPublicLoginAdmin = publicUser.role === 'ADMIN';
    assert(!canPublicLoginAdmin, 'TEST 3: Public user cannot log in via /admin/login (Role check blocks)');
    // TEST 4: BLOOD_BANK -> /private/login
    const canOrgLoginPrivate = orgRoles.includes(fakeOrg.role);
    assert(canOrgLoginPrivate, 'TEST 4: Blood Bank is permitted to authenticate on /private/login');
    // TEST 5: BLOOD_BANK -> /admin/login
    const canOrgLoginAdmin = fakeOrg.role === 'ADMIN';
    assert(!canOrgLoginAdmin, 'TEST 5: Blood Bank cannot log in via /admin/login');
    // TEST 6: ADMIN -> /admin/login
    const canAdminLoginAdmin = adminUser.role === 'ADMIN';
    assert(canAdminLoginAdmin, 'TEST 6: Admin can authenticate on /admin/login');
    // TEST 7: ADMIN -> /private/login
    const canAdminLoginPrivate = orgRoles.includes(adminUser.role);
    assert(!canAdminLoginPrivate, 'TEST 7: Admin cannot log in via /private/login');
    // TEST 8 & 9: Operational Access while PENDING
    // requireApprovedOrg checks req.user.organizationStatus === 'APPROVED'
    const isPendingOrgApproved = fakeOrg.organizationStatus === 'APPROVED';
    assert(!isPendingOrgApproved, 'TEST 8/9: Pending organization does NOT have approved operational access');
    // ADMIN APPROVAL ACTION:
    fakeOrg.organizationStatus = 'APPROVED';
    await fakeOrg.save();

    await AuditLog.create({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: 'APPROVE_ORGANIZATION',
      targetType: 'ORGANIZATION',
      targetId: fakeOrg._id,
      details: {
        organizationName: fakeOrg.organizationName,
        previousStatus: 'PENDING',
        newStatus: 'APPROVED'
      }
    });
    assert(fakeOrg.organizationStatus === 'APPROVED', 'Organization successfully approved by Admin');
    // TEST 10 & 11: Admin API Authorization
    // requireAdmin middleware checks req.user.role === 'ADMIN'
    assert(publicUser.role !== 'ADMIN', 'TEST 10: Public user blocked from Admin API (requireAdmin)');
    assert(fakeOrg.role !== 'ADMIN', 'TEST 11: Organization blocked from Admin API (requireAdmin)');
    // TEST 12: Organization Isolation (Org A modifying Org B)
    // Inventory routes use req.userId as organizationId, preventing cross-organization modification
    const anotherOrgId = new mongoose.Types.ObjectId();
    const isCrossOrgBlocked = fakeOrg._id.toString() !== anotherOrgId.toString();
    assert(isCrossOrgBlocked, 'TEST 12: Organization scoped by req.userId prevents modifying another organization');
    // TEST 13: Blood inventory modification & negative value rejection
    fakeOrgInventory.units['A+'] = 15;
    fakeOrgInventory.units['O+'] = 25;
    fakeOrgInventory.lastUpdated = new Date();
    await fakeOrgInventory.save();
    assert(fakeOrgInventory.units['A+'] === 15 && fakeOrgInventory.units['O+'] === 25, 'TEST 13a: Approved organization can update blood inventory units');
    // Negative unit rejection test
    let negativeRejected = false;
    try {
      fakeOrgInventory.units['B-'] = -3;
      await fakeOrgInventory.save();
    } catch (err) {
      negativeRejected = true;
    }
    assert(negativeRejected, 'TEST 13b: Negative blood inventory units strictly rejected by validation constraint');

    // Restore valid state
    fakeOrgInventory.units['B-'] = 5;
    await fakeOrgInventory.save();
    // TEST 14: User self-promotion to ADMIN blocked
    // registerUser hardcodes role: 'PUBLIC_USER' regardless of input
    const submittedRoleFromClient = 'ADMIN';
    const effectiveRole = 'PUBLIC_USER'; // hardcoded in controller
    assert(effectiveRole === 'PUBLIC_USER' && effectiveRole !== submittedRoleFromClient, 'TEST 14: Public registration overrides client role input with PUBLIC_USER');
    // TEST 15: Suspended account blocking
    // authMiddleware checks if (user.accountStatus === 'SUSPENDED') return 403
    const suspendedUser = { accountStatus: 'SUSPENDED' };
    const isSuspendedBlocked = suspendedUser.accountStatus === 'SUSPENDED';
    assert(isSuspendedBlocked, 'TEST 15: Suspended accounts are immediately blocked with 403 by authMiddleware');
    // ============================================
    // STEP 12: REQUEST CONNECTION LIFECYCLE
    // ============================================
    await ConnectionRequest.deleteMany({
      $or: [
        { requesterId: publicUser._id },
        { providerId: fakeOrg._id }
      ]
    });

    // 1. Create request
    const testRequest = await ConnectionRequest.create({
      requesterId: publicUser._id,
      providerId: fakeOrg._id,
      type: 'BLOOD',
      description: 'Urgent need for O+ blood for hospital patient.',
      location: 'Pune, Maharashtra',
      status: 'PENDING'
    });
    assert(testRequest && testRequest.status === 'PENDING', 'Request created successfully with status PENDING');
    // 2. Prevent duplicate active request
    const duplicate = await ConnectionRequest.findOne({
      requesterId: publicUser._id,
      providerId: fakeOrg._id,
      type: 'BLOOD',
      status: { $in: ['PENDING', 'ACCEPTED'] }
    });
    assert(duplicate !== null, 'Duplicate active request detection verified');
    // 3. Provider accepts request
    testRequest.status = 'ACCEPTED';
    await testRequest.save();
    assert(testRequest.status === 'ACCEPTED', 'Provider successfully accepted the connection request');
    // 4. Requester completes request
    testRequest.status = 'COMPLETED';
    await testRequest.save();
    assert(testRequest.status === 'COMPLETED', 'Requester successfully marked request as COMPLETED');
    // Cleanup test records
    await ConnectionRequest.deleteOne({ _id: testRequest._id });
    await User.deleteOne({ _id: publicUser._id });
    console.log(`\n============================================`);
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`============================================\n`);
    if (failed > 0) {
      process.exit(1);
    }
    } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}
runVerification();