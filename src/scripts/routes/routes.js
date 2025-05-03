import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import StoriesPage from '../pages/stories/stories-page';
import DetailStoryPage from '../pages/stories/detail-story-page';
import AddStoriesPage from '../pages/stories/add-story-page';
import AddGuestStoryPage from '../pages/stories/add-guest-story-page';
import NotificationsPage from '../pages/notifications/notifications-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories': new StoriesPage(),
  '/stories/:id': new DetailStoryPage(),
  '/add-story': new AddStoriesPage(),
  '/add-guest-story': new AddGuestStoryPage(),
  '/notification': new NotificationsPage(),
};

export default routes;
