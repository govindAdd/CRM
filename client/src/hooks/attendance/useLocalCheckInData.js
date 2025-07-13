export const useLocalCheckInData = () => {
    const KEY = "pending_checkin_data";
  
    const save = (data) => localStorage.setItem(KEY, JSON.stringify(data));
    const load = () => {
      try {
        return JSON.parse(localStorage.getItem(KEY));
      } catch {
        return null;
      }
    };
    const clear = () => localStorage.removeItem(KEY);
  
    return { save, load, clear };
  };