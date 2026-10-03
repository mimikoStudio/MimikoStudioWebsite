import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { useAppointments } from '../../hooks/useData';
import { createWhatsAppLink } from '../../lib/supabase';

export default function AppointmentsManager() {
  const { appointments, loading, refetch } = useAppointments();
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      requested: 'bg-gold/10 text-gold border-gold/20',
      confirmed: 'bg-sage/10 text-sage border-sage/20',
      rescheduled: 'bg-sky/10 text-sky border-sky/20',
      cancelled: 'bg-chocolate/10 text-chocolate border-chocolate/20',
      completed: 'bg-leaf/10 text-leaf border-leaf/20',
      rejected: 'bg-blush/10 text-blush border-blush/20',
    };
    return colors[status] || 'bg-coffee/10 text-coffee border-coffee/20';
  };

  const getGroupedAppointments = () => {
    const grouped: Record<string, any[]> = {};
    filteredAppointments.forEach((apt) => {
      const date = apt.appointment_date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(apt);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">📅 Appointments Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`btn-outline ${viewMode === 'list' ? 'bg-gold/10 border-gold text-gold' : ''}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`btn-outline ${viewMode === 'calendar' ? 'bg-gold/10 border-gold text-gold' : ''}`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-pearl border border-beige/20 rounded-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-luxury"
          >
            <option value="all">All Status</option>
            <option value="requested">Requested</option>
            <option value="confirmed">Confirmed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="text-sm text-coffee/60 flex items-center">
            Total: {appointments.length} appointments
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {getGroupedAppointments().map(([date, apts]) => (
            <div key={date}>
              <h3 className="font-label text-sm tracking-wider uppercase text-gold mb-3 flex items-center gap-2">
                <Calendar size={14} /> {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="space-y-3">
                {apts.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-pearl border border-beige/20 rounded-sm p-6 hover:shadow-luxury transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-heading text-lg text-chocolate">
                            {appointment.customer_name}
                          </h4>
                          <span className={`badge-luxury border ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-xs text-coffee/50">
                          Ref: {appointment.reference_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-chocolate font-medium flex items-center gap-2">
                          <Clock size={14} /> {appointment.start_time} - {appointment.end_time}
                        </p>
                        <p className="text-xs text-coffee/50 mt-1">
                          {appointment.appointment_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-coffee/50 text-xs mb-1">Email</p>
                        <p className="text-chocolate">{appointment.email}</p>
                      </div>
                      <div>
                        <p className="text-coffee/50 text-xs mb-1">Phone</p>
                        <p className="text-chocolate">{appointment.phone}</p>
                      </div>
                      <div>
                        <p className="text-coffee/50 text-xs mb-1">Communication</p>
                        <p className="text-chocolate capitalize">{appointment.communication_method}</p>
                      </div>
                      <div>
                        <p className="text-coffee/50 text-xs mb-1">Booked On</p>
                        <p className="text-chocolate">
                          {new Date(appointment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {appointment.project_description && (
                      <div className="mb-4">
                        <p className="text-xs text-coffee/50 mb-1">Project Description</p>
                        <p className="text-chocolate text-sm bg-cream/30 p-3 rounded-sm">
                          {appointment.project_description}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-beige/20">
                      <a
                        href={createWhatsAppLink(
                          `Hi ${appointment.customer_name}! Regarding your appointment on ${appointment.appointment_date}...`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline flex items-center gap-2"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                      {appointment.status === 'requested' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                            className="btn-primary flex items-center gap-2"
                          >
                            <CheckCircle size={14} /> Confirm
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'rejected')}
                            className="btn-outline flex items-center gap-2"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                          className="btn-primary flex items-center gap-2"
                        >
                          <CheckCircle size={14} /> Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
              <p className="text-coffee/40">No appointments found</p>
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-label tracking-wider uppercase text-coffee/70 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="text-center py-12 text-coffee/40">
            Calendar view - {filteredAppointments.length} appointments
            <p className="text-sm mt-2">Use list view for detailed management</p>
          </div>
        </div>
      )}
    </div>
  );
}
