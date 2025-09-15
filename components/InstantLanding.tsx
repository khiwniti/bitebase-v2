import { Suspense } from 'react';

// Ultra-lightweight landing page for instant loading
const InstantLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section - Minimal styling for instant render */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            BiteBase Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-Powered Restaurant Market Research
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid - Basic layout */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Market Analysis</h3>
            <p className="text-gray-600">AI-powered insights into local market conditions</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Data Visualization</h3>
            <p className="text-gray-600">Interactive maps and comprehensive reports</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-purple-600 text-xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Agents</h3>
            <p className="text-gray-600">Specialized agents for different research tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantLanding;