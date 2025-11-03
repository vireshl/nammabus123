import { Feature } from './types';
import {
  JourneyPlannerIcon,
  TrackBusIcon,
  SearchByRouteIcon,
  TrackLiveRouteIcon,
  TimeTableIcon,
  AroundBusStationIcon,
  FacilitiesIcon,
  FareCalculatorIcon,
  FeedbackIcon,
  UserGuideIcon,
  AdminPanelIcon,
  UserProfileIcon, // New
} from './components/icons';

export const features: Feature[] = [
  {
    title: 'Journey Planner',
    description: 'Plan your trip from A to B',
    Icon: JourneyPlannerIcon,
  },
  {
    title: 'Track a Bus',
    description: 'Find a specific bus by number',
    Icon: TrackBusIcon,
  },
  {
    title: 'Search by Route',
    description: 'See stops for a route number',
    Icon: SearchByRouteIcon,
  },
  {
    title: 'Track A Live Route',
    description: 'Live locations of buses on a route',
    Icon: TrackLiveRouteIcon,
  },
  {
    title: 'My Profile',
    description: 'Favorites & search history',
    Icon: UserProfileIcon,
    authRequired: true, // Mark as login-required
  },
  {
    title: 'Time Table',
    description: 'Check route schedules',
    Icon: TimeTableIcon,
  },
  {
    title: 'Around Bus Station',
    description: 'Find nearby stations',
    Icon: AroundBusStationIcon,
  },
  {
    title: 'Facilities',
    description: 'Learn about BMTC facilities',
    Icon: FacilitiesIcon,
  },
  {
    title: 'Fare Calculator',
    description: 'Estimate your ticket price',
    Icon: FareCalculatorIcon,
  },
  {
    title: 'Feedback',
    description: 'Share your experience',
    Icon: FeedbackIcon,
  },
  {
    title: 'User Guide',
    description: 'How to use BMTC services',
    Icon: UserGuideIcon,
  },
  {
    title: 'Admin Panel',
    description: 'Manage the bus system',
    Icon: AdminPanelIcon,
    adminOnly: true, // Mark as admin-only
  },
];