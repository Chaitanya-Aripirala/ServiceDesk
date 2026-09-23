const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const SLAPolicy = require('../models/SLAPolicy');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const Asset = require('../models/Asset');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const WorkLog = require('../models/WorkLog');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { users, slaPolicies, categories, vendors, knowledgeArticles } = require('./seedData');

const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicedesk_pro';
    console.log(`[Seeder] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seeder] Clearing old collections...');
    await Promise.all([
      User.deleteMany(),
      SLAPolicy.deleteMany(),
      Category.deleteMany(),
      Vendor.deleteMany(),
      Asset.deleteMany(),
      KnowledgeArticle.deleteMany(),
      Ticket.deleteMany(),
      Comment.deleteMany(),
      WorkLog.deleteMany(),
      AuditLog.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[Seeder] Creating Users...');
    const createdUsers = [];
    for (const u of users) {
      const userDoc = await User.create(u);
      createdUsers.push(userDoc);
    }
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const managerUser = createdUsers.find(u => u.role === 'manager');
    const techUser = createdUsers.find(u => u.role === 'technician');
    const tech2User = createdUsers.find(u => u.email === 'tech2@servicedesk.io') || techUser;
    const empUser = createdUsers.find(u => u.role === 'employee');
    const emp2User = createdUsers.find(u => u.email === 'employee2@servicedesk.io') || empUser;
    const assetMgr = createdUsers.find(u => u.role === 'asset_manager');

    console.log('[Seeder] Creating SLA Policies...');
    const createdSLAs = await SLAPolicy.insertMany(slaPolicies);
    const defaultSLA = createdSLAs.find(s => s.isDefault) || createdSLAs[0];

    console.log('[Seeder] Creating Categories...');
    for (const c of categories) {
      c.slaPolicy = defaultSLA._id;
      await Category.create(c);
    }

    console.log('[Seeder] Creating Vendors...');
    const createdVendors = await Vendor.insertMany(vendors);

    console.log('[Seeder] Creating Assets...');
    const sampleAssets = [
      {
        assetTag: 'AST-2024-001',
        name: 'MacBook Pro 16" M3 Max',
        type: 'Hardware',
        category: 'Laptop',
        manufacturer: 'Apple',
        model: 'MacBook Pro 16 (2023)',
        serialNumber: 'C02G8490MD6R',
        status: 'Assigned',
        assignedTo: empUser._id,
        department: 'Engineering',
        location: 'Engineering Pod 2, Desk 44',
        purchaseDate: new Date('2024-01-15'),
        purchaseCost: 3499,
        depreciationRateAnnual: 20,
        warrantyExpiry: new Date('2027-01-15'),
        vendorName: 'Apple Corporate Direct',
        vendor: createdVendors[1]._id,
        specs: { cpu: 'Apple M3 Max (16-core)', ram: '64 GB Unified', storage: '1 TB NVMe SSD', os: 'macOS Sonoma 14.4' },
        lifecycleHistory: [
          { action: 'PROCURED_AND_CATALOGED', performerName: assetMgr.name, timestamp: new Date('2024-01-15') },
          { action: `Assigned to ${empUser.name}`, performerName: assetMgr.name, assignedToUser: empUser.name, timestamp: new Date('2024-01-20') }
        ]
      },
      {
        assetTag: 'AST-2024-002',
        name: 'Dell Latitude 7440 Ultra',
        type: 'Hardware',
        category: 'Laptop',
        manufacturer: 'Dell',
        model: 'Latitude 7440',
        serialNumber: 'DLL-994821-X',
        status: 'Assigned',
        assignedTo: emp2User._id,
        department: 'Finance',
        location: 'Executive Wing, Floor 8',
        purchaseDate: new Date('2024-02-10'),
        purchaseCost: 1850,
        depreciationRateAnnual: 20,
        warrantyExpiry: new Date('2027-02-10'),
        vendorName: 'Dell Enterprise Solutions',
        vendor: createdVendors[0]._id,
        specs: { cpu: 'Intel Core i7-1365U', ram: '32 GB DDR5', storage: '512 GB NVMe SSD', os: 'Windows 11 Enterprise' },
        lifecycleHistory: [
          { action: 'PROCURED_AND_CATALOGED', performerName: assetMgr.name, timestamp: new Date('2024-02-10') },
          { action: `Assigned to ${emp2User.name}`, performerName: assetMgr.name, assignedToUser: emp2User.name, timestamp: new Date('2024-02-12') }
        ]
      },
      {
        assetTag: 'AST-2024-003',
        name: 'Lenovo ThinkPad X1 Carbon Gen 11',
        type: 'Hardware',
        category: 'Laptop',
        manufacturer: 'Lenovo',
        model: 'ThinkPad X1 Carbon',
        serialNumber: 'LNV-883921-G',
        status: 'In-Stock',
        assignedTo: null,
        department: 'IT Support',
        location: 'HQ IT Depot Storage Shelf A3',
        purchaseDate: new Date('2024-03-01'),
        purchaseCost: 1950,
        depreciationRateAnnual: 20,
        warrantyExpiry: new Date('2027-03-01'),
        vendorName: 'Dell Enterprise Solutions',
        specs: { cpu: 'Intel Core i7-1370P', ram: '32 GB DDR5', storage: '1 TB SSD', os: 'Windows 11 Pro' },
        lifecycleHistory: [
          { action: 'PROCURED_AND_CATALOGED', performerName: assetMgr.name, timestamp: new Date('2024-03-01') }
        ]
      },
      {
        assetTag: 'AST-2024-004',
        name: 'Cisco Catalyst 9200 Core Switch',
        type: 'Network',
        category: 'Switch/Router',
        manufacturer: 'Cisco',
        model: 'Catalyst 9200-48P',
        serialNumber: 'CSCO-48P-99201',
        status: 'Assigned',
        assignedTo: null,
        department: 'IT Support',
        location: 'HQ Server Room Rack 2',
        purchaseDate: new Date('2023-06-12'),
        purchaseCost: 5200,
        depreciationRateAnnual: 15,
        warrantyExpiry: new Date('2028-06-12'),
        vendorName: 'Cisco Systems Networking',
        vendor: createdVendors[3]._id,
        specs: { cpu: 'Cisco Multicore', ram: '4 GB', storage: '4 GB Flash', os: 'Cisco IOS XE' },
        lifecycleHistory: [
          { action: 'INSTALLED_IN_DATACENTER', performerName: techUser.name, timestamp: new Date('2023-06-15') }
        ]
      },
      {
        assetTag: 'AST-2024-005',
        name: 'Dell UltraSharp 32" 4K USB-C Monitor',
        type: 'Peripheral',
        category: 'Monitor',
        manufacturer: 'Dell',
        model: 'U3223QE 4K Hub',
        serialNumber: 'DLM-324-0091',
        status: 'Under-Repair',
        assignedTo: null,
        department: 'Engineering',
        location: 'IT Repair Bench #2',
        purchaseDate: new Date('2023-11-05'),
        purchaseCost: 899,
        depreciationRateAnnual: 20,
        warrantyExpiry: new Date('2026-11-05'),
        vendorName: 'Dell Enterprise Solutions',
        maintenanceLogs: [
          {
            date: new Date(),
            type: 'Hardware Repair',
            cost: 120,
            performedBy: 'Alex Rivera',
            notes: 'USB-C Power Delivery port intermittent; replacing internal charging daughterboard under warranty.'
          }
        ],
        lifecycleHistory: [
          { action: 'TRANSFERRED_TO_REPAIR', performerName: techUser.name, notes: 'Flickering USB-C PD circuit', timestamp: new Date() }
        ]
      }
    ];

    const createdAssets = await Asset.insertMany(sampleAssets);

    console.log('[Seeder] Creating Knowledge Articles...');
    for (const k of knowledgeArticles) {
      k.author = adminUser._id;
      k.authorName = adminUser.name;
      await KnowledgeArticle.create(k);
    }

    console.log('[Seeder] Creating Realistic Tickets with Comment Threads & Timelines...');
    const sampleTickets = [
      {
        ticketNumber: 'INC-1001',
        title: 'GlobalConnect VPN connection dropping frequently during morning meetings',
        description: 'Every morning around 9:30 AM EST, Cisco AnyConnect disconnects and throws an authentication timeout error. This is interrupting my production deployments and team standups.',
        type: 'Incident',
        category: 'Network & Connectivity',
        subcategory: 'VPN & Remote Access',
        priority: 'High',
        impact: 'Single User',
        urgency: 'High',
        status: 'In-Progress',
        requester: empUser._id,
        assignedTo: techUser._id,
        department: 'Engineering',
        asset: createdAssets[0]._id,
        slaPolicy: defaultSLA._id,
        slaResponseDeadline: new Date(Date.now() + 60 * 60 * 1000),
        slaResolutionDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 30 * 60 * 1000),
        aiClassification: {
          predictedCategory: 'Network & Connectivity',
          predictedPriority: 'High',
          confidence: 94,
          probableIssue: 'VPN gateway authentication or stale local network route',
          sentiment: 'Frustrated',
          suggestedAction: 'Verify user MFA registration and advise refreshing DNS / reinstalling VPN profile.',
        },
        tags: ['vpn', 'network', 'cisco', 'timeout'],
        activityTimeline: [
          { action: 'TICKET_CREATED', performerName: empUser.name, timestamp: new Date(Date.now() - 60 * 60 * 1000) },
          { action: 'TICKET_ASSIGNED', performerName: managerUser.name, details: `Assigned to ${techUser.name}`, timestamp: new Date(Date.now() - 45 * 60 * 1000) },
          { action: 'STATUS_CHANGED', performerName: techUser.name, details: 'Status moved to In-Progress', timestamp: new Date(Date.now() - 30 * 60 * 1000) }
        ]
      },
      {
        ticketNumber: 'INC-1002',
        title: 'Unable to login to ERP / Finance Portal after password expiry reset',
        description: 'I reset my corporate password this morning via self-service, but the NetSuite / ERP finance system is rejecting my new credentials with error code ERR_AUTH_LOCKOUT.',
        type: 'Incident',
        category: 'Access & Security',
        subcategory: 'Password & MFA Reset',
        priority: 'Medium',
        impact: 'Single User',
        urgency: 'Medium',
        status: 'Resolved',
        requester: emp2User._id,
        assignedTo: tech2User._id,
        department: 'Finance',
        asset: createdAssets[1]._id,
        slaPolicy: defaultSLA._id,
        slaResponseDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000),
        slaResolutionDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
        resolutionSummary: 'Manually cleared cached token in Azure AD Kerberos pool and synced SSO directory.',
        rootCause: 'Kerberos credential token propagation lag between Azure AD and on-premise ERP proxy.',
        satisfactionRating: {
          rating: 5,
          feedback: 'Elena fixed this within 15 minutes. Excellent support!',
          ratedAt: new Date(Date.now() - 15 * 60 * 1000)
        },
        aiClassification: {
          predictedCategory: 'Access & Security',
          predictedPriority: 'Medium',
          confidence: 96,
          probableIssue: 'Expired credentials or locked account state',
          sentiment: 'Neutral',
          suggestedAction: 'Check Active Directory/SSO lockout status and trigger secure self-service password reset.',
        },
        activityTimeline: [
          { action: 'TICKET_CREATED', performerName: emp2User.name, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
          { action: 'TICKET_ASSIGNED', performerName: managerUser.name, details: `Assigned to ${tech2User.name}`, timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000) },
          { action: 'STATUS_CHANGED', performerName: tech2User.name, details: 'Ticket resolved successfully.', timestamp: new Date(Date.now() - 30 * 60 * 1000) }
        ]
      },
      {
        ticketNumber: 'INC-1003',
        title: 'Core Production Kubernetes Cluster Node Disk Space Warning',
        description: 'Cluster prod-us-east-1 node 4 reporting 92% disk utilization on /var/log volume. Automated alerts firing for potential pod eviction.',
        type: 'Incident',
        category: 'Cloud & Infrastructure',
        subcategory: 'Cloud Compute & VMs',
        priority: 'Critical',
        impact: 'Entire Organization',
        urgency: 'Critical',
        status: 'Escalated',
        escalationLevel: 2,
        escalationReason: 'Resolution SLA breached due to node log aggregation blockage. Escalated to IT Management.',
        isSlaResolutionBreached: true,
        requester: empUser._id,
        assignedTo: techUser._id,
        department: 'Engineering',
        slaPolicy: defaultSLA._id,
        slaResponseDeadline: new Date(Date.now() - 3 * 60 * 60 * 1000),
        slaResolutionDeadline: new Date(Date.now() - 30 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
        aiClassification: {
          predictedCategory: 'Cloud & Infrastructure',
          predictedPriority: 'Critical',
          confidence: 98,
          probableIssue: 'High volume disk capacity exhaustion on infrastructure host',
          sentiment: 'Urgent',
          suggestedAction: 'Rotate container logs and expand PVC volume storage quota.',
        },
        activityTimeline: [
          { action: 'TICKET_CREATED', performerName: empUser.name, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
          { action: 'SLA_RESOLUTION_BREACHED_ESCALATED', performerName: 'SLA Daemon', details: 'Automated resolution SLA breach escalation to Level 2.', timestamp: new Date(Date.now() - 30 * 60 * 1000) }
        ]
      },
      {
        ticketNumber: 'SRV-1004',
        title: 'Request Dual 4K External Monitors and Ergonomic Docking Station',
        description: 'New hire onboarding in Engineering requires dual monitor workstation setup and Dell WD19TB docking station for Desk 48.',
        type: 'Service Request',
        category: 'Hardware',
        subcategory: 'Peripherals & Accessories',
        priority: 'Low',
        impact: 'Single User',
        urgency: 'Low',
        status: 'Open',
        requester: empUser._id,
        assignedTo: null,
        department: 'Engineering',
        slaPolicy: defaultSLA._id,
        slaResponseDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000),
        slaResolutionDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        aiClassification: {
          predictedCategory: 'Hardware',
          predictedPriority: 'Low',
          confidence: 91,
          probableIssue: 'Standard hardware procurement & workspace peripheral request',
          sentiment: 'Positive',
          suggestedAction: 'Check IT inventory stock for available monitors and dispatch deployment technician.',
        },
        activityTimeline: [
          { action: 'TICKET_CREATED', performerName: empUser.name, timestamp: new Date(Date.now() - 20 * 60 * 1000) }
        ]
      }
    ];

    const createdTickets = await Ticket.insertMany(sampleTickets);

    console.log('[Seeder] Creating Comments & Work Logs...');
    // Add comments for INC-1001
    await Comment.create([
      {
        ticket: createdTickets[0]._id,
        author: techUser._id,
        authorName: techUser.name,
        authorRole: techUser.role,
        message: 'Hi Jordan, I am reviewing your connection telemetry from our Cisco ASA firewall logs. Can you confirm if you have flushed your local DNS cache as outlined in KB article #1?',
        isInternal: false,
      },
      {
        ticket: createdTickets[0]._id,
        author: techUser._id,
        authorName: techUser.name,
        authorRole: techUser.role,
        message: 'Note for IT Team: Gateway 2 is seeing 15% packet loss on AT&T peering route; re-routing user to West gateway if ping remains above 120ms.',
        isInternal: true,
      },
      {
        ticket: createdTickets[0]._id,
        author: empUser._id,
        authorName: empUser.name,
        authorRole: empUser.role,
        message: 'Thanks Alex! Flushed DNS now and testing the West gateway now.',
        isInternal: false,
      }
    ]);

    // Add WorkLogs
    await WorkLog.create([
      {
        ticket: createdTickets[0]._id,
        technician: techUser._id,
        technicianName: techUser.name,
        timeSpentMinutes: 35,
        activityType: 'Remote Troubleshooting',
        description: 'Analyzed Cisco ASA telemetry logs and configured split-tunnel routing profile for macOS client.',
        isBillable: true,
      },
      {
        ticket: createdTickets[1]._id,
        technician: tech2User._id,
        technicianName: tech2User.name,
        timeSpentMinutes: 20,
        activityType: 'Software Configuration',
        description: 'Triggered Azure AD Kerberos ticket synchronization and verified ERP SSO callback.',
        isBillable: true,
      }
    ]);

    console.log('[Seeder] Creating Notifications & Audit Logs...');
    await Notification.create([
      {
        recipient: empUser._id,
        title: '💬 New reply on INC-1001',
        message: `${techUser.name} responded to your VPN support ticket.`,
        type: 'TICKET_UPDATED',
        link: `/tickets/${createdTickets[0]._id}`,
      },
      {
        recipient: managerUser._id,
        title: '🚨 Escalation Alert: INC-1003',
        message: 'Ticket "Core Production Kubernetes Cluster Node Disk Space Warning" has breached resolution SLA.',
        type: 'ESCALATION',
        link: `/tickets/${createdTickets[2]._id}`,
      }
    ]);

    await AuditLog.create([
      {
        action: 'DATABASE_INITIAL_SEED',
        module: 'SYSTEM',
        performerName: 'System Administrator',
        performerRole: 'admin',
        targetType: 'System',
        details: { message: 'Database initialized with demo users, SLA policies, assets, and seed tickets.' },
        status: 'SUCCESS',
      }
    ]);

    console.log('✅ Database seeded successfully with enterprise demo data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
