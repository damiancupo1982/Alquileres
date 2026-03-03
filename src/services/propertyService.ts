import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Property {
  id: string;
  name: string;
  type: 'departamento' | 'galpon' | 'local' | 'oficina' | 'otro';
  building: string;
  address: string;
  rent: number;
  expenses: number;
  status: 'disponible' | 'ocupado' | 'mantenimiento';
  tenant: string | null;
  contractStart: string;
  contractEnd: string;
  nextUpdateDate: string;
  notes: string;
  lastUpdated: string;
  createdAt?: Timestamp;
}

const PROPERTIES_COLLECTION = 'properties';

// Obtener todas las propiedades en tiempo real
export const subscribeToProperties = (
  callback: (properties: Property[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    const q = query(collection(db, PROPERTIES_COLLECTION));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const properties: Property[] = [];
        querySnapshot.forEach((doc) => {
          properties.push({
            id: doc.id,
            ...doc.data(),
          } as Property);
        });
        callback(properties);
      },
      (error) => {
        console.error('Error al escuchar propiedades:', error);
        if (onError) onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error en subscribeToProperties:', error);
    if (onError) onError(error as Error);
  }
};

// Obtener todas las propiedades (una sola vez)
export const getProperties = async (): Promise<Property[]> => {
  try {
    const q = query(collection(db, PROPERTIES_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    const properties: Property[] = [];
    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data(),
      } as Property);
    });
    
    return properties;
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    throw error;
  }
};

// Agregar nueva propiedad
export const addProperty = async (property: Omit<Property, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), {
      ...property,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar propiedad:', error);
    throw error;
  }
};

// Actualizar propiedad
export const updateProperty = async (
  id: string,
  updates: Partial<Property>
): Promise<void> => {
  try {
    const propertyRef = doc(db, PROPERTIES_COLLECTION, id);
    await updateDoc(propertyRef, updates);
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    throw error;
  }
};

// Eliminar propiedad
export const deleteProperty = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PROPERTIES_COLLECTION, id));
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    throw error;
  }
};