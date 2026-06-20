import Home from './pages/Home';
import About from './pages/About';
import Music from './pages/Music';
import Contact from './pages/Contact';
import GalleryAdmin from './pages/GalleryAdmin';
import Admin from './pages/Admin';
import Events from './pages/Events';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "About": About,
    "Music": Music,
    "Contact": Contact,
    "GalleryAdmin": GalleryAdmin,
    "Admin": Admin,
    "Events": Events,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};