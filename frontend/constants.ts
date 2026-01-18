
import { Subscription, BillingCycle } from './types';

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    amount: 15.99,
    cycle: BillingCycle.MONTHLY,
    billingDate: 2,
    category: 'Entertainment',
    icon: 'fa-brands fa-netflix',
    color: '#E50914'
  },
  {
    id: '2',
    name: 'Spotify',
    amount: 9.99,
    cycle: BillingCycle.MONTHLY,
    billingDate: 4,
    category: 'Music',
    icon: 'fa-solid fa-music',
    color: '#1DB954'
  },
  {
    id: '3',
    name: 'Adobe CC',
    amount: 52.99,
    cycle: BillingCycle.MONTHLY,
    billingDate: 7,
    category: 'Design',
    icon: 'fa-brands fa-adobe',
    color: '#FF0000'
  },
  {
    id: '4',
    name: 'iCloud+',
    amount: 0.99,
    cycle: BillingCycle.MONTHLY,
    billingDate: 12,
    category: 'Storage',
    icon: 'fa-brands fa-apple',
    color: '#FFFFFF'
  },
  {
    id: '5',
    name: 'Dropbox',
    amount: 120.00,
    cycle: BillingCycle.YEARLY,
    billingDate: 10,
    category: 'Storage',
    icon: 'fa-brands fa-dropbox',
    color: '#0061FF'
  },
  {
    id: '6',
    name: 'Slack Pro',
    amount: 8.00,
    cycle: BillingCycle.MONTHLY,
    billingDate: 25,
    category: 'Work',
    icon: 'fa-brands fa-slack',
    color: '#E01E5A'
  },
  {
    id: '7',
    name: 'Figma Pro',
    amount: 15.00,
    cycle: BillingCycle.MONTHLY,
    billingDate: 28,
    category: 'Design',
    icon: 'fa-brands fa-figma',
    color: '#F24E1E'
  }
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
