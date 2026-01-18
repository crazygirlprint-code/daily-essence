import Activities from './pages/Activities';
import Affirmations from './pages/Affirmations';
import Beauty from './pages/Beauty';
import Budget from './pages/Budget';
import Calendar from './pages/Calendar';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activities": Activities,
    "Affirmations": Affirmations,
    "Beauty": Beauty,
    "Budget": Budget,
    "Calendar": Calendar,
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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};