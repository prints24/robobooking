import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Bot, Zap, MessageSquare, User, CreditCard, Trash2, LayoutDashboard, Download, CheckCircle, TrendingUp } from 'lucide-react';

const MINUTE_RATE = 500;
// PASTE YOUR CLOUDFLARE URL HERE
const WORKER_URL = "https://g1-booking-api.manan-mongia.workers.dev"; 

const ROBOT_SERVICES = [
  { id: 'intro', name: 'Brand Introduction', duration: 5, description: 'Robot walks to your stall and gives a 2-minute pre-programmed speech.', icon: <MessageSquare />, basePrice: 2500 },
  { id: 'dance', name: 'Dance Performance', duration: 10, description: 'A high-energy choreographed dance routine to attract crowds.', icon: <Zap />, basePrice: 5000 },
  { id: 'fitness', name: 'Fitness Showcase', duration: 8, description: 'Robot performs squats, lunges, and push-ups.', icon: <TrendingUp />, basePrice: 4000 },
  { id: 'selfie', name: 'Selfie Session', duration: 15, description: 'Robot strikes poses and interacts with visitors for photos.', icon: <User />, basePrice: 7500 }
];

function App() {
  const [view, setView] = useState('exhibitor');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBooking, setNewBooking] = useState({ exhibitor: '', stall: '', serviceId: 'intro', time: '', customScript: '' });

  const selectedService = useMemo(() => ROBOT_SERVICES.find(s => s.id === newBooking.serviceId), [newBooking.serviceId]);
  const totalCost = selectedService ? selectedService.duration * MINUTE_RATE : 0;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBooking,
          service: selectedService.name,
          duration: selectedService.duration,
          cost: totalCost
        })
      });
      if (response.ok) {
        alert("Success! Your booking has been sent to the Google Sheet.");
        setIsBookingModalOpen(false);
        setNewBooking({ exhibitor: '', stall: '', serviceId: 'intro', time: '', customScript: '' });
      }
    } catch (err) {
      alert("Error saving booking. Check your Cloudflare Worker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 p-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="text-blue-600 w-8 h-8" />
            <span className="font-bold text-xl">G1 Expo Services</span>
          </div>
          <button onClick={() => setView(view === 'exhibitor' ? 'admin' : 'exhibitor')} className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            {view === 'exhibitor' ? 'Admin Dashboard' : 'Back to Booking'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {view === 'exhibitor' ? (
          <div className="space-y-8">
            <header className="text-center space-y-4">
              <h1 className="text-4xl font-black md:text-6xl">Hire the <span className="text-blue-600">Unitree G1</span></h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Make your stall the main attraction at the National Printing Expo.</p>
              <div className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold">₹{MINUTE_RATE} / minute</div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ROBOT_SERVICES.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all">
                  <div className="text-blue-600 mb-4 scale-150 origin-left ml-2">{s.icon}</div>
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{s.description}</p>
                  <div className="flex justify-between items-end border-t pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase">{s.duration} Mins</span>
                    <span className="font-bold text-blue-600">₹{s.duration * MINUTE_RATE}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-600 rounded-3xl p-8 text-center text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-4">Ready to Book?</h2>
              <button onClick={() => setIsBookingModalOpen(true)} className="bg-white text-blue-600 px-10 py-4 rounded-xl font-black text-xl hover:bg-slate-100 transition-colors">
                Book Robot Now
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200">
             <h2 className="text-2xl font-bold mb-4">Admin: Manage Bookings</h2>
             <p className="text-slate-500">All bookings are automatically saved to your <a href={`https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE`} target="_blank" className="text-blue-600 underline">Google Sheet</a>.</p>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <form onSubmit={handleBookingSubmit} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-2xl font-bold">New Booking</h2>
            <input required placeholder="Exhibitor Name" className="w-full bg-slate-100 p-4 rounded-xl outline-none" onChange={e => setNewBooking({...newBooking, exhibitor: e.target.value})} />
            <input required placeholder="Stall Number" className="w-full bg-slate-100 p-4 rounded-xl outline-none" onChange={e => setNewBooking({...newBooking, stall: e.target.value})} />
            <select className="w-full bg-slate-100 p-4 rounded-xl outline-none" onChange={e => setNewBooking({...newBooking, serviceId: e.target.value})}>
              {ROBOT_SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
            </select>
            <input required type="time" className="w-full bg-slate-100 p-4 rounded-xl outline-none" onChange={e => setNewBooking({...newBooking, time: e.target.value})} />
            <textarea placeholder="Speech script for the G1..." className="w-full bg-slate-100 p-4 rounded-xl outline-none" rows="3" onChange={e => setNewBooking({...newBooking, customScript: e.target.value})} />
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
              <span className="font-bold text-blue-600">Total: ₹{totalCost}</span>
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
            <button type="button" onClick={() => setIsBookingModalOpen(false)} className="w-full text-slate-400 text-sm">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);