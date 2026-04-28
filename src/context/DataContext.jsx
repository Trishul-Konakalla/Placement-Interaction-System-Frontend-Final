import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext(null);
export const API = 'https://placement-interaction-system-backend.onrender.com/api';

export function DataProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dbStatus, setDbStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const fetchJobs = useCallback(() =>
    fetch(`${API}/jobs/all`).then(r => r.json()).then(setJobs).catch(() => {}), []);

  const fetchStudents = useCallback(() =>
    fetch(`${API}/students/all`).then(r => r.json()).then(setStudents).catch(() => {}), []);

  const fetchAnnouncements = useCallback(() =>
    fetch(`${API}/announcements/all`).then(r => r.json()).then(setAnnouncements).catch(() => {}), []);

  const checkDb = useCallback(() => {
    fetch(`${API}/jobs/all`)
      .then(r => { setDbStatus(r.ok ? 'online' : 'offline'); })
      .catch(() => setDbStatus('offline'));
  }, []);

  useEffect(() => {
    checkDb();
    fetchJobs();
    fetchStudents();
    fetchAnnouncements();
    // re-check every 30s
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, [checkDb, fetchJobs, fetchStudents, fetchAnnouncements]);

  return (
    <DataContext.Provider value={{ jobs, students, announcements, fetchJobs, fetchStudents, fetchAnnouncements, dbStatus, API }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
