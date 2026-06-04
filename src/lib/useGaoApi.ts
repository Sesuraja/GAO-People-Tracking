import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { gaoApi, RealtimeTag, HistoryRecord } from './gaoApi';

export function useGaoRealtime(pollingIntervalMs = 2000) {
  const [tags, setTags] = useState<RealtimeTag[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Listen to live_tags from Firestore
    const q = query(collection(db, 'live_tags'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isMounted) return;
      const data: RealtimeTag[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data() as RealtimeTag);
      });
      setTags(data);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      if (!isMounted) return;
      console.error(err);
      setError(new Error(err.message));
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { tags, error, isLoading };
}

export function useGaoHistory(skip: number, take: number) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const [data, count] = await Promise.all([
           gaoApi.getHistoryRecords(skip, take),
           gaoApi.getHistoryTotalCount()
        ]);
        if (isMounted) {
          setRecords(data);
          setTotalCount(count);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [skip, take]);

  return { records, totalCount, error, isLoading };
}
