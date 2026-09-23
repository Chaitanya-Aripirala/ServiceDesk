const users = [
  {
    name: 'Sarah Connor',
    email: 'admin@servicedesk.io',
    password: 'Password123!',
    role: 'admin',
    department: 'IT Support',
    jobTitle: 'Chief Information Officer & Global Admin',
    phone: '+1 (555) 019-1001',
    location: 'HQ Tower, Floor 10',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    specialties: ['IT Governance', 'Cloud Security', 'Infrastructure Architecture'],
  },
  {
    name: 'Marcus Vance',
    email: 'manager@servicedesk.io',
    password: 'Password123!',
    role: 'manager',
    department: 'IT Support',
    jobTitle: 'IT Service Delivery Manager',
    phone: '+1 (555) 019-1002',
    location: 'HQ Tower, Floor 4',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialties: ['SLA Governance', 'Team Capacity Planning', 'Incident Management'],
  },
  {
    name: 'Alex Rivera',
    email: 'tech@servicedesk.io',
    password: 'Password123!',
    role: 'technician',
    department: 'IT Support',
    jobTitle: 'Senior Systems Support Engineer',
    phone: '+1 (555) 019-1003',
    location: 'HQ IT Helpdesk Zone',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialties: ['Hardware Diagnostics', 'macOS & Windows Support', 'Network Routing'],
    assignedTicketCount: 3,
  },
  {
    name: 'Elena Rostova',
    email: 'tech2@servicedesk.io',
    password: 'Password123!',
    role: 'technician',
    department: 'IT Support',
    jobTitle: 'Cloud & Access Security Specialist',
    phone: '+1 (555) 019-1004',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialties: ['Active Directory', 'Okta MFA', 'AWS IAM', 'VPN Tunnels'],
    assignedTicketCount: 2,
  },
  {
    name: 'David Chen',
    email: 'assetmgr@servicedesk.io',
    password: 'Password123!',
    role: 'asset_manager',
    department: 'IT Support',
    jobTitle: 'Lead IT Asset & Procurement Manager',
    phone: '+1 (555) 019-1005',
    location: 'Logistics Depot B',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    specialties: ['Vendor Negotiation', 'Asset Lifecycle Tracking', 'Software Licensing Audits'],
  },
  {
    name: 'Jordan Miller',
    email: 'employee@servicedesk.io',
    password: 'Password123!',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Senior Full Stack Software Engineer',
    phone: '+1 (555) 019-1006',
    location: 'Engineering Pod 2, Desk 44',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sophia Patel',
    email: 'employee2@servicedesk.io',
    password: 'Password123!',
    role: 'employee',
    department: 'Finance',
    jobTitle: 'Financial Planning & Analysis Lead',
    phone: '+1 (555) 019-1007',
    location: 'Executive Wing, Floor 8',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Liam Jackson',
    email: 'employee3@servicedesk.io',
    password: 'Password123!',
    role: 'employee',
    department: 'Human Resources',
    jobTitle: 'People Operations Specialist',
    phone: '+1 (555) 019-1008',
    location: 'Floor 3, HR Suite',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  }
];

const slaPolicies = [
  {
    name: 'Standard Enterprise SLA Policy',
    description: 'Default organizational service level agreement for all department incidents and requests.',
    isDefault: true,
    targets: {
      Critical: { responseMinutes: 30, resolutionMinutes: 240, escalateAfterMinutes: 120 },
      High: { responseMinutes: 60, resolutionMinutes: 480, escalateAfterMinutes: 240 },
      Medium: { responseMinutes: 120, resolutionMinutes: 1440, escalateAfterMinutes: 720 },
      Low: { responseMinutes: 240, resolutionMinutes: 2880, escalateAfterMinutes: 1440 },
    },
    businessHoursOnly: false,
    autoEscalate: true,
  },
  {
    name: 'VIP & Executive Expedited SLA',
    description: 'Strict 15-minute response policy for Executive leadership and core infrastructure outages.',
    isDefault: false,
    targets: {
      Critical: { responseMinutes: 15, resolutionMinutes: 120, escalateAfterMinutes: 60 },
      High: { responseMinutes: 30, resolutionMinutes: 240, escalateAfterMinutes: 120 },
      Medium: { responseMinutes: 60, resolutionMinutes: 720, escalateAfterMinutes: 360 },
      Low: { responseMinutes: 120, resolutionMinutes: 1440, escalateAfterMinutes: 720 },
    },
    businessHoursOnly: false,
    autoEscalate: true,
  }
];

const categories = [
  {
    name: 'Hardware',
    code: 'HDW',
    description: 'Physical computers, monitors, accessories, and office peripherals',
    icon: 'Laptop',
    subcategories: [
      { name: 'Laptop / Workstation', defaultPriority: 'Medium' },
      { name: 'Monitor & Display', defaultPriority: 'Low' },
      { name: 'Peripherals & Cables', defaultPriority: 'Low' },
      { name: 'Printers & Scanners', defaultPriority: 'Medium' },
      { name: 'Server & Rack Hardware', defaultPriority: 'Critical' },
    ]
  },
  {
    name: 'Software',
    code: 'SFT',
    description: 'Operating systems, desktop applications, productivity suites & developer tooling',
    icon: 'Code2',
    subcategories: [
      { name: 'Operating System', defaultPriority: 'High' },
      { name: 'Office & Productivity', defaultPriority: 'Medium' },
      { name: 'Engineering & Dev Tools', defaultPriority: 'Medium' },
      { name: 'Licensing & Activation', defaultPriority: 'Low' },
    ]
  },
  {
    name: 'Network & Connectivity',
    code: 'NET',
    description: 'Corporate Wi-Fi, Ethernet, VPN remote tunnels, DNS and Firewalls',
    icon: 'Wifi',
    subcategories: [
      { name: 'Wi-Fi & LAN', defaultPriority: 'High' },
      { name: 'VPN & Remote Access', defaultPriority: 'High' },
      { name: 'DNS & Firewall Routing', defaultPriority: 'Critical' },
    ]
  },
  {
    name: 'Access & Security',
    code: 'SEC',
    description: 'Single Sign-On (SSO), MFA tokens, passwords, permissions and security anomalies',
    icon: 'ShieldCheck',
    subcategories: [
      { name: 'Password & MFA Reset', defaultPriority: 'Medium' },
      { name: 'Account Provisioning', defaultPriority: 'Medium' },
      { name: 'Role & Permission Elevation', defaultPriority: 'Medium' },
      { name: 'Security Incident / Phishing', defaultPriority: 'Critical' },
    ]
  },
  {
    name: 'Email & Collaboration',
    code: 'EML',
    description: 'Microsoft Exchange, Outlook, Teams, Slack channels and conference rooms',
    icon: 'Mail',
    subcategories: [
      { name: 'Email Delivery & Spam', defaultPriority: 'Medium' },
      { name: 'Conferencing & AV Systems', defaultPriority: 'High' },
      { name: 'Shared Mailbox & Calendars', defaultPriority: 'Low' },
    ]
  },
  {
    name: 'Cloud & Infrastructure',
    code: 'CLD',
    description: 'AWS / Azure virtual machines, Kubernetes clusters and databases',
    icon: 'Cloud',
    subcategories: [
      { name: 'Cloud Compute & VMs', defaultPriority: 'Critical' },
      { name: 'Database & Storage', defaultPriority: 'High' },
      { name: 'CI/CD Pipelines', defaultPriority: 'Medium' },
    ]
  }
];

const vendors = [
  {
    name: 'Dell Enterprise Solutions',
    contactPerson: 'Rachel Adams',
    email: 'rachel.adams@dellpartners.com',
    phone: '+1 (800) 456-3355',
    contractType: 'Hardware Supply',
    status: 'Active',
  },
  {
    name: 'Apple Corporate Direct',
    contactPerson: 'Michael Scott',
    email: 'b2b@apple.com',
    phone: '+1 (800) 854-3680',
    contractType: 'Hardware Supply',
    status: 'Active',
  },
  {
    name: 'Microsoft Volume Licensing',
    contactPerson: 'David Miller',
    email: 'licensing@microsoft.com',
    phone: '+1 (800) 642-7676',
    contractType: 'Software Licensing',
    status: 'Active',
  },
  {
    name: 'Cisco Systems Networking',
    contactPerson: 'Karen Lee',
    email: 'support@cisco.com',
    phone: '+1 (800) 553-6387',
    contractType: 'Maintenance Support',
    status: 'Active',
  }
];

const knowledgeArticles = [
  {
    title: 'How to Connect & Troubleshoot GlobalConnect Corporate VPN',
    category: 'Network & Connectivity',
    subcategory: 'VPN & Remote Access',
    summary: 'Step-by-step diagnostic guide for remote employees encountering Cisco AnyConnect or Wireguard authentication timeouts.',
    content: `### Overview\nGlobalTech requires secure MFA-verified VPN connection for all internal source code repositories, databases, and internal intranet portals.\n\n### Quick Troubleshooting Steps\n1. **Verify Internet Connectivity**: Ensure you can reach public websites before launching VPN client.\n2. **Check MFA Push Notification**: Open your Okta Verify / Microsoft Authenticator app on your smartphone and approve the pending prompt within 45 seconds.\n3. **Clear Stale DNS Cache**:\n   - Windows: Run \`ipconfig /flushdns\` in PowerShell.\n   - macOS: Run \`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder\`\n4. **Select Fallback Gateway**: If \`vpn-us-east.globaltech.com\` fails, switch gateway to \`vpn-us-west.globaltech.com\`.\n5. If errors code 403 / 502 persist, your account credentials may require re-syncing from IT Helpdesk.`,
    tags: ['vpn', 'network', 'cisco', 'remote', 'mfa', 'connectivity'],
    keywords: ['vpn', 'remote', 'tunnel', 'okta', 'dns', 'disconnect', 'timeout'],
    helpfulVotes: 48,
    unhelpfulVotes: 1,
    isPublic: true,
    status: 'Published'
  },
  {
    title: 'Self-Service MFA Token Reset and Account Unlock Guide',
    category: 'Access & Security',
    subcategory: 'Password & MFA Reset',
    summary: 'Instructions on re-enrolling a new mobile device or resetting MFA after changing smartphones.',
    content: `### Problem Summary\nWhen employees upgrade their smartphones or lose access to their authenticator app, SSO logins get blocked.\n\n### Self-Service Recovery Process\n1. Navigate to https://sso.globaltech.com/recovery\n2. Enter your corporate email (\`user@globaltech.com\`).\n3. An SMS temporary 6-digit emergency passkey will be delivered to your registered phone number.\n4. Enter the emergency passkey to access temporary session.\n5. Go to **Security Profile > Add New Authenticator Device**.\n6. Scan the QR code with your new device.\n\n> Note: If you do not have access to your registered SMS number, create a ticket with category Access & Security for manager identity verification.`,
    tags: ['mfa', '2fa', 'password', 'okta', 'authenticator', 'security', 'unlock'],
    keywords: ['mfa', 'token', 'reset', 'password', 'authenticator', 'qr', 'unlock'],
    helpfulVotes: 62,
    unhelpfulVotes: 3,
    isPublic: true,
    status: 'Published'
  },
  {
    title: 'Resolving Outlook & Microsoft 365 Exchange Synchronization Errors',
    category: 'Email & Collaboration',
    subcategory: 'Email Delivery & Spam',
    summary: 'Fixing corrupted local OST cache files and authentication disconnects in Microsoft Outlook.',
    content: `### Diagnostic Checklist\n1. **Check Offline Mode**: In Outlook, go to the **Send / Receive** tab and ensure **Work Offline** is toggled OFF.\n2. **Clear Outlook Cache**:\n   - Close Outlook.\n   - Press \`Win + R\`, type \`%localappdata%\\Microsoft\\Outlook\`, and press Enter.\n   - Rename your \`.ost\` file to \`.ost.bak\`.\n   - Re-open Outlook; it will automatically rebuild a fresh mail cache from Exchange cloud.\n3. **Repair Office Installation**: Open Windows Settings > Apps > Microsoft 365 Apps > Modify > Quick Repair.`,
    tags: ['outlook', 'email', 'microsoft 365', 'exchange', 'cache', 'sync'],
    keywords: ['outlook', 'email', 'sync', 'exchange', 'ost', 'mail', 'inbox'],
    helpfulVotes: 35,
    unhelpfulVotes: 2,
    isPublic: true,
    status: 'Published'
  },
  {
    title: 'Laptop Battery Health Calibration & Power Adapter Diagnostics',
    category: 'Hardware',
    subcategory: 'Laptop / Workstation',
    summary: 'How to diagnose rapid battery drainage, overheating fans, and faulty USB-C charging docks.',
    content: `### Battery Diagnostics\n1. **Windows Battery Report**: Open Command Prompt as Administrator and run:\n   \`powercfg /batteryreport /output "C:\\battery_report.html"\`\n   Check the **Design Capacity** vs **Full Charge Capacity**. If capacity is under 60%, hardware replacement is warranted.\n2. **macOS Battery Health**: Open System Settings > Battery > Battery Health (Normal / Service Recommended).\n3. **USB-C Dock Reset**: Unplug all monitors and power supply from Dell WD19 / CalDigit dock for 30 seconds to discharge capacitors, then reconnect power first, followed by laptop.`,
    tags: ['battery', 'laptop', 'hardware', 'power', 'charger', 'dell', 'macbook'],
    keywords: ['battery', 'drain', 'charger', 'laptop', 'power', 'dock', 'overheating'],
    helpfulVotes: 29,
    unhelpfulVotes: 0,
    isPublic: true,
    status: 'Published'
  }
];

module.exports = {
  users,
  slaPolicies,
  categories,
  vendors,
  knowledgeArticles,
};
