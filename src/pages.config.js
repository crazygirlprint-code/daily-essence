import Affirmations from './pages/Affirmations';
import Beauty from './pages/Beauty';
import Calendar from './pages/Calendar';
import Events from './pages/Events';
import Family from './pages/Family';
import Home from './pages/Home';
import Meditation from './pages/Meditation';
import Progress from './pages/Progress';
import SelfCare from './pages/SelfCare';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Affirmations": Affirmations,
    "Beauty": Beauty,
    "Calendar": Calendar,
    "Events": Events,
    "Family": Family,
    "Home": Home,
    "Meditation": Meditation,
    "Progress": Progress,
    "SelfCare": SelfCare,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};