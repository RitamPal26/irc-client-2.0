import { useRef } from 'react';

const useSound = () => {
  const audioRef = useRef(null);

  const playNotificationSound = () => {
    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/ping.mp3');
        audioRef.current.volume = 0.3;
      }
      
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    } catch (error) {
      console.log('Sound notification failed:', error);
    }
  };

  return { playNotificationSound };
};

export default useSound;
