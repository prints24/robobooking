import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Bot, Zap, MessageSquare, User, CreditCard, Trash2, LayoutDashboard, Download, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

const MINUTE_RATE = 400;
// PASTE YOUR CLOUDFLARE URL HERE
const WORKER_URL = "https://g1-booking-api.manan-mongia.workers.dev"; 

const ROBOT_SERVICES = [
  { id: 'intro', name: 'Brand Introduction', duration: 5, description: 'Robot walks to your stall and gives a 2-minute pre-programmed speech.', icon: <MessageSquare />, basePrice: 1999 },
  { id: 'dance', name: 'Dance Performance', duration: 10, description: 'A high-energy choreographed dance routine to attract crowds.', icon: <Zap />, basePrice: 3999 },
  { id: 'fitness', name: 'Fitness Showcase', duration: 8, description: 'Robot performs squats, lunges, and push-ups.', icon: <TrendingUp />, basePrice: 3199 },
  { id: 'selfie', name: 'Selfie Session', duration: 15, description: 'Robot strikes poses and interacts with visitors for photos.', icon: <User />, basePrice: 5999 }
];

function App() {
  const [view, setView] = useState('exhibitor');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBooking, setNewBooking] = useState({ exhibitor: '', stall: '', serviceId: 'intro', date: '2026-03-28', time: '', customScript: '' });

  const [feedback, setFeedback] = useState({ 
    isOpen: false, 
    type: 'success', // 'success', 'error', or 'conflict'
    title: '', 
    message: '' 
  });

  const [existingBookings, setExistingBookings] = useState([]);
  // Fetch bookings on load
  useEffect(() => {
    fetch("YOUR_APPS_SCRIPT_URL")
      .then(res => res.json())
      .then(data => setExistingBookings(data));
  }, []);

  const selectedService = useMemo(() => ROBOT_SERVICES.find(s => s.id === newBooking.serviceId), [newBooking.serviceId]);
  const totalCost = selectedService ? selectedService.basePrice : 0;

  const isTimeSlotBlocked = (date, time, duration) => {
    const [h, m] = time.split(':').map(Number);
    const newStart = h * 60 + m;
    const newEnd = newStart + parseInt(duration) + 5; // Total busy time

    return existingBookings.some(booking => {
      if (booking.date !== date) return false;

      const [exH, exM] = booking.time.split(':').map(Number);
      const exStart = exH * 60 + exM;
      const exEnd = exStart + parseInt(booking.duration) + 5;

      // The Overlap Logic
      return (newStart < exEnd) && (newEnd > exStart);
    });
  };

  const handleServiceClick = (serviceId) => {
    setNewBooking(prev => ({ ...prev, serviceId: serviceId }));
    setIsBookingModalOpen(true);
  };
  
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    // --- TIME RESTRICTION CHECK ---
    const [hours, minutes] = newBooking.time.split(':').map(Number);
    const selectedTimeInMinutes = hours * 60 + minutes;
    
    const openingTime = 10 * 60; // 10:00 AM
    const closingTime = 18 * 0;  // 6:00 PM (18:00)

    if (selectedTimeInMinutes < openingTime || selectedTimeInMinutes > closingTime) {
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Outside Operating Hours',
        message: 'The G1 Robot is only available for bookings between 10:00 AM and 6:00 PM.'+'(Select: '+selectedTimeInMinutes+' | Open: '+openingTime+' | Close: '+closingTime
      });
      return; // Stop the function here
    }
    // --- END OF CHECK ---
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

      if (response.status === 409) {
        setFeedback({
          isOpen: true,
          type: 'conflict',
          title: 'Slot Unavailable',
          message: 'The Unitree G1 is already booked for this specific date and time. Please pick another slot!'
        });
      } else if (response.ok) {
        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Booking Confirmed!',
          message: `We have reserved the G1 for ${newBooking.exhibitor} at Stall ${newBooking.stall}. See you on March ${newBooking.date.split('-')[2]}!`
        });
        setIsBookingModalOpen(false);
        setNewBooking({ exhibitor: '', stall: '', serviceId: 'intro', date: '2026-03-28', time: '', customScript: '' });
      } else {
        throw new Error("Server Error");
      }
    } catch (err) {
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Connection Failed',
        message: 'We could not reach the booking server. Please check your internet or try again.'
      });
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
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {view === 'exhibitor' ? (
          <div className="space-y-8">
            <header className="text-center space-y-4">
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Official Robot Partner</div>
              <h1 className="text-4xl font-black md:text-6xl">Hire the <span className="text-blue-600">Unitree G1</span></h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Make your stall the main attraction at the National Printing Expo.</p>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Select a service below to bring the world's most advanced humanoid to your stall.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ROBOT_SERVICES.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => handleServiceClick(s.id)} // Opens modal & selects service
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="text-blue-600 mb-4 scale-150 origin-left ml-2 group-hover:scale-[1.6] transition-transform">{s.icon}</div>
                  <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{s.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{s.description}</p>
                  <div className="flex justify-between items-end border-t pt-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase block">Duration</span>
                      <span className="font-semibold">{s.duration} Mins</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 uppercase block">Package Cost</span>
                      <span className="font-bold text-blue-600">₹{s.basePrice}</span>
                    </div>
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
            <select className="w-full bg-slate-100 p-4 rounded-xl outline-none" value={newBooking.serviceId} onChange={e => setNewBooking({...newBooking, serviceId: e.target.value})}>
              {ROBOT_SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
            </select>
            <select 
                className="w-full bg-slate-100 p-4 rounded-xl outline-none" 
                value={newBooking.date}
                onChange={e => setNewBooking({...newBooking, date: e.target.value})}
              >
                <option value="2026-03-28">March 28 (Day 1)</option>
                <option value="2026-03-29">March 29 (Day 2)</option>
                <option value="2026-03-30">March 30 (Day 3)</option>
              </select>
            <input required type="time" className={`w-full p-4 rounded-xl outline-none ${isTimeSlotBlocked(newBooking.date, newBooking.time, selectedService.duration) ? 'bg-red-50 border-2 border-red-200' : 'bg-slate-100'}`} value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} />
            {/* Show warning message if blocked */}
            {newBooking.time && isTimeSlotBlocked(newBooking.date, newBooking.time, selectedService.duration) && (<p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> This slot is overlapping with another booking.</p>)}
            <textarea placeholder="Speech script for the G1..." className="w-full bg-slate-100 p-4 rounded-xl outline-none" rows="3" onChange={e => setNewBooking({...newBooking, customScript: e.target.value})} />
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
              <span className="font-bold text-blue-600">Total: ₹{totalCost}</span>
              <button type="submit" disabled={loading || isTimeSlotBlocked(newBooking.date, newBooking.time, selectedService.duration)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
            <button type="button" onClick={() => setIsBookingModalOpen(false)} className="w-full text-slate-400 text-sm">Cancel</button>
          </form>
        </div>
      )}
      {/* Feedback Modal */}
      {feedback.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-in-center border border-slate-100">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
              feedback.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
              feedback.type === 'conflict' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
            }`}>
              {feedback.type === 'success' && <CheckCircle className="w-12 h-12" />}
              {feedback.type === 'conflict' && <AlertCircle className="w-12 h-12" />}
              {feedback.type === 'error' && <Trash2 className="w-12 h-12" />}
            </div>
            
            <h2 className="text-2xl font-black mb-2 text-slate-800">{feedback.title}</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">{feedback.message}</p>
            
            <button 
              onClick={() => setFeedback({ ...feedback, isOpen: false })}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                feedback.type === 'success' ? 'bg-emerald-500 shadow-emerald-200' : 
                feedback.type === 'conflict' ? 'bg-amber-500 shadow-amber-200' : 'bg-red-500 shadow-red-200'
              }`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);