import { db } from '@/lib/firebase';
import { collection, addDoc, query, getDocs, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
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

export const updateAnalysis = async (userId: string, analysis: StockAnalysis) => {
  try {
    const analysesRef = collection(db, 'users', userId, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const docRef = querySnapshot.docs.find(doc => doc.data().symbol === analysis.symbol);
    if (!docRef) {
      throw new Error('Analysis not found');
    }

    await updateDoc(docRef.ref, {
      ...analysis,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating analysis:', error);
    throw error;
  }
};

export const getUserAnalyses = async (userId: string) => {
  try {
    const analysesRef = collection(db, 'users', userId, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        symbol: data.symbol,
        companyName: data.companyName,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        news: data.news,
        sentiment: data.sentiment,
        aiInsight: data.aiInsight,
        date: data.date,
      } as StockAnalysis;
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    throw error;
  }
}; 