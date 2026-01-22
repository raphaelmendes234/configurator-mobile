// Joystick phase
export function buildPhase1Message(state: string, index: number) {
  const device = "mobile";
  const phase = "selection";

  return {
    device,
    phase,
    state,
    index,
  };
}

// Slingshot
export function buildPhase2Message(
  state: string,
  strength: number,
  angleH: number,
  angleV: number,
) {
  const device = "mobile";
  const phase = "throwing";

  return {
    device,
    phase,
    state,
    strength,
    angleH,
    angleV,
  };
}

// skip title
export function buildSkipTitleMessage(state: string) {
  const device = "mobile";
  const phase = "title";

  return {
    device,
    phase,
    state,
  };
}

// skip intro
export function buildSkipIntroMessage(state: string) {
  const device = "mobile";
  const phase = "intro";

  return {
    device,
    phase,
    state,
  };
}

// skip outro
export function buildSkipOutroMessage(state: string) {
  const device = "mobile";
  const phase = "outro";

  return {
    device,
    phase,
    state,
  };
}

// calibrate outro
export function buildCalibrateMessage(state: string) {
  const device = "mobile";
  const phase = "calibrate";

  return {
    device,
    phase,
    state,
  };
}
