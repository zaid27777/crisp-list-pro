import { useAuth } from '@/hooks/useAuth';
import TodoApp from './TodoApp';
import Auth from './Auth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[hsl(var(--ios-blue))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[hsl(var(--ios-text-secondary))]">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <TodoApp /> : <Auth />;
};

export default Index;
