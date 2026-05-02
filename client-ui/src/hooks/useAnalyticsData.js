import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { computeAnalytics, listAttempts } from '../data/examBank';

function rowToAttempt(row) {
  return {
    id: row.id,
    title: row.title || 'Exam',
    subtitle: row.subtitle || '',
    subject: row.subject,
    level: row.level,
    percentage: row.percentage ?? 0,
    breakdown: Array.isArray(row.breakdown) ? row.breakdown : [],
    durationMin: row.duration_min ?? row.durationMin ?? 0,
    submittedAt: row.submitted_at ?? row.submittedAt,
  };
}

async function fetchAllFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(500);
    if (error || !Array.isArray(data)) return null;
    return data.map(rowToAttempt);
  } catch {
    return null;
  }
}

export default function useAnalyticsData({ days = null } = {}) {
  const [allAttempts, setAllAttempts] = useState(() => listAttempts());
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('local');
  const channelRef = useRef(null);

  const refresh = useCallback(async () => {
    if (supabase) {
      setLoading(true);
      const rows = await fetchAllFromSupabase();
      if (rows !== null) {
        setAllAttempts(rows);
        setSource('supabase');
      } else {
        setAllAttempts(listAttempts());
        setSource('local');
      }
      setLoading(false);
    } else {
      setAllAttempts(listAttempts());
      setSource('local');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase) {
      const timer = setInterval(refresh, 30000);
      return () => clearInterval(timer);
    }

    const channel = supabase
      .channel('analytics_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_attempts' }, () => {
        refresh();
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const data = computeAnalytics(allAttempts, { days });

  return { data, loading, refresh, source };
}
