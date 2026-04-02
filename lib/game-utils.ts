// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate random position assignment
export function generateRandomAssignment(
  playerCount: number,
  positionCount: number
): Record<string, number> {
  const assignment: Record<string, number> = {};
  const positions = Array.from({ length: positionCount }, (_, i) => i + 1);
  const shuffledPositions = shuffleArray(positions);

  for (let i = 0; i < playerCount && i < shuffledPositions.length; i++) {
    assignment[`Player ${i + 1}`] = shuffledPositions[i];
  }

  return assignment;
}

// Validate assignment (no duplicates)
export function validateAssignment(assignment: Record<string, number>): boolean {
  const values = Object.values(assignment);
  const uniqueValues = new Set(values);
  return uniqueValues.size === values.length;
}

// Check for duplicate position
export function hasDuplicatePosition(
  assignment: Record<string, number>,
  position: number
): boolean {
  return Object.values(assignment).includes(position);
}
