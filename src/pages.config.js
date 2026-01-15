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
import Progress from './pages/Progress';
import SelfCare from './pages/SelfCare';
import __Layout from './Layout.jsx';


export const PAGES = {
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
    "Progress": Progress,
    "SelfCare": SelfCare,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};