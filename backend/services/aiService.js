const KnowledgeArticle = require('../models/KnowledgeArticle');

// AI Classification Knowledge Rules & Keyword Dictionaries
const CATEGORY_KEYWORDS = {
  Hardware: {
    weight: 1.2,
    subcategories: {
      'Laptop / Workstation': ['laptop', 'macbook', 'thinkpad', 'dell', 'keyboard', 'trackpad', 'battery', 'overheating', 'screen', 'monitor', 'display', 'charger', 'docking station'],
      'Peripherals & Accessories': ['mouse', 'webcam', 'headset', 'microphone', 'usb', 'hdmi', 'adapter', 'dongle', 'cable'],
      'Printers & Scanners': ['printer', 'scanner', 'paper jam', 'toner', 'ink', 'print queue', 'spooler'],
      'Servers & Racks': ['server', 'rack', 'blade', 'esxi', 'hypervisor', 'reboot', 'datacenter', 'ups', 'power supply']
    },
    terms: ['hardware', 'device', 'broken', 'damaged', 'physical', 'laptop', 'desktop', 'screen', 'battery', 'fan', 'pc', 'boot', 'motherboard', 'ram', 'ssd']
  },
  Software: {
    weight: 1.1,
    subcategories: {
      'Operating System': ['windows', 'macos', 'ubuntu', 'linux', 'blue screen', 'bsod', 'kernel panic', 'crash', 'freeze', 'restart loop'],
      'Office & Productivity': ['microsoft 365', 'outlook', 'excel', 'word', 'powerpoint', 'google workspace', 'slack', 'zoom', 'teams', 'calendar'],
      'Engineering Tools': ['git', 'github', 'docker', 'kubernetes', 'vscode', 'intellij', 'jira', 'confluence', 'terminal'],
      'Licensing & Activation': ['license', 'activation key', 'expired', 'subscription', 'renew']
    },
    terms: ['software', 'app', 'application', 'install', 'update', 'patch', 'error code', 'crash', 'plugin', 'version', 'bug', 'glitch']
  },
  'Network & Connectivity': {
    weight: 1.3,
    subcategories: {
      'Wi-Fi & LAN': ['wifi', 'wi-fi', 'ethernet', 'lan', 'no internet', 'slow connection', 'disconnected', 'network drop', 'ssid'],
      'VPN & Remote Access': ['vpn', 'cisco anyconnect', 'wireguard', 'openvpn', 'tunnel', 'remote desktop', 'rdp', 'ssh connection'],
      'DNS & Firewall': ['dns', 'firewall', 'blocked site', 'domain', 'ip address', 'gateway', 'subnet', 'port']
    },
    terms: ['network', 'wifi', 'internet', 'connectivity', 'ping', 'latency', 'slow speed', 'vpn', 'router', 'firewall', 'proxy', 'packet loss']
  },
  'Access & Security': {
    weight: 1.4,
    subcategories: {
      'Password & MFA Reset': ['password', 'reset password', 'forgot password', 'mfa', '2fa', 'authenticator', 'duo', 'okta', 'sso', 'locked out'],
      'Account Provisioning': ['new employee', 'onboarding', 'create account', 'email address', 'access permissions', 'role permission'],
      'Security Incident': ['phishing', 'malware', 'virus', 'suspicious email', 'ransomware', 'compromised', 'data breach', 'unauthorized']
    },
    terms: ['access', 'permission', 'password', 'login', 'credentials', 'mfa', 'security', 'privilege', 'admin rights', 'locked', 'forbidden', 'unauthorized']
  },
  'Email & Collaboration': {
    weight: 1.1,
    subcategories: {
      'Email Delivery & Spam': ['email bouncing', 'spam', 'junk', 'mail delivery', 'mailbox full', 'send receive', 'smtp', 'imap'],
      'Conferencing & Chat': ['zoom audio', 'teams video', 'slack channel', 'meeting room', 'screen share', 'huddle']
    },
    terms: ['email', 'inbox', 'mailbox', 'outlook', 'gmail', 'exchange', 'spam', 'calendar invite', 'conference', 'zoom', 'teams']
  },
  'Cloud & Infrastructure': {
    weight: 1.2,
    subcategories: {
      'Cloud Instances & Storage': ['aws', 'azure', 'gcp', 's3 bucket', 'ec2', 'virtual machine', 'blob', 'cloud storage'],
      'Database & Backup': ['mongodb', 'postgres', 'sql', 'backup restore', 'data loss', 'replication']
    },
    terms: ['cloud', 'aws', 'azure', 'serverless', 'instance', 'cluster', 'database', 'backup', 'snapshot', 'deployment']
  }
};

const URGENCY_KEYWORDS = {
  Critical: ['immediately', 'emergency', 'outage', 'entire team', 'all users', 'production down', 'down for everyone', 'ransomware', 'security breach', 'system halted', 'cannot work', 'blocking launch', 'critical'],
  High: ['urgent', 'high priority', 'deadline', 'asap', 'broken completely', 'unusable', 'all morning', 'cannot access client', 'executive', 'payroll'],
  Medium: ['moderate', 'issue', 'not working properly', 'glitch', 'slow', 'trouble', 'assistance', 'intermittent', 'sometimes'],
  Low: ['request', 'inquiry', 'question', 'minor', 'how to', 'when possible', 'information', 'guidance', 'upgrade request', 'recommendation']
};

const SENTIMENT_DICTIONARY = {
  Frustrated: ['furious', 'terrible', 'ridiculous', 'horrible', 'unacceptable', 'again and again', 'waste of time', 'fed up', 'broken again', 'frustrated'],
  Urgent: ['asap', 'immediately', 'emergency', 'halted', 'crisis', 'urgent', 'disaster', 'hurry', 'deadline'],
  Positive: ['thank you', 'please', 'kindly', 'appreciate', 'great', 'hello', 'good day'],
};

/**
 * AI Ticket Classifier
 * Analyzes title and description to predict category, subcategory, priority, urgency, sentiment & probable issue.
 */
const classifyTicket = (title = '', description = '') => {
  const combinedText = `${title} ${description}`.toLowerCase();
  const words = combinedText.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);

  // 1. Category Classification
  let bestCategory = 'Hardware';
  let bestSubcategory = 'Laptop / Workstation';
  let highestScore = 0;

  for (const [category, data] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    
    // Check main category terms
    for (const term of data.terms) {
      if (combinedText.includes(term)) {
        score += 2 * data.weight;
      }
    }

    // Check subcategory terms
    let subcategoryScores = {};
    for (const [subcat, subterms] of Object.entries(data.subcategories)) {
      subcategoryScores[subcat] = 0;
      for (const st of subterms) {
        if (combinedText.includes(st)) {
          subcategoryScores[subcat] += 3;
          score += 3 * data.weight;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
      
      // Determine best subcategory
      let bestSub = Object.keys(data.subcategories)[0];
      let maxSubScore = -1;
      for (const [sub, scScore] of Object.entries(subcategoryScores)) {
        if (scScore > maxSubScore) {
          maxSubScore = scScore;
          bestSub = sub;
        }
      }
      bestSubcategory = bestSub;
    }
  }

  // Calculate Confidence Score (40% - 98%)
  const confidence = Math.min(98, Math.max(52, Math.round((highestScore / 15) * 100)));

  // 2. Priority and Urgency Prediction
  let predictedPriority = 'Medium';
  let matchedUrgencyLevel = 'Medium';

  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    for (const kw of keywords) {
      if (combinedText.includes(kw)) {
        matchedUrgencyLevel = level;
        predictedPriority = level;
        break;
      }
    }
    if (matchedUrgencyLevel === 'Critical' || matchedUrgencyLevel === 'High') break;
  }

  // 3. Sentiment Analysis
  let sentiment = 'Neutral';
  for (const [sent, kwList] of Object.entries(SENTIMENT_DICTIONARY)) {
    if (kwList.some(k => combinedText.includes(k))) {
      sentiment = sent;
      break;
    }
  }

  // 4. Probable Root Cause & Suggested First-line Action
  let probableIssue = '';
  let suggestedAction = '';

  if (bestCategory === 'Access & Security' && combinedText.includes('password')) {
    probableIssue = 'Expired credentials or locked account state';
    suggestedAction = 'Check Active Directory/SSO lockout status and trigger secure self-service password reset.';
  } else if (bestCategory === 'Network & Connectivity' && (combinedText.includes('vpn') || combinedText.includes('remote'))) {
    probableIssue = 'VPN gateway authentication or stale local network route';
    suggestedAction = 'Verify user MFA registration and advise refreshing DNS / reinstalling VPN profile.';
  } else if (bestCategory === 'Hardware' && (combinedText.includes('battery') || combinedText.includes('charger') || combinedText.includes('screen'))) {
    probableIssue = 'Potential hardware component degradation or peripheral failure';
    suggestedAction = 'Verify device serial warranty status and arrange hardware diagnostics desk appointment.';
  } else if (bestCategory === 'Software' && (combinedText.includes('outlook') || combinedText.includes('teams') || combinedText.includes('slack'))) {
    probableIssue = 'Corrupted client local cache or authentication credential token';
    suggestedAction = 'Clear application appdata cache, restart client, and re-authenticate via SSO.';
  } else {
    probableIssue = `Potential ${bestSubcategory} configuration or connectivity anomaly`;
    suggestedAction = 'Review system event logs, corroborate with user asset specs, and apply standard troubleshooting runbook.';
  }

  return {
    predictedCategory: bestCategory,
    predictedSubcategory: bestSubcategory,
    predictedPriority,
    urgency: matchedUrgencyLevel,
    confidence,
    sentiment,
    probableIssue,
    suggestedAction,
  };
};

/**
 * AI Knowledge Base Matcher
 * Finds top matching Knowledge Base articles for a ticket description
 */
const suggestSolutions = async (title = '', description = '', category = '', limit = 4) => {
  try {
    const combined = `${title} ${description}`.toLowerCase();
    const searchTerms = combined
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);

    // Retrieve published articles
    let query = { status: 'Published' };
    const articles = await KnowledgeArticle.find(query).lean();

    if (!articles || articles.length === 0) return [];

    const scoredArticles = articles.map(art => {
      let score = 0;
      const artText = `${art.title} ${art.summary} ${art.content} ${(art.tags || []).join(' ')} ${(art.keywords || []).join(' ')}`.toLowerCase();

      // Category match bonus
      if (category && art.category && art.category.toLowerCase() === category.toLowerCase()) {
        score += 25;
      }

      // Exact title phrase overlap
      if (art.title && combined.includes(art.title.toLowerCase())) {
        score += 40;
      }

      // Keyword matches
      for (const term of searchTerms) {
        if (artText.includes(term)) {
          score += 6;
        }
      }

      // Helpful votes slight booster
      if (art.helpfulVotes > 0) {
        score += Math.min(15, art.helpfulVotes * 2);
      }

      // Normalize relevance score to percentage (0 - 100)
      const relevanceScore = Math.min(99, Math.max(15, Math.round(score * 1.3)));

      return {
        articleId: art._id,
        title: art.title,
        category: art.category,
        summary: art.summary,
        relevanceScore,
        snippet: art.summary || art.content.slice(0, 160) + '...',
        helpfulVotes: art.helpfulVotes || 0,
      };
    });

    // Sort by relevance score descending
    scoredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scoredArticles.slice(0, limit);
  } catch (error) {
    console.error(`[AI KB Suggestion Error]: ${error.message}`);
    return [];
  }
};

/**
 * AI Technician Copilot
 * Generates automated troubleshooting steps & suggested canned response for technician
 */
const generateTechnicianCopilot = (ticket) => {
  const title = ticket.title || '';
  const category = ticket.category || 'General';
  const priority = ticket.priority || 'Medium';

  return {
    summary: `Incident ${ticket.ticketNumber || 'TICK'} regarding ${category} - ${title}`,
    suggestedSteps: [
      `1. Confirm user's current device hostname / asset tag (${ticket.asset ? 'Linked Asset' : 'Verify with requester'}).`,
      `2. Review whether issue is isolated to single user or broad ${ticket.department || 'organization'} service disruption.`,
      `3. Reference internal KB SOP for ${category} incidents.`,
      `4. Execute primary triage and record work log minutes.`
    ],
    cannedResponseDraft: `Hello ${ticket.requester?.name || 'there'},\n\nThank you for reaching out to IT ServiceDesk. We have prioritized your request regarding "${title}" and are currently investigating.\n\nOur initial diagnostics indicate a probable ${category} resolution path. We will update you with further steps shortly.\n\nBest regards,\nIT Service Support Team`,
    recommendedWorkLogType: category.includes('Hardware') ? 'Hardware Replacement' : 'Remote Troubleshooting'
  };
};

module.exports = {
  classifyTicket,
  suggestSolutions,
  generateTechnicianCopilot,
};
