import { InstalledApp } from '../types';

export const INITIAL_INSTALLED_APPS: InstalledApp[] = [
  {
    packageName: 'com.whatsapp',
    appName: 'WhatsApp',
    category: 'Messaging',
    icon: 'MessageSquare',
    enabled: true,
    sampleConversations: [
      {
        sender: 'Aarav (Debate Group)',
        text: 'What did Gandhi do for India\'s freedom?',
        timestamp: '10:42 AM',
      },
      {
        sender: 'Priya',
        text: 'If everyone got freedom, then why are people judged by their caste?',
        timestamp: '11:15 AM',
      },
      {
        sender: 'Rohan',
        text: 'Do you think remote work increases long-term productivity or isolates teams?',
        timestamp: 'Yesterday',
      },
    ],
  },
  {
    packageName: 'com.je.supersus',
    appName: 'Super Sus (Who Is The Impostor)',
    category: 'Gaming',
    icon: 'Gamepad2',
    enabled: true,
    sampleConversations: [
      {
        sender: 'Player_Red',
        text: 'Where was Spacecrew Blue when the reactor sabotage happened? Sus!',
        timestamp: 'Emergency Meeting',
      },
      {
        sender: 'Detective_Yellow',
        text: 'I saw Green near the medical bay vent right after the body was reported.',
        timestamp: 'Voting Phase',
      },
      {
        sender: 'Sheriff_Alex',
        text: 'Should we skip voting or eject Cyan? Give your evidence now.',
        timestamp: 'Round 2',
      },
    ],
  },
  {
    packageName: 'com.lemur.virtualmaster',
    appName: 'Virtual Master (Android VM Sandbox)',
    category: 'VirtualMachine',
    icon: 'Layers',
    enabled: true,
    isVirtualEnvironment: true,
    vmCompatibilityNotes: 'Runs guest Android OS inside host sandbox. ReplyFloat AI overlay operates from host window layer over VM display, with accessibility bridge or screen projection fallback.',
    sampleConversations: [
      {
        sender: 'VM Guest App (Telegram)',
        text: 'How do I bypass network proxy certificates in virtual space?',
        timestamp: 'Inside VM',
      },
      {
        sender: 'VM Root Shell Log',
        text: 'Virtual container initialized. Accessibility hook bridging enabled.',
        timestamp: 'VM OS 12.0',
      },
    ],
  },
  {
    packageName: 'com.discord',
    appName: 'Discord',
    category: 'Gaming',
    icon: 'Gamepad2',
    enabled: true,
    sampleConversations: [
      {
        sender: 'Vortex_Gamer',
        text: 'Why do players blame game balance instead of improving their own decision making?',
        timestamp: '12:04 PM',
      },
      {
        sender: 'CyberKnight',
        text: 'Should open-world games focus on huge map sizes or dense, interactive mini-quests?',
        timestamp: '01:20 PM',
      },
    ],
  },
  {
    packageName: 'org.telegram.messenger',
    appName: 'Telegram',
    category: 'Messaging',
    icon: 'Send',
    enabled: true,
    sampleConversations: [
      {
        sender: 'Alex Dev',
        text: 'What are the genuine pros and cons of using Kotlin Multiplatform over Flutter in 2026?',
        timestamp: '3h ago',
      },
      {
        sender: 'OpenSource Chat',
        text: 'Is server-side streaming tokens better than batch JSON for mobile UI responsiveness?',
        timestamp: '5h ago',
      },
    ],
  },
  {
    packageName: 'com.android.chrome',
    appName: 'Browser (Chrome)',
    category: 'Browser',
    icon: 'Globe',
    enabled: true,
    sampleConversations: [
      {
        sender: 'Forum Comment',
        text: 'Should electric vehicles be mandated before the charging grid is fully modernized?',
        timestamp: 'Active Tab',
      },
      {
        sender: 'Article Discussion',
        text: 'What is the most effective approach to reducing global carbon emissions in transport?',
        timestamp: 'Article Read',
      },
    ],
  },
  {
    packageName: 'com.reddit.frontpage',
    appName: 'Reddit',
    category: 'Social',
    icon: 'Flame',
    enabled: false,
    sampleConversations: [
      {
        sender: 'u/PhilosophySeeker',
        text: 'If universal healthcare is considered a human right, why do some argue it stifles medical innovation and creates long waitlists?',
        timestamp: '2h ago',
      },
    ],
  },
  {
    packageName: 'com.slack',
    appName: 'Slack',
    category: 'Work',
    icon: 'Briefcase',
    enabled: false,
    sampleConversations: [
      {
        sender: 'Marcus (Product Lead)',
        text: 'We need to decide whether to ship MVP this Friday or spend two more weeks refining the UI animations. Thoughts?',
        timestamp: '09:30 AM',
      },
    ],
  },
];

