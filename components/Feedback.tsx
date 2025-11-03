import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { currentUser } = useAuth(); // Get current user

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    // Set the recipient email to the user-provided address
    const recipientEmail = 'vireshlawani123@gmail.com';
    const subject = `NammaBus Feedback from ${currentUser?.username || 'Anonymous User'}`;
    
    // Construct the mailto link, ensuring the body text is properly encoded for a URL
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(feedback)}`;

    // This command opens the user's default email client
    window.location.href = mailtoLink;

    setSubmitted(true);
    setFeedback('');
    // Reset the form after a delay so the user can see the confirmation
    setTimeout(() => setSubmitted(false), 8000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Feedback</h2>
      {submitted ? (
        <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fade-in">
          <p className="font-bold">Thank you, {currentUser?.username || 'guest'}!</p>
          <p>Your email application should now be open. Please review and send your feedback from there.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Share your thoughts, suggestions, or report an issue.
              {currentUser && <span className="text-xs text-slate-500 dark:text-slate-400"> (as {currentUser.username})</span>}
            </label>
            <textarea
              id="feedback"
              rows={6}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            disabled={!feedback.trim()}
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
};

export default Feedback;