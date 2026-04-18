import { useEffect, useState } from 'react';
import api from '../../services/api';

const TicketSLABadge = ({ ticketId }) => {
  const [sla, setSla] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSla = async () => {
      setLoading(true);
      try {
        const response = await api.get('/tickets/' + ticketId + '/sla');
        setSla(response.data.data);
      } catch {
        setSla(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSla();
  }, [ticketId]);

  if (loading) {
    return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>;
  }

  if (sla == null) {
    return null;
  }

  let borderClass = 'border-green-500';
  let barClass = 'bg-green-500';
  let badgeClass = 'bg-green-100 text-green-800';

  if (sla.slaStatus === 'AT_RISK') {
    borderClass = 'border-yellow-500';
    barClass = 'bg-yellow-500';
    badgeClass = 'bg-yellow-100 text-yellow-800';
  } else if (sla.slaStatus === 'BREACHED') {
    borderClass = 'border-red-500';
    barClass = 'bg-red-500';
    badgeClass = 'bg-red-100 text-red-800';
  }

  return (
    <div className={'bg-white rounded-xl shadow-sm p-4 border-l-4 mb-4 ' + borderClass}>
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold text-gray-800">⏱️ SLA Status</div>
        <span className={'text-xs px-2 py-1 rounded-full font-medium ' + badgeClass}>{sla.slaStatus}</span>
      </div>

      <div className="flex gap-4 mt-2">
        <span className="text-sm text-gray-600">Hours Elapsed: {sla.hoursElapsed}h</span>
        <span className="text-sm text-gray-600">SLA Limit: {sla.slaLimitHours}h</span>
      </div>

      <div className="mt-3 bg-gray-200 rounded-full h-3">
        <div className={'h-3 rounded-full ' + barClass} style={{ width: sla.percentUsed + '%' }}></div>
      </div>

      <div className="mt-1 text-xs text-gray-500">
        {sla.breached
          ? '⚠️ SLA breached — ' + Math.round(sla.percentUsed) + '% of limit used'
          : Math.round(sla.percentUsed) + '% of SLA used'}
      </div>
    </div>
  );
};

export default TicketSLABadge;
