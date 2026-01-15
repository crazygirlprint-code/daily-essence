import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Family from './pages/Family';
import Affirmations from './pages/Affirmations';
import Beauty from './pages/Beauty';
import Meditation from './pages/Meditation';
import SelfCare from './pages/SelfCare';
import Events from './pages/Events';
import Progress from './pages/Progress';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Calendar": Calendar,
    "Family": Family,
    "Affirmations": Affirmations,
    "Beauty": Beauty,
    "Meditation": Meditation,
    "SelfCare": SelfCare,
    "Events": Events,
    "Progress": Progress,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};