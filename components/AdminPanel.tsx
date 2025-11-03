import React, { useState, useEffect } from 'react';
import { BusMapIcon, TrackBusIcon } from './icons';

// This would typically be in types.ts but is specific to this simulation
interface MockBus {
    id: string;
    routeNumber: string;
    vehicleId: string;
    start: string;
    end: string;
}

const MOCK_BUSES_KEY = 'nammabus_mock_buses';

// A small set of initial buses for the demo
const initializeBuses = () => {
    if (!localStorage.getItem(MOCK_BUSES_KEY)) {
        const initialBuses: MockBus[] = [
            { id: '1', routeNumber: '500D', vehicleId: 'KA-01-F-1234', start: 'Hebbal', end: 'Central Silk Board' },
            { id: '2', routeNumber: '356W', vehicleId: 'KA-01-G-5678', start: 'KR Market', end: 'Kadugodi' },
            { id: '3', routeNumber: '201', vehicleId: 'KA-57-H-9012', start: 'Srinagar', end: 'Shivajinagar' },
        ];
        localStorage.setItem(MOCK_BUSES_KEY, JSON.stringify(initialBuses));
    }
};

initializeBuses();

const AdminPanel: React.FC = () => {
    const [buses, setBuses] = useState<MockBus[]>([]);
    const [routeNumber, setRouteNumber] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedBuses = JSON.parse(localStorage.getItem(MOCK_BUSES_KEY) || '[]');
        setBuses(storedBuses);
    }, []);

    const handleAddBus = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Simulate async operation
        setTimeout(() => {
            const newBus: MockBus = {
                id: Date.now().toString(),
                routeNumber,
                vehicleId,
                start,
                end,
            };

            const updatedBuses = [...buses, newBus];
            localStorage.setItem(MOCK_BUSES_KEY, JSON.stringify(updatedBuses));
            setBuses(updatedBuses);

            // Reset form
            setRouteNumber('');
            setVehicleId('');
            setStart('');
            setEnd('');
            setIsLoading(false);
            setMessage(`Bus ${vehicleId} on route ${routeNumber} added successfully!`);
            
            // Clear message after a few seconds
            setTimeout(() => setMessage(''), 3000);

        }, 500);
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Admin Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Bus Form */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                        <TrackBusIcon className="h-6 w-6 mr-2 text-indigo-600"/>
                        Add a New Bus
                    </h3>
                    <form onSubmit={handleAddBus} className="space-y-4">
                        <div>
                            <label htmlFor="routeNumberAdmin" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Route Number</label>
                            <input type="text" id="routeNumberAdmin" value={routeNumber} onChange={(e) => setRouteNumber(e.target.value)} required placeholder="e.g., 500D" className="mt-1 block w-full input-style"/>
                        </div>
                        <div>
                            <label htmlFor="vehicleIdAdmin" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vehicle ID</label>
                            <input type="text" id="vehicleIdAdmin" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required placeholder="e.g., KA-01-AB-1234" className="mt-1 block w-full input-style"/>
                        </div>
                         <div>
                            <label htmlFor="startAdmin" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Point</label>
                            <input type="text" id="startAdmin" value={start} onChange={(e) => setStart(e.target.value)} required placeholder="e.g., Majestic" className="mt-1 block w-full input-style"/>
                        </div>
                         <div>
                            <label htmlFor="endAdmin" className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Point</label>
                            <input type="text" id="endAdmin" value={end} onChange={(e) => setEnd(e.target.value)} required placeholder="e.g., Marathahalli" className="mt-1 block w-full input-style"/>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                            {isLoading ? 'Adding...' : 'Add Bus to System'}
                        </button>
                        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
                    </form>
                </div>

                {/* Bus List */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">Current Bus Fleet</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {buses.length > 0 ? buses.map(bus => (
                            <div key={bus.id} className="p-3 bg-white dark:bg-slate-800 rounded-md shadow-sm flex items-center gap-4">
                               <BusMapIcon className="w-8 h-8 text-indigo-500 flex-shrink-0"/>
                               <div>
                                   <p className="font-bold text-slate-800 dark:text-slate-100">Route: {bus.routeNumber}</p>
                                   <p className="text-sm font-mono text-slate-600 dark:text-slate-400">{bus.vehicleId}</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-500">{bus.start} → {bus.end}</p>
                               </div>
                            </div>
                        )) : <p className="text-slate-500 dark:text-slate-400">No buses in the system.</p>}
                    </div>
                </div>
            </div>
             <style>{`.input-style { @apply px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }`}</style>
        </div>
    );
};

export default AdminPanel;