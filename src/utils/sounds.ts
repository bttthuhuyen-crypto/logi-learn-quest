const LEVEL_UP_SOUND_URL = '/sounds/level-up.mp3';

export async function playLevelUpSound(): Promise<void> {
  try {
    const audio = new Audio(LEVEL_UP_SOUND_URL);
    audio.volume = 0.5;
    await audio.play();
  } catch (error) {
    // Ignore if autoplay is blocked or file not found
    console.log('Could not play sound:', error);
  }
}
