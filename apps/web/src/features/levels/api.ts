export const getLevel = (levelNumber: number) =>
  fetch(`${import.meta.env.VITE_API_BASE_URL}/levels/${levelNumber}`)
