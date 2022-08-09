import AsyncStorage from '@react-native-async-storage/async-storage';

const saveValue = async (
  key: string,
  value?: string | null,
): Promise<boolean> => {
  try {
    if (typeof value === 'string' && value !== '') {
      await AsyncStorage.setItem(key, value);
    } else {
      await AsyncStorage.removeItem(key);
    }

    return true;
  } catch (e) {
    // saving error
    return false;
  }
};

export const loadValue = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    // error reading value
    return null;
  }
};

async function removeValue(key: string): Promise<void | null> {
  try {
    return await AsyncStorage.removeItem(key);
  } catch (exception) {
    return null;
  }
}

export async function load(key: string): Promise<any | null> {
  try {
    const almostThere = await AsyncStorage.getItem(key);
    return JSON.parse(almostThere);
  } catch {
    return null;
  }
}

export async function save(key: string, value: any): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
