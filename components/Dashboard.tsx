import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Phone, Clock, Activity, Users } from 'lucide-react';
import { MOCK_CALLS } from '../constants';

const data = [
  { name: '9 AM', calls: 12 },
  { name: '10 AM', calls: 19 },
  { name: '11 AM', calls: 24 },
  { name: '12 PM', calls: 15 },
  { name: '1 PM', calls: 28 },
  { name: '2 PM', calls: 32 },
  { name: '3 PM', calls: 25 },
];

const sentimentData = [
  { name: 'Mon', score: 85 },
  { name: 'Tue', score: 82 },
  { name: 'Wed', score: 88 },
  { name: 'Thu', score: 92 },
  { name: 'Fri', score: 89 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto pr-2">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Calls Today', value: '145', icon: Phone, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Avg Handle Time', value: '1m 42s', icon: Clock, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Active Lines', value: '3', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-400/10' },
          { label: 'Lead Capture Rate', value: '24%', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Call Volume (Hourly)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Sentiment Analysis Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Calls List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">Recent Call Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Caller ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Sentiment</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_CALLS.map((call) => (
                <tr key={call.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{call.caller}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      call.status === 'Missed' ? 'bg-red-400/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'
                    }`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{call.duration}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      call.sentiment === 'Positive' ? 'text-emerald-400' :
                      call.sentiment === 'Negative' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {call.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{call.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;