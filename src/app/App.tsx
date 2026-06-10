import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider } from './context';
import { router } from './routes';

export default function App() {
  return (
    <AppProvider>
      {/* MARKER-MAKE-KIT-INVOKED */}
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1A2634',
            color: '#F1F5F9',
            border: '1px solid rgba(245,158,11,0.3)',
            fontSize: '16px',
          },
        }}
      />
    </AppProvider>
  );
}
