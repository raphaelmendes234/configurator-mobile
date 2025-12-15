// Joystick phase
export function buildPhase1Message(state: string, index: number) {
  const device = "mobile"
  const phase = "selection"
  
  // console.log("SELECTION: " + state + " " + index)

  return {
    device,
    phase,
    state,
    index
  };
}


// Slingshot
export function buildPhase2Message(state: string, strength: number,angleH: number,angleV: number) {
  const device = "mobile"
  const phase = "throwing"

  // console.log("SLINGSHOT: " + "strength " + strength)
  // console.log("SLINGSHOT: " + "angleH " + angleH)
  // console.log("SLINGSHOT: " + "angleV " + angleV)

  return {
    device,
    phase,
    state,
    strength,
    angleH,
    angleV
  };
}