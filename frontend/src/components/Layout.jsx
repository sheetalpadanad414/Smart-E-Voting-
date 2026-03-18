import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
