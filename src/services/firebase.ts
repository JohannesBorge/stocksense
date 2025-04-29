import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { StockAnalysis } from '@/types/stock';

export const saveAnalysis = async (userId: string, analysis: StockAnalysis) => {
  try {
    const analysesRef = collection(db, 'users', userId, 'analyses');
    await addDoc(analysesRef, {
      ...analysis,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

export const getUserAnalyses = async (userId: string) => {
  try {
    const analysesRef = collection(db, 'users', userId, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as StockAnalysis[];
  } catch (error) {
    console.error('Error fetching analyses:', error);
    throw error;
  }
}; 