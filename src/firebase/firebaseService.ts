// src/firebase/firebaseService.ts
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  DocumentData,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";

// Define collection names
const COLLECTIONS = {
  TOPICS: "topics",
  RESEARCH_NOTES: "researchNotes",
  CONTENT_PLANS: "contentPlans",
  SCRIPTS: "scripts",
  USER_SETTINGS: "userSettings",
};

// Helper to convert Firestore timestamps to Date objects
export const convertTimestamps = (doc: DocumentData) => {
  const result = { ...doc };

  // Convert Firestore timestamps to Date objects
  Object.keys(result).forEach((key) => {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    } else if (typeof result[key] === "object" && result[key] !== null) {
      // Handle nested objects (but not arrays)
      if (result[key] && !Array.isArray(result[key])) {
        result[key] = convertTimestamps(result[key]);
      }
    }
  });

  return result;
};

// Generic function to fetch all documents from a collection
export const getCollection = async (collectionName: string) => {
  try {
    const q = query(
      collection(db, collectionName),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const data: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      data.push({
        id: doc.id,
        ...convertTimestamps(docData),
      });
    });

    return data;
  } catch (error) {
    console.error(`Error getting ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to fetch a single document from a collection
export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const docData = docSnap.data();
      return {
        id: docSnap.id,
        ...convertTimestamps(docData),
      };
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to add a document to a collection
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const id = crypto.randomUUID();
    const docRef = doc(db, collectionName, id);

    const timestamp = serverTimestamp();
    const documentData = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc(docRef, documentData);

    // Return the created document data with the ID
    return {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to update a document
export const updateDocument = async (
  collectionName: string,
  id: string,
  data: any
) => {
  try {
    const docRef = doc(db, collectionName, id);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updateData);

    // Return the updated document data
    return {
      id,
      ...data,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to delete a document
export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// Function to save user settings
export const saveUserSettings = async (settings: any) => {
  try {
    // We use 'user-settings' as a fixed ID since we only have one user
    const docRef = doc(db, COLLECTIONS.USER_SETTINGS, "user-settings");

    const settingsData = {
      ...settings,
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, settingsData, { merge: true });
    return settings;
  } catch (error) {
    console.error("Error saving user settings:", error);
    throw error;
  }
};

// Function to save favorite topics
export const saveFavoriteTopics = async (favoriteTopics: string[]) => {
  try {
    // We use 'user-settings' as a fixed ID since we only have one user
    const docRef = doc(db, COLLECTIONS.USER_SETTINGS, "user-settings");

    const settingsData = {
      favoriteTopics,
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, settingsData, { merge: true });
    return favoriteTopics;
  } catch (error) {
    console.error("Error saving favorite topics:", error);
    throw error;
  }
};

// Function to get user settings
export const getUserSettings = async () => {
  try {
    const docRef = doc(db, COLLECTIONS.USER_SETTINGS, "user-settings");
    const docSnap = await getDocs(collection(db, COLLECTIONS.USER_SETTINGS));

    if (docSnap.empty) {
      return null;
    }

    const settings: any = {};
    docSnap.forEach((doc) => {
      if (doc.id === "user-settings") {
        Object.assign(settings, convertTimestamps(doc.data()));
      }
    });

    return settings;
  } catch (error) {
    console.error("Error getting user settings:", error);
    throw error;
  }
};

// Specific collection operations
export const getTopics = () => getCollection(COLLECTIONS.TOPICS);
export const getTopic = (id: string) => getDocument(COLLECTIONS.TOPICS, id);
export const addTopic = (data: any) => addDocument(COLLECTIONS.TOPICS, data);
export const updateTopic = (id: string, data: any) =>
  updateDocument(COLLECTIONS.TOPICS, id, data);
export const deleteTopic = (id: string) =>
  deleteDocument(COLLECTIONS.TOPICS, id);

export const getResearchNotes = () => getCollection(COLLECTIONS.RESEARCH_NOTES);
export const getResearchNote = (id: string) =>
  getDocument(COLLECTIONS.RESEARCH_NOTES, id);
export const addResearchNote = (data: any) =>
  addDocument(COLLECTIONS.RESEARCH_NOTES, data);
export const updateResearchNote = (id: string, data: any) =>
  updateDocument(COLLECTIONS.RESEARCH_NOTES, id, data);
export const deleteResearchNote = (id: string) =>
  deleteDocument(COLLECTIONS.RESEARCH_NOTES, id);

export const getContentPlans = () => getCollection(COLLECTIONS.CONTENT_PLANS);
export const getContentPlan = (id: string) =>
  getDocument(COLLECTIONS.CONTENT_PLANS, id);
export const addContentPlan = (data: any) =>
  addDocument(COLLECTIONS.CONTENT_PLANS, data);
export const updateContentPlan = (id: string, data: any) =>
  updateDocument(COLLECTIONS.CONTENT_PLANS, id, data);
export const deleteContentPlan = (id: string) =>
  deleteDocument(COLLECTIONS.CONTENT_PLANS, id);

export const getScripts = () => getCollection(COLLECTIONS.SCRIPTS);
export const getScript = (id: string) => getDocument(COLLECTIONS.SCRIPTS, id);
export const addScript = (data: any) => addDocument(COLLECTIONS.SCRIPTS, data);
export const updateScript = (id: string, data: any) =>
  updateDocument(COLLECTIONS.SCRIPTS, id, data);
export const deleteScript = (id: string) =>
  deleteDocument(COLLECTIONS.SCRIPTS, id);

// Export the collections object for reference
export { COLLECTIONS };
