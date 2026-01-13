import confetti from 'canvas-confetti';

export function useLevelUpConfetti() {
  const fire = () => {
    // Burst from left
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1'],
    });

    // Burst from right
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1'],
    });

    // Star confetti from center (delayed)
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 360,
        startVelocity: 30,
        origin: { x: 0.5, y: 0.3 },
        shapes: ['star'],
        colors: ['#FFD700', '#FFC107'],
      });
    }, 200);
  };

  return { fire };
}
