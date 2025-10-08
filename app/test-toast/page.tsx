'use client';

import { useToast, useToastActions } from '@/hooks/useToast';
import { toast } from '@/lib/toast';

export default function TestToastPage() {
  const toastHook = useToast();
  const toastActions = useToastActions();

  const testDirectToast = () => {
    toast.success('Direct Toast Success!', {
      description: 'This is using the direct toast import'
    });
  };

  const testHookToast = () => {
    toastHook.success('Hook Toast Success!', {
      description: 'This is using the useToast hook'
    });
  };

  const testActionsToast = () => {
    toastActions.success('Actions Toast Success!', 'This is using the useToastActions hook');
  };

  const testErrorToast = () => {
    toast.error('Error Toast!', {
      description: 'This is an error message'
    });
  };

  const testWarningToast = () => {
    toast.warning('Warning Toast!', {
      description: 'This is a warning message'
    });
  };

  const testInfoToast = () => {
    toast.info('Info Toast!', {
      description: 'This is an info message'
    });
  };

  const testLoadingToast = () => {
    const loadingToast = toast.loading('Loading...', {
      description: 'This will auto-dismiss in 3 seconds'
    });
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('Loading Complete!');
    }, 3000);
  };

  const testPromiseToast = () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve('Success!') : reject('Failed!');
      }, 2000);
    });

    toast.promise(promise, {
      loading: 'Processing...',
      success: 'Promise resolved successfully!',
      error: 'Promise failed!'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Toast System Test
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={testDirectToast}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Direct Toast Success
          </button>
          
          <button
            onClick={testHookToast}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Hook Toast Success
          </button>
          
          <button
            onClick={testActionsToast}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Actions Toast Success
          </button>
          
          <button
            onClick={testErrorToast}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Error Toast
          </button>
          
          <button
            onClick={testWarningToast}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Warning Toast
          </button>
          
          <button
            onClick={testInfoToast}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Info Toast
          </button>
          
          <button
            onClick={testLoadingToast}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Loading Toast
          </button>
          
          <button
            onClick={testPromiseToast}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Promise Toast
          </button>
        </div>

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Toast System Features
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>✅ Unified API using Sonner</li>
            <li>✅ Multiple import methods (direct, hook, actions)</li>
            <li>✅ All toast types (success, error, warning, info, loading)</li>
            <li>✅ Promise handling</li>
            <li>✅ Auto-dismiss with configurable duration</li>
            <li>✅ Manual dismiss functionality</li>
            <li>✅ Rich colors and close button</li>
            <li>✅ System theme support</li>
            <li>✅ Responsive design</li>
            <li>✅ Accessibility features</li>
          </ul>
        </div>
      </div>
    </div>
  );
}