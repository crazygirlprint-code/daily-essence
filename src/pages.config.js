/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Activities from './pages/Activities';
import Affirmations from './pages/Affirmations';
import Beauty from './pages/Beauty';
import Budget from './pages/Budget';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Events from './pages/Events';
import Family from './pages/Family';
import Home from './pages/Home';
import Meditation from './pages/Meditation';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import SelfCare from './pages/SelfCare';
import Strolling from './pages/Strolling';
import Wellness from './pages/Wellness';
import SharedCalendar from './pages/SharedCalendar';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activities": Activities,
    "Affirmations": Affirmations,
    "Beauty": Beauty,
    "Budget": Budget,
    "Calendar": Calendar,
    "Chat": Chat,
    "Community": Community,
    "Events": Events,
    "Family": Family,
    "Home": Home,
    "Meditation": Meditation,
    "Pricing": Pricing,
    "Profile": Profile,
    "Progress": Progress,
    "SelfCare": SelfCare,
    "Strolling": Strolling,
    "Wellness": Wellness,
    "SharedCalendar": SharedCalendar,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};