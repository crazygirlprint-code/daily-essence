import Beauty from './pages/Beauty';
import Events from './pages/Events';
import SelfCare from './pages/SelfCare';
import Strolling from './pages/Strolling';
import Pricing from './pages/Pricing';
import Progress from './pages/Progress';
import Budget from './pages/Budget';
import Family from './pages/Family';
import Wellness from './pages/Wellness';
import Meditation from './pages/Meditation';
import Affirmations from './pages/Affirmations';
import Community from './pages/Community';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Activities from './pages/Activities';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Beauty": Beauty,
    "Events": Events,
    "SelfCare": SelfCare,
    "Strolling": Strolling,
    "Pricing": Pricing,
    "Progress": Progress,
    "Budget": Budget,
    "Family": Family,
    "Wellness": Wellness,
    "Meditation": Meditation,
    "Affirmations": Affirmations,
    "Community": Community,
    "Calendar": Calendar,
    "Profile": Profile,
    "Home": Home,
    "Activities": Activities,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};